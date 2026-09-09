# Change Log

All notable changes to the "self-menu" extension are documented in this file.

## [0.0.6] - 2026-09-09

### Added

- English metadata, README and CHANGELOG for Marketplace publishing.

## [0.0.5] - 2026-09-09

### Changed

- Clicking "Add Item" now inserts the new item at the top of the list in the configuration panel
  and focuses its label input.

## [0.0.4] - 2026-09-09

### Added

- "Reload Window (Apply Changes)" button in the configuration panel.

## [0.0.3] - 2026-09-09

### Fixed

- Removed the empty `activationEvents` so the extension activates automatically when a
  contributed command is invoked. This fixes `command not found` errors after installing
  the packaged VSIX.

## [0.0.2] - 2026-09-08

### Added

- Native right-click submenu generated from the configured items.
- The configuration is written back into the extension's `package.json` on save; a window
  reload makes the new submenu items appear.

## [0.0.1] - 2026-09-08

### Added

- Initial release: right-click "Self Menu" opens a QuickPick with configured shell commands.
- Visual configuration panel (webview) to add/edit/delete menu items.
- Placeholder variable substitution (`${workspaceFolder}`, `${file}`, `${dir}`, etc.).