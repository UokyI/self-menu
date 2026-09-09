# Self Menu

Run custom shell commands directly from a right-click submenu in VS Code.

![Version](https://img.shields.io/badge/version-0.0.6-blue)

**English** | [简体中文](README.zh-CN.md)

## Features

- Adds a **Self Menu** submenu to the editor and Explorer context menus
- Each menu item opens the integrated terminal and runs your configured shell command
- Every menu item can have its own working directory (`cwd`)
- Placeholder variables are expanded automatically

## What it looks like

```
Right-click in Editor or Explorer
└── Self Menu ▶
    ├── Your Command 1
    ├── Your Command 2
    └── Self Menu: Configure Items
```

## Quick Start

1. Install the extension.
2. Right-click anywhere in the editor or Explorer and choose **Self Menu ▶ Self Menu: Configure Items**.
3. Add menu items and click **Save**.
4. Click **Reload Window (Apply Changes)** — the submenu now shows your commands.

> Reloading is required after adding/changing items because VS Code context menus are static once the window loads.

## Configuration

You can also configure items directly in `settings.json`:

```json
{
  "self-menu.items": [
    {
      "label": "Build",
      "command": "npm run build",
      "description": "Build the project"
    },
    {
      "label": "Git Pull",
      "command": "git pull",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

### Item fields

| Field         | Required | Description                                                      |
|---------------|----------|------------------------------------------------------------------|
| `label`       | Yes      | Display name in the context menu                                 |
| `command`     | Yes      | Shell command to execute                                         |
| `description` | No       | Short description shown in the QuickPick fallback                |
| `cwd`         | No       | Working directory of the terminal (defaults to the workspace)    |

### Placeholder variables

| Variable              | Description                                   |
|-----------------------|-----------------------------------------------|
| `${workspaceFolder}`  | Root folder of the current workspace          |
| `${file}` / `${path}` | Absolute path of the right-clicked resource   |
| `${dir}`              | Directory of the right-clicked resource       |
| `${name}`             | File/folder name with extension               |
| `${basename}`         | File/folder name without extension            |
| `${extname}`          | File extension                                |

Variables are replaced in both `command` and `cwd`.

## Requirements

- VS Code 1.74 or later

## Known Limitations

- Context menu items are registered when the window loads, so a window reload is needed after changing the configuration.
- The extension writes the generated menu entries back into its own `package.json`, which requires a writable extension install directory.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for details.

## License

MIT