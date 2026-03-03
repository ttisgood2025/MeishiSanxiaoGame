# 架构说明（当前阶段：最小可玩闭环）

## 1. 目标边界

- 只实现最小可玩链路：点牌、入槽、三消、胜败、重开/下一关。
- 保持 **单脚本接入**：只挂 `QuickStartLauncher`。
- UI 与玩法采用 **事件驱动**，避免直接相互耦合。
- 所有关卡加载必须可 fallback。

## 2. 模块职责

- `assets/scripts/core/QuickStartLauncher.ts`
  - 启动入口（`start -> bootstrap`）
  - 关卡加载与兜底（`loadLevelWithFallback`）
  - 玩法循环（点牌、入槽、消除、胜败）
  - 事件总线（发状态、收 UI 指令）
- `assets/scripts/ui/BootStatusView.ts`
  - 启动时自动创建状态文本、槽位文本、按钮文本
  - 订阅玩法事件（状态、剩余牌、槽位、游戏状态）
  - 发布 UI 事件（重开、下一关）

## 3. 最小接入步骤

1. 打开 Cocos Creator 3.8.2。
2. 将 `QuickStartLauncher` 挂到 `Canvas`。
3. 点击预览并按牌面交互。

## 4. 排障清单

- **没有牌面节点**：确认 `setupBoard()` 被调用，Console 有 `level ready`。
- **重开/下一关按钮不工作**：确认 `BootStatusView.init(eventBus)` 被调用。
- **关卡资源异常**：检查 `assets/resources/levels/*.json`；异常时应自动使用 fallback。
- **导入包含无效文件**：确认仓库根目录存在 `project.json` 且使用 3.8.2；若缓存异常，先建空项目再覆盖 `assets/settings/profiles/project.json`。
- **编辑器版本不存在**：若同机其它 3.8.2 项目正常，优先检查本项目 `project.json` 的版本字段；当前已改为 `creator`（字符串）+ `version` 兼容写法，必要时改为本机已安装的小版本号重试。

## 5. 验收命令

```bash
find assets docs .github -maxdepth 4 -type f | sort
rg "bootstrap\(|loadLevelWithFallback|onTileClicked|onWin|onFail" assets/scripts/core/QuickStartLauncher.ts
rg "EventTarget|ui:restart|ui:next-level|game:slot-updated|game:state" assets/scripts/ui/BootStatusView.ts
rg "最小接入步骤|排障清单|验收命令" README.md docs/architecture.md
```
