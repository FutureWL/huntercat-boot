# Tasks
- [x] Task 1: 复现并定位依赖注入链路
  - [x] 在 `apps/api` 启动时复现 `UnknownDependenciesException`
  - [x] 检查 `AuthModule / SessionModule / TodoModule` 的 `imports/providers/exports` 关系，确认 `SessionGuard` 实例化时的模块上下文

- [x] Task 2: 修复模块导出/导入关系
  - [x] 选择最小变更方案，使 `TodoModule` 能解析到 `SessionService`
  - [x] 优先方案：通过 `AuthModule` 重新导出会话相关模块/服务（确保导出链路完整）
  - [x] 备选方案：在 `TodoModule` 显式导入 `SessionModule`（仅在优先方案不满足时采用）

- [ ] Task 3: 回归验证关键路径
  - [ ] 验证 `apps/api` 可正常启动（无 DI 报错）
  - [ ] 验证 `demo/demo` 登录成功并写入 `sid` Cookie
  - [ ] 验证带 Cookie 调用 `/v1/todos` 成功、无 401/500（在数据存在时返回列表）

- [ ] Task 4: 工具化校验
  - [ ] 运行 `pnpm -r typecheck` 通过

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 2

