# 架构说明（骨架阶段）

## 目标边界
- 当前阶段只建设启动骨架、目录约定、协作模板。
- 不实现消除玩法、关卡编辑器、数值系统。

## 模块职责

## `assets/scripts/core`
- 放置生命周期入口、流程编排、容错。
- 当前入口：`QuickStartLauncher`。

## `assets/scripts/ui`
- 放置纯展示层组件。
- 当前示例：`BootStatusView`（状态文本显示）。

## `assets/resources`
- 放置运行时可通过 `resources.load` 加载的资源。
- `levels/` 下保存示例关卡 JSON。

## 启动流程（最小）
1. Canvas 启动 `QuickStartLauncher.start()`。
2. 进入 `bootstrap()`。
3. 调用 `loadLevelWithFallback()`：先尝试 resources，再回退内置关卡。
4. 输出“骨架就绪”状态，等待下一阶段接入游戏流程。

## 最小接入步骤
1. 打开项目并进入主场景。
2. 把 `QuickStartLauncher` 挂到 `Canvas`。
3. 运行预览，确认 Console 中有 `loaded level` 日志。

## 排障
- 若资源路径错误：检查 `levelPath` 是否与 `assets/resources` 下路径一致（不带扩展名）。
- 若状态无显示：确认已绑定 `statusLabel`。
- 若脚本未生效：重新导入资源并检查类名 `QuickStartLauncher`。

## 验收命令
```bash
find assets/scripts -maxdepth 3 -type f | sort
rg "QuickStartLauncher|fallback" assets/scripts/core/QuickStartLauncher.ts
```
