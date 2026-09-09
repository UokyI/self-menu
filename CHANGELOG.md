# Change Log

All notable changes to the "self-menu" extension are documented in this file.

## [0.0.2] - 2026-09-09

### Added

- Extension icon (`logo.png`).
- English and Simplified Chinese localization (`package.nls` + `vscode.l10n`).

## [0.0.1] - 2026-09-09

### Added

- Initial release.
- Native right-click **Self Sub Menu** submenu in the editor and Explorer context menus.
- Visual configuration panel (webview) to add/edit/delete menu items with label, shell
  command, description and working directory (`cwd`).
- Generated menu entries are written back into the extension's `package.json` on save;
  a window reload makes the new submenu items appear.
- Placeholder variable substitution (`${workspaceFolder}`, `${file}`, `${dir}`, `${name}`,
  `${basename}`, `${extname}`, `${path}`).
- QuickPick fallback command (`Self Sub Menu (QuickPick)`).
- English and Simplified Chinese documentation.