# MeishiSanxiaoGame（最小可玩闭环）

当前版本在骨架基础上实现了最小可玩流程：**点牌 -> 入槽 -> 三消 -> 胜利/失败 -> 重开/下一关**。

## 长期记忆（强制遵守）

1. 先保证可玩，再保证好看。
2. 任何资源加载都要有兜底。
3. 新增交互必须做回归，防止点击链路被误伤。
4. 移动端布局独立预算，不拿 PC 效果当标准。
5. 文档必须包含最小接入步骤 + 排障清单 + 验收命令。

## 目录结构
# MeishiSanxiaoGame（项目骨架阶段）test

# 甜品美食三叠消消乐（Cocos Creator 3.8.2）

这是一个针对 **Cocos Creator 3.8.2** 的三叠消除类小游戏项目骨架，主题为甜品美食 2D 风格，共 60 关，关卡型推进，并包含可持续游玩的上瘾循环机制。本仓库当前只完成 **Cocos Creator 3.8.2 项目骨架**，目标是让后续玩法开发可以在稳定结构上迭代。

## 你可以直接得到什么
- 一个可运行的基础玩法循环：点击牌面 -> 入槽 -> 三消 -> 胜负判定 -> 下一关/重开。
- 60 关 JSON 配置（可调参）。
- 一套“最少手工”的场景启动器 `QuickStartLauncher`。

## 说明
- `src/` 目录是仓库内参考实现；实际在 Cocos 里运行只依赖 `assets/`。

## 协作模板（记忆容器）
- `.github/pull_request_template.md`：PR 提交时强制检查长期记忆、回归与验收。
- `.github/ISSUE_TEMPLATE/bug_report.md`：Bug 报告模板（含复现步骤、环境与回归项）。
- `.github/ISSUE_TEMPLATE/feature_request.md`：需求模板（含验收标准与非目标）。

## 开发复盘与标准化指南
- `docs/standardized-dev-guide.md`：从 0 到当前可运行状态的最简 SOP、踩坑复盘与排障清单。


## 目录结构（最小可维护）

```text
assets/
  resources/
    levels/
      builtin-level.json
      level-001.json
      level-002.json
    prefabs/
  scripts/
    core/
      QuickStartLauncher.ts
    ui/
      BootStatusView.ts
docs/
  architecture.md
  phase-2-checklist.md
.github/
  ISSUE_TEMPLATE/
    bug_report.md
    feature_request.md
  pull_request_template.md
README.md
```

## 最小接入步骤（单脚本启动）

1. 用 Cocos Creator 3.8.2 打开项目。
2. 确保场景中有 `Canvas`。
3. 只把 `QuickStartLauncher` 挂到 `Canvas`。
4. 点击预览：可直接看到牌面文本、槽位、状态文案、`[重开]`、`[下一关]`。

## 玩法说明

- 点击任意牌，牌会入槽并从牌面消失。
- 槽中同值满 3 张时自动消除。
- 所有牌清空且槽为空：胜利，可点 `[下一关]`。
- 槽位达到上限且无法继续消除：失败，可点 `[重开]`。
- 下一关默认尝试 `level-002`，若缺失将自动 fallback 到内置关卡。

## Fallback 机制

- 资源加载入口统一走 `loadLevelWithFallback()`。
- 当 `resources.load()` 失败或关卡结构无效，回退到脚本内置 `fallbackLevel`。

## 排障清单

1. **点击无响应**
   - 确认脚本挂在 `Canvas`，运行时存在 `Tile-*` 节点。
2. **看不到状态/槽位/按钮**
   - `BootStatusView` 会被启动器自动挂载，若未出现请执行一次 `Assets -> Refresh`。
3. **下一关报错或无资源**
   - 这是可恢复场景，会自动回退到内置关卡并继续可玩。

## 验收命令

```bash
# 1) 关键文件存在
find assets docs .github -maxdepth 4 -type f | sort

# 2) 单脚本启动 + fallback + 最小闭环逻辑
rg "bootstrap\(|loadLevelWithFallback|onTileClicked|onWin|onFail|ui:next-level|ui:restart" assets/scripts/core/QuickStartLauncher.ts

# 3) UI 事件驱动链路
rg "EventTarget|emit\('ui:restart'|emit\('ui:next-level'|game:slot-updated|game:state" assets/scripts/ui/BootStatusView.ts

# 4) 文档必备章节
rg "最小接入步骤|排障清单|验收命令|长期记忆" README.md docs/architecture.md
## 最小接入步骤（只挂一个脚本）

1. 使用 Cocos Creator 3.8.2 打开本项目。
2. 在主场景中创建或确认 `Canvas` 节点存在。
3. 将 `QuickStartLauncher` 挂到 `Canvas`。
4. 可选：在 `Canvas` 下创建 `Label`，拖给 `QuickStartLauncher.statusLabel` 用于显示启动状态。
5. 运行预览，观察 Console 输出 `骨架就绪`。

> 说明：后续阶段只需替换 `QuickStartLauncher.bootstrap()` 中的 TODO 为实际游戏流程接入。

## Fallback 机制说明

- 默认尝试加载 `assets/resources/levels/level-001.json`。
- 若资源不存在或加载失败，会自动切到脚本内置的 `fallbackLevel`，确保启动流程不断。

## 排障

### 1) 预览报脚本找不到
- 检查脚本文件是否位于 `assets/scripts/core/QuickStartLauncher.ts`。
- 在 Cocos 编辑器执行一次 `Assets -> Refresh`。

### 2) 状态文案不显示
- 检查 `statusLabel` 是否已拖拽绑定。
- 不绑定也不会阻塞启动，仅不显示文本。

### 3) 关卡加载失败
- 这是预期可恢复场景，启动器会自动启用内置关卡。
- 查看 Console 中 `[QuickStartLauncher] 资源加载失败` 日志定位资源路径问题。

## 验收命令（仓库级）

```bash
# 1) 查看关键骨架文件
find assets docs .github -maxdepth 4 -type f | sort

# 2) 检查启动器是否包含 fallback 逻辑
rg "loadLevelWithFallback|fallbackLevel|resources.load" assets/scripts/core/QuickStartLauncher.ts

# 3) 查看阶段文档是否齐全
rg "最小接入步骤|排障|验收" README.md docs/architecture.md
```
