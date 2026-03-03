## 变更摘要
- 

## 变更动机
- 

## 影响范围
- [ ] 核心玩法逻辑（GameController / Manager）
- [ ] UI 交互与显示（QuickStartLauncher / SimpleBoardUI）
- [ ] 资源加载（图片/音频/resources 路径）
- [ ] 关卡配置（levels.json）
- [ ] 文档

## 长期记忆检查（必填）
- [ ] 先保证可玩，再保证好看
- [ ] 资源加载有兜底（fallback），失败不阻塞开局
- [ ] 新增/改动交互已做回归（点击、重开、下一关、失败恢复）
- [ ] 移动端竖屏可读性已验证（布局/尺寸）
- [ ] 文档已更新（接入步骤/排障/验收命令）

## 验收清单（必填）
- [ ] 运行后不是静态初始化页
- [ ] 可点击牌面，槽位状态有变化
- [ ] 满槽触发失败逻辑
- [ ] 清空牌堆触发胜利逻辑
- [ ] 下一关/重开可用
- [ ] resources 失效时仍可 fallback 开局

## 测试命令与结果（必填）
- [ ] `python -m json.tool assets/resources/config/levels.json >/dev/null`
- [ ] `python -m json.tool config/levels.json >/dev/null`
- [ ] `npm run -s lint:ts`（若环境缺少 Cocos 类型需说明）
- [ ] 其他：

## 风险与回滚
- 风险点：
- 回滚方式：

## 截图 / 录屏（涉及可视化改动时必填）
- 
