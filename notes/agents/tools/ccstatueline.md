# ccstatueline

`ccstatusline` 是给 Claude Code 添加状态栏显示的工具，可用来展示会话状态、上下文等辅助信息。这篇文档依次说明项目地址、安装、配置文件修改、接入 Claude Code 和附录说明。

## 项目地址

<https://github.com/sirmalloc/ccstatusline>

## 安装 ccstatusline

```bash
npx -y ccstatusline@latest
```

选择 Exit 退出

## 打开配置文件

```bash
notepad %USERPROFILE%\.config\ccstatusline\settings.json
```

覆盖写入 `附录` 内容

## 将状态栏安装到 Claude Code

```bash
# 再次执行
npx -y ccstatusline@latest
```

依次选择

- Install to Claude Code
- Auto-Update
- npx -y ccstatusline@latest
- Exit

启动 Claude Code，此时在状态栏会显示一些常用的状态信息。

## 附录

`%USERPROFILE%\.config\ccstatusline\settings.json`

```json
{
  "version": 3,
  "lines": [
    [
      {
        "id": "1",
        "type": "model",
        "color": "cyan"
      },
      {
        "id": "2",
        "type": "separator"
      },
      {
        "id": "3",
        "type": "context-length",
        "color": "brightBlack"
      },
      {
        "id": "06e4aa2f-844e-4619-b0f4-11b72ae50fca",
        "type": "separator"
      },
      {
        "id": "5",
        "type": "context-percentage",
        "color": "magenta"
      },
      {
        "id": "4",
        "type": "separator"
      },
      {
        "id": "7f110cb2-7159-459b-9c46-4201946b21d8",
        "type": "session-usage"
      },
      {
        "id": "216eb86a-f7ec-4580-85e5-9eb6fcb70844",
        "type": "separator"
      },
      {
        "id": "7",
        "type": "session-clock",
        "color": "yellow",
        "metadata": {
          "hideNoGit": "false"
        }
      }
    ],
    [
      {
        "id": "b1766dc9-82da-42fb-90ef-4eb24041de53",
        "type": "tokens-cached"
      },
      {
        "id": "1ffa6361-8df7-46b6-a694-be84b49802bc",
        "type": "separator"
      },
      {
        "id": "49433b75-e946-44f6-bd09-57e5506053ed",
        "type": "tokens-input"
      },
      {
        "id": "0ebd94f1-bd7f-440b-94a4-52a0c0cc4116",
        "type": "separator"
      },
      {
        "id": "093ba79d-56d2-4b41-a945-27667ee5ca01",
        "type": "tokens-output"
      },
      {
        "id": "0ae05a40-df2e-4725-b534-b26e643a3381",
        "type": "separator"
      },
      {
        "id": "451ac6d9-74e6-4e82-bf20-ed7da0f732f9",
        "type": "tokens-total"
      },
      {
        "id": "5f8ac5de-d8c9-44f7-a204-d3490274e42d",
        "type": "separator"
      },
      {
        "id": "0222efbe-5e87-4949-83e3-30d997ae6989",
        "type": "session-cost"
      }
    ],
    [
      {
        "id": "68447727-14c7-484d-be89-bf25f48c5ec0",
        "type": "input-speed"
      },
      {
        "id": "5dcb649b-5ebe-47ff-8c85-d51132d4604d",
        "type": "flex-separator"
      },
      {
        "id": "5f9ce69a-543e-4735-b528-4ff9c3e7b13e",
        "type": "output-speed"
      },
      {
        "id": "d17159de-3c3a-42c0-87d9-be5feeb8bfe5",
        "type": "flex-separator"
      },
      {
        "id": "38118cf9-4f0e-4ca5-a144-a38516fdb00b",
        "type": "free-memory"
      },
      {
        "id": "a32681ba-0290-40b4-b021-ac5c807879f0",
        "type": "flex-separator"
      },
      {
        "id": "aa474b78-7585-4fff-8c05-06507194bf40",
        "type": "thinking-effort"
      },
      {
        "id": "23b5010a-1091-4ecb-b452-821f40ade4b1",
        "type": "flex-separator"
      },
      {
        "id": "1b9a764f-3c64-4b20-8da2-9c622f0e5c1a",
        "type": "skills"
      }
    ]
  ],
  "flexMode": "full-minus-40",
  "compactThreshold": 60,
  "colorLevel": 2,
  "inheritSeparatorColors": false,
  "globalBold": false,
  "minimalistMode": false,
  "powerline": {
    "enabled": false,
    "separators": [
      ""
    ],
    "separatorInvertBackground": [
      false
    ],
    "startCaps": [],
    "endCaps": [],
    "autoAlign": false,
    "continueThemeAcrossLines": false
  }
}
```
