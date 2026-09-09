# Self Menu

从 VS Code 右键子菜单直接运行自定义 Shell 命令。

图像徽章:[![Version](https://img.shields.io/badge/version-0.0.1-blue)](https://github.com/UokyI/self-menu)

[English](README.md) | **简体中文**

## 功能特性

- 在编辑器与资源管理器的右键菜单中加入 **Self Menu** 子菜单
- 每个菜单项点击后会打开集成终端并执行你配置的 Shell 命令
- 每个菜单项可单独配置工作目录（`cwd`）
- 自动替换占位变量

## 菜单效果

```
在编辑器或资源管理器中右键
└── Self Menu ▶
    ├── 你的命令 1
    ├── 你的命令 2
    └── Self Menu: 配置菜单项
```

## 快速开始

1. 安装扩展。
2. 在编辑器或资源管理器中任意位置右键，选择 **Self Menu ▶ Self Menu: 配置菜单项**。
3. 添加菜单项并点击 **保存**。
4. 点击 **重载窗口（使配置生效）** —— 子菜单中即会显示你的命令。

> 添加/修改菜单项后需要重载窗口，因为 VS Code 的上下文菜单在窗口加载时即为静态。

## 配置方式

你也可以直接在 `settings.json` 中配置：

```json
{
  "self-menu.items": [
    {
      "label": "构建",
      "command": "npm run build",
      "description": "构建项目"
    },
    {
      "label": "Git Pull",
      "command": "git pull",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

### 菜单项字段

| 字段          | 必填 | 说明                                    |
|---------------|------|-----------------------------------------|
| `label`       | 是   | 菜单中显示的名称                        |
| `command`     | 是   | 要执行的 Shell 命令                     |
| `description` | 否   | 在（备用的）QuickPick 列表中显示的简短说明 |
| `cwd`         | 否   | 终端的工作目录（默认使用工作区根目录）  |

### 占位变量

| 变量                    | 说明                       |
|-------------------------|----------------------------|
| `${workspaceFolder}`    | 当前工作区的根目录          |
| `${file}` / `${path}`   | 被右键资源的绝对路径        |
| `${dir}`                | 被右键资源所在的目录        |
| `${name}`               | 文件名（含扩展名）          |
| `${basename}`           | 文件名（不含扩展名）        |
| `${extname}`            | 文件扩展名                  |

`command` 与 `cwd` 中都会进行变量替换。

## 环境要求

- VS Code 1.74 及以上

## 已知限制

- 上下文菜单项目在窗口加载时注册，因此修改配置后需要重载窗口。
- 扩展会把生成的菜单项写回自身的 `package.json`，因此需要扩展安装目录可写。

## 版本记录

详见 [CHANGELOG.md](CHANGELOG.md)。

## 许可证

MIT