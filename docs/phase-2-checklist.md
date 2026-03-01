# 下一阶段开发清单（Phase 2）

1. **GameDirector 接入**
   - 在 `QuickStartLauncher.bootstrap()` 的 TODO 处接入游戏主流程。
2. **UI 流程拆分**
   - 用 `ui` 下组件搭建启动页、结算页、暂停页。
3. **资源策略扩展**
   - 将 fallback 关卡从硬编码迁移到可配置策略。
4. **关卡 schema 校验**
   - 对 JSON 数据增加字段验证，避免脏数据进入运行态。
5. **自动化检查**
   - 添加脚本检查关卡 JSON 格式、必填字段。
6. **测试场景**
   - 建立 smoke 场景，验证启动、加载、fallback 三路径。
