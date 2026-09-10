# Self Sub Menu

Run custom Shell commands directly from a VS Code context menu.

![Version](https://img.shields.io/badge/version-0.0.4-blue)

**English** | [简体中文](README.zh-CN.md)

## Overview

Self Sub Menu is a lightweight VS Code extension that adds a custom submenu to the editor and Explorer context menus. Each menu item opens the integrated terminal and executes a command you define, with optional per-item working directories and placeholder expansion.

## Features

- Add a custom submenu named Self Sub Menu to the editor and Explorer right-click menu
- Open the integrated terminal and run Shell commands instantly
- Set a separate working directory for each menu item via `cwd`
- Expand variables such as `${workspaceFolder}`, `${file}`, `${dir}`, and `${name}` automatically
- Configure items through a built-in settings panel or directly in `settings.json`

## Example menu

```text
Right-click in Editor or Explorer
└── Self Sub Menu ▶
    ├── Build
    ├── Run Tests
    ├── Git Pull
    ├── Reload
    └── Configure Items
```

## Quick start

1. Install the extension in VS Code.
2. Right-click in the editor or Explorer.
3. Choose Self Sub Menu ▶ Self Sub Menu: Configure Items.
4. Add or edit menu entries and click Save.
5. Use Reload Window to refresh the context menu so the new commands appear.

> The context menu is generated when the window loads, so a reload is required after changing menu items.

## Configuration

You can configure menu items directly in your VS Code settings:

```json
{
  "self-sub-menu.items": [
    {
      "label": "Build",
      "command": "npm run build",
      "description": "Build the project"
    },
    {
      "label": "Git Pull",
      "command": "git pull",
      "cwd": "${workspaceFolder}"
    },
    {
      "label": "Open File Folder",
      "command": "code " + "${file}",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

### Item fields

| Field | Required | Description |
| --- | --- | --- |
| `label` | Yes | Text shown in the submenu |
| `command` | Yes | Shell command to run in the terminal |
| `description` | No | Short helper text for the configuration UI |
| `cwd` | No | Working directory for the command; defaults to the workspace root |

### Placeholder variables

The following variables are available in both `command` and `cwd`:

| Variable | Description |
| --- | --- |
| `${workspaceFolder}` | Root path of the current workspace |
| `${file}` / `${path}` | Absolute path of the right-clicked file or folder |
| `${dir}` | Directory of the right-clicked resource |
| `${name}` | File or folder name including extension |
| `${basename}` | File or folder name without extension |
| `${extname}` | File extension |

## Commands

The extension contributes these commands:

- Self Sub Menu: Configure Items
- Self Sub Menu: Reload
- Dynamic run commands generated from your configured menu list

## Requirements

- VS Code 1.74 or newer

## Notes

- Menu entries are synced back into the extension manifest so they appear in the context menu.
- Because the extension modifies its own manifest, the install directory must be writable.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes.

## License

MIT