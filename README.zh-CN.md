# Self Sub Menu

在 VS Code 右键菜单中直接运行自定义 Shell 命令。

![Version](https://img.shields.io/badge/version-0.0.4-blue)

[English](README.md) | **简体中文**

## 概览

Self Sub Menu 是一款轻量级 VS Code 扩展，它会在编辑器和资源管理器的右键菜单中加入自定义子菜单。每个菜单项都会打开集成终端并执行你配置的命令，同时支持按项设置工作目录和占位变量替换。

## 功能特性

- 在编辑器和资源管理器右键菜单中添加 Self Sub Menu 子菜单
- 点击菜单项后直接打开集成终端并执行 Shell 命令
- 每个菜单项都可以单独设置 `cwd` 工作目录
- 自动替换 `${workspaceFolder}`、`${file}`、`${dir}`、`${name}` 等变量
- 可通过内置配置面板，或直接修改 `settings.json` 进行管理

## 菜单示例

```text
在编辑器或资源管理器中右键
└── Self Sub Menu ▶
    ├── Build
    ├── Run Tests
    ├── Git Pull
    ├── Reload
    └── Configure Items
```

## 快速开始

1. 在 VS Code 中安装该扩展。
2. 在编辑器或资源管理器中右键点击任意位置。
3. 选择 Self Sub Menu ▶ Self Sub Menu: Configure Items。
4. 添加或编辑菜单项，然后点击 Save 保存。
5. 点击 Reload Window 重新加载窗口，以刷新右键菜单。

> 上下文菜单会在窗口加载时生成，因此修改菜单项后需要重载窗口才能生效。

## 配置方式

也可以直接在 VS Code 的 settings.json 中配置：

```json
{
  "self-sub-menu.items": [
    {
      "label": "构建",
      "command": "npm run build",
      "description": "构建项目"
    },
    {
      "label": "Git Pull",
      "command": "git pull",
      "cwd": "${workspaceFolder}"
    },
    {
      "label": "打开当前文件",
      "command": "code ${file}",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

### 菜单项字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `label` | 是 | 子菜单中显示的名称 |
| `command` | 是 | 要在终端中执行的 Shell 命令 |
| `description` | 否 | 配置界面中的辅助说明 |
| `cwd` | 否 | 当前命令的工作目录；未设置时默认使用工作区根目录 |

### 占位变量

以下变量可用于 `command` 和 `cwd`：

| 变量 | 说明 |
| --- | --- |
| `${workspaceFolder}` | 当前工作区的根目录 |
| `${file}` / `${path}` | 当前右键资源的绝对路径 |
| `${dir}` | 当前右键资源所在目录 |
| `${name}` | 文件或文件夹名称（含扩展名） |
| `${basename}` | 文件或文件夹名称（不含扩展名） |
| `${extname}` | 文件扩展名 |

## 内置命令

扩展会提供这些命令：

- Self Sub Menu: Configure Items
- Self Sub Menu: Reload
- 根据配置项动态生成的执行命令

## 环境要求

- VS Code 1.74 及以上版本

## 说明

- 扩展会将生成的菜单项写回自己的 manifest，因此菜单项会出现在右键菜单中。
- 由于扩展会修改自身安装目录中的配置文件，因此需要确保该目录可写。

## 版本记录

详见 [CHANGELOG.md](CHANGELOG.md)。

## 许可证

MIT