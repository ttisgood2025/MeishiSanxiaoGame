# MeishiSanxiaoGame（项目骨架阶段）

本仓库当前只完成 **Cocos Creator 3.8.2 项目骨架**，目标是让后续玩法开发可以在稳定结构上迭代。

## 目录结构（最小可维护）

```text
assets/
  resources/
    levels/
      builtin-level.json
      level-001.json
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
