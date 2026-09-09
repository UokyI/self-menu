import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface MenuItem {
  label: string;
  command: string;
  description?: string;
  cwd?: string;
}

const RUN_PREFIX = 'self-menu.run.';
const CONFIGURE_CMD = 'self-menu.configure';

const tl = (message: string, ...args: any[]): string =>
  vscode.l10n.t(message, ...args);

function getItems(): MenuItem[] {
  const config = vscode.workspace.getConfiguration('self-menu');
  return config.get<MenuItem[]>('items', []);
}

function setItems(items: MenuItem[]): Thenable<void> {
  const config = vscode.workspace.getConfiguration('self-menu');
  return config.update('items', items, vscode.ConfigurationTarget.Global);
}

function getWorkspaceFolder(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function getResourceUri(args: unknown[]): vscode.Uri | undefined {
  for (const arg of args) {
    if (arg && typeof arg === 'object' && 'fsPath' in arg) {
      const fsPath = (arg as { fsPath?: string }).fsPath;
      return fsPath ? vscode.Uri.file(fsPath) : undefined;
    }
  }
  return undefined;
}

function resolvePlaceholders(text: string, workspaceFolder: string | undefined, resource?: vscode.Uri): string {
  const replacer: Record<string, string | undefined> = {
    '${workspaceFolder}': workspaceFolder,
    '${cwd}': workspaceFolder
  };

  if (resource) {
    const file = resource.fsPath;
    const dir = path.dirname(file);
    const name = path.basename(file);
    const ext = path.extname(file);
    const baseNoExt = name.slice(0, name.length - ext.length);

    replacer['${file}'] = file;
    replacer['${path}'] = file;
    replacer['${dir}'] = dir;
    replacer['${name}'] = name;
    replacer['${extname}'] = ext;
    replacer['${basename}'] = baseNoExt;
  }

  let result = text;
  for (const [key, value] of Object.entries(replacer)) {
    if (value !== undefined) {
      result = result.split(key).join(value);
    }
  }
  return result;
}

function executeCommand(command: string, cwd?: string): void {
  const terminal = vscode.window.createTerminal({
    name: 'Self Menu',
    cwd: cwd
  });
  terminal.show(true);
  terminal.sendText(command);
}

function runItem(item: MenuItem, args: unknown[]): void {
  const resource = getResourceUri(args);
  const workspaceFolder = getWorkspaceFolder();
  const command = resolvePlaceholders(item.command, workspaceFolder, resource);
  const cwd = item.cwd
    ? resolvePlaceholders(item.cwd, workspaceFolder, resource)
    : workspaceFolder;
  executeCommand(command, cwd);
}

interface ManifestCommand {
  command: string;
  title: string;
  category: string;
}

interface ManifestMenuEntry {
  command?: string;
  submenu?: string;
  group?: string;
}

function buildContributes(items: MenuItem[]): any {
  const commands: ManifestCommand[] = [
    { command: CONFIGURE_CMD, title: '%self-menu.command.configure%', category: 'Self Menu' },
    { command: 'self-menu.execute', title: '%self-menu.command.execute%', category: 'Self Menu' }
  ];

  const submenuEntries: ManifestMenuEntry[] = [];
  items.forEach((item, i) => {
    const id = RUN_PREFIX + i;
    commands.push({ command: id, title: item.label || 'Self Menu', category: 'Self Menu' });
    submenuEntries.push({ command: id, group: 'self-menu' });
  });
  submenuEntries.push({ command: CONFIGURE_CMD, group: 'self-menu@99' });

  return {
    commands,
    menus: {
      'editor/context': [{ submenu: 'self-menu.submenu', group: 'self-menu@1' }],
      'explorer/context': [{ submenu: 'self-menu.submenu', group: 'self-menu@1' }],
      'self-menu.submenu': submenuEntries
    },
    submenus: [{ id: 'self-menu.submenu', label: '%self-menu.submenu.label%' }]
  };
}

function getManifestPath(context: vscode.ExtensionContext): string {
  return path.join(context.extensionPath, 'package.json');
}

function currentRunCount(manifest: any): number {
  const commands: ManifestCommand[] = manifest?.contributes?.commands || [];
  return commands.filter((c: ManifestCommand) => c.command.startsWith(RUN_PREFIX)).length;
}

function syncManifest(context: vscode.ExtensionContext, items: MenuItem[]): void {
  const manifestPath = getManifestPath(context);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const config = manifest.contributes.configuration;
  const contributes = buildContributes(items);
  contributes.configuration = config;

  manifest.contributes = contributes;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

function syncManifestIfNeeded(context: vscode.ExtensionContext, items: MenuItem[]): void {
  try {
    const manifest = JSON.parse(fs.readFileSync(getManifestPath(context), 'utf8'));
    if (currentRunCount(manifest) !== items.length) {
      syncManifest(context, items);
      vscode.window.showInformationMessage(
        tl('Self Menu: menu items changed. Reload the window to update the context submenu.'),
        tl('Reload Window')
      ).then(sel => {
        if (sel === tl('Reload Window')) {
          vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
      });
    }
  } catch {
    // ignore manifest sync errors
  }
}

class ConfigPanel {
  public static currentPanel: ConfigPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;
  private disposables: vscode.Disposable[] = [];

  public static create(context: vscode.ExtensionContext): void {
    if (ConfigPanel.currentPanel) {
      ConfigPanel.currentPanel.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'self-menu-config',
      'Self Menu Settings',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    ConfigPanel.currentPanel = new ConfigPanel(panel, context);
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this.panel = panel;
    this.context = context;
    this.panel.webview.html = this.getHtml();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(this.handleMessage.bind(this), null, this.disposables);
  }

  private async handleMessage(message: any): Promise<void> {
    switch (message.type) {
      case 'load': {
        const items = getItems();
        this.panel.webview.postMessage({ type: 'data', items });
        break;
      }
      case 'save': {
        const items: MenuItem[] = (message.items || []).map((it: any) => ({
          label: String(it.label || '').trim(),
          command: String(it.command || ''),
          description: it.description ? String(it.description) : undefined,
          cwd: it.cwd ? String(it.cwd) : undefined
        })).filter((it: MenuItem) => it.label && it.command);

        await setItems(items);
        try {
          syncManifest(this.context, items);
        } catch (err: any) {
          vscode.window.showErrorMessage(tl('Failed to write back package.json: {0}', err.message));
          break;
        }
        this.dispose();
        vscode.window.showInformationMessage(
          tl('Self Menu: settings saved. Reload the window to update the context submenu.'),
          tl('Reload Window')
        ).then(sel => {
          if (sel === tl('Reload Window')) {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
          }
        });
        break;
      }
      case 'reload': {
        this.dispose();
        vscode.commands.executeCommand('workbench.action.reloadWindow');
        break;
      }
      case 'error': {
        vscode.window.showErrorMessage(message.message || tl('Operation failed'));
        break;
      }
    }
  }

  private getHtml(): string {
    const isZh = /^zh/i.test(vscode.env.language);
    const langTag = isZh ? 'zh-CN' : 'en';
    const unnamed = tl('Unnamed');
    const varHelp = tl(
      'Placeholder variables for command and cwd: {placeholders} — workspace root, right-clicked resource path, its directory, file/folder name (with extension), file name (without extension), extension, full path.',
      { placeholders: '${workspaceFolder} ${file} ${dir} ${name} ${basename} ${extname} ${path}' }
    );
    return `<!DOCTYPE html>
<html lang="${langTag}">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: var(--vscode-font-family); padding: 16px; color: var(--vscode-foreground); }
  h1 { font-size: 18px; }
  .hint { color: var(--vscode-descriptionForeground); font-size: 12px; margin-bottom: 12px; }
  .item { border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 12px; margin-bottom: 12px; background: var(--vscode-editorWidget-background); }
  .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .item-title { font-weight: bold; }
  .field { margin-bottom: 8px; }
  .field label { display: block; font-size: 12px; margin-bottom: 3px; color: var(--vscode-descriptionForeground); }
  input[type=text] { width: 100%; box-sizing: border-box; padding: 5px 8px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 3px; }
  .btn { cursor: pointer; border: none; padding: 5px 12px; border-radius: 3px; font-size: 12px; }
  .btn-primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  .btn-danger { background: var(--vscode-errorForeground); color: white; }
  .btn-ghost { background: transparent; color: var(--vscode-foreground); border: 1px solid var(--vscode-panel-border); }
  .toolbar { margin-bottom: 16px; }
  .placeholder { color: var(--vscode-descriptionForeground); font-size: 11px; margin-top: 2px; }
  .empty { color: var(--vscode-descriptionForeground); padding: 20px 0; }
</style>
</head>
<body>
<h1>${tl('Self Menu Items')}</h1>
<div class="hint">${tl('Saved items are written into the extension manifest and shown in the right-click submenu. Each item opens a terminal and runs the configured command.')}</div>
<div class="hint">${varHelp}</div>
<div class="toolbar">
  <button class="btn btn-primary" id="addBtn">${tl('+ Add Item')}</button>
  <button class="btn btn-ghost" id="saveBtn" style="margin-left:8px">${tl('Save')}</button>
  <button class="btn btn-ghost" id="reloadBtn" style="margin-left:8px">${tl('Reload Window (Apply Changes)')}</button>
</div>
<div class="hint">${tl('Tip: after adding/modifying/deleting items, click "Save", then "Reload Window" to update the context submenu.')}</div>
<div id="list"></div>
<div id="empty" class="empty" style="display:none">${tl('No items yet. Click "Add Item" to start.')}</div>
<script>
  const vscode = acquireVsCodeApi();
  let items = [];

  function render() {
    const list = document.getElementById('list');
    const empty = document.getElementById('empty');
    list.innerHTML = '';
    empty.style.display = items.length === 0 ? 'block' : 'none';
    items.forEach((it, idx) => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML =
        '<div class="item-header">' +
          '<span class="item-title" data-idx="' + idx + '">' + esc(it.label || '${unnamed}') + '</span>' +
          '<button class="btn btn-danger" data-del="' + idx + '">${tl('Delete')}</button>' +
        '</div>' +
        '<div class="field"><label>${tl('Menu Name (label)')}</label><input type="text" data-field="label" data-idx="' + idx + '" value="' + esc(it.label) + '"></div>' +
        '<div class="field"><label>${tl('Shell Command (command)')}</label><input type="text" data-field="command" data-idx="' + idx + '" value="' + esc(it.command) + '"><div class="placeholder">${tl('e.g. npm run build')}</div></div>' +
        '<div class="field"><label>${tl('Description (optional)')}</label><input type="text" data-field="description" data-idx="' + idx + '" value="' + esc(it.description || '') + '"></div>' +
        '<div class="field"><label>${tl('Working Directory (optional cwd)')}</label><input type="text" data-field="cwd" data-idx="' + idx + '" value="' + esc(it.cwd || '') + '"><div class="placeholder">${tl('Leave empty to use the workspace root')}</div></div>';
      list.appendChild(div);
    });
  }

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  document.getElementById('addBtn').addEventListener('click', () => {
    items.unshift({ label: '${tl('New Item')}', command: '', description: '', cwd: '' });
    render();
    const first = document.querySelector('.item input[data-field="label"]');
    if (first) { first.focus(); first.select(); }
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    vscode.postMessage({ type: 'save', items: items.map(it => ({
      label: it.label, command: it.command, description: it.description || undefined, cwd: it.cwd || undefined
    }))});
  });

  document.getElementById('reloadBtn').addEventListener('click', () => {
    vscode.postMessage({ type: 'reload' });
  });

  document.getElementById('list').addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.field) {
      items[el.dataset.idx][el.dataset.field] = el.value;
      if (el.dataset.field === 'label') {
        const title = list.querySelector('.item-title[data-idx="'+el.dataset.idx+'"]');
        if (title) title.textContent = el.value || '${unnamed}';
      }
    }
  });

  document.getElementById('list').addEventListener('click', (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.del !== undefined) {
      items.splice(Number(el.dataset.del), 1);
      render();
    }
  });

  window.addEventListener('message', (e) => {
    const msg = e.data;
    if (msg.type === 'data') { items = msg.items || []; render(); }
  });

  vscode.postMessage({ type: 'load' });
</script>
</body>
</html>`;
  }

  private dispose(): void {
    ConfigPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) { d.dispose(); }
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const items = getItems();
  syncManifestIfNeeded(context, items);

  items.forEach((item, i) => {
    const id = RUN_PREFIX + i;
    const disposable = vscode.commands.registerCommand(
      id,
      (...args: unknown[]) => runItem(item, args)
    );
    context.subscriptions.push(disposable);
  });

  const executeDisposable = vscode.commands.registerCommand('self-menu.execute', (...args: unknown[]) => {
    const itemsArr = getItems();
    if (itemsArr.length === 0) {
      vscode.window.showWarningMessage(
        tl('Self Menu: no items configured yet.'),
        tl('Open Settings')
      ).then(sel => {
        if (sel === tl('Open Settings')) {
          ConfigPanel.create(context);
        }
      });
      return;
    }

    const resource = getResourceUri(args);
    const workspaceFolder = getWorkspaceFolder();
    const quickItem: (vscode.QuickPickItem & { item: MenuItem })[] = itemsArr.map(item => ({
      label: item.label,
      description: item.description || item.command,
      detail: item.cwd
        ? tl('cwd: {0}', resolvePlaceholders(item.cwd, workspaceFolder, resource))
        : undefined,
      item: item
    }));

    vscode.window.showQuickPick(quickItem, {
      placeHolder: tl('Select a command to run, press ESC to cancel'),
      matchOnDescription: true,
      matchOnDetail: true
    }).then(selected => {
      if (!selected) {
        return;
      }
      runItem(selected.item, args);
    });
  });

  const configureDisposable = vscode.commands.registerCommand(CONFIGURE_CMD, () => {
    ConfigPanel.create(context);
  });

  context.subscriptions.push(executeDisposable, configureDisposable);
}

export function deactivate() {}