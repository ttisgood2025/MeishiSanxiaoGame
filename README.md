# MeishiSanxiaoGame（最小可玩闭环）

当前版本在骨架基础上实现了最小可玩流程：**点牌 -> 入槽 -> 三消 -> 胜利/失败 -> 重开/下一关**。

## 长期记忆（强制遵守）

1. 先保证可玩，再保证好看。
2. 任何资源加载都要有兜底。
3. 新增交互必须做回归，防止点击链路被误伤。
4. 移动端布局独立预算，不拿 PC 效果当标准。
5. 文档必须包含最小接入步骤 + 排障清单 + 验收命令。

## 目录结构

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

4. **导入包含无效文件**
   - 本仓库已补充 `project.json` 与 `settings/profiles` 最小工程标识，请确认使用 **Cocos Creator 3.8.2** 打开仓库根目录。
   - 若本地历史缓存导致导入校验失败：先在 Creator 新建一个 3.8.2 空项目，再用本仓库的 `assets/`、`settings/`、`profiles/`、`project.json` 覆盖后重开。

5. **编辑器版本不存在**
   - 若你本机其它 3.8.2 项目可正常导入，本项目仍报错，优先排查 **`project.json` 版本字段格式** 是否被识别。
   - 本仓库已将 `project.json` 补齐为 `creator.version + version`（并保留 `engine`），请先拉取最新代码再导入。
   - 若仍失败，可将 `project.json` 的 `creator.version` 与 `version` 临时改为你本机实际安装的小版本号后重试。

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
```
