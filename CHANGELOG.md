# Change Log

All notable changes to the "self-sub-menu" extension are documented in this file.

## [0.0.4] - 2026-09-10

### Changed

- Refreshed the English and Simplified Chinese README files to better describe the
  extension's actual workflow, configuration fields, placeholder variables, and runtime
  requirements.
- Bumped the extension version to 0.0.4 for the marketplace release.

## [0.0.3] - 2026-09-09

### Fixed

- Removed hard-coded test menu items that were accidentally shipped in the extension
  manifest; the submenu now only contains the built-in configuration entry.

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