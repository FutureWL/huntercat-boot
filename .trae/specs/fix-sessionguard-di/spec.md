# 修复 SessionGuard 依赖注入失败 Spec

## Why
当前 `apps/api` 启动时抛出 `UnknownDependenciesException`，提示 `TodoModule` 无法解析 `SessionGuard` 的依赖 `SessionService`，导致 API 无法启动，前端登录流程无法正常工作。

## What Changes
- 调整 NestJS 模块导出/导入关系，确保任何使用 `SessionGuard` 的模块都能解析到 `SessionService`
- 保持现有 HTTP 路由、返回结构与鉴权逻辑不变
- **非目标**：不改动登录/注册/会话存储的业务规则，仅修复 DI 关系与启动失败

## Impact
- Affected specs: 启动稳定性、鉴权守卫可复用性、登录与 Todos 关键路径可用性
- Affected code:
  - `apps/api/src/modules/auth/auth.module.ts`
  - `apps/api/src/modules/todo/todo.module.ts`
  - （可能）`apps/api/src/modules/session/session.module.ts`

## ADDED Requirements
### Requirement: SessionGuard 可在 TodoModule 中正确解析依赖
系统 SHALL 在 `TodoModule` 中使用 `SessionGuard` 时，能够正确解析 `SessionService` 依赖，且应用启动不再抛出依赖注入异常。

#### Scenario: API 启动成功
- **WHEN** 启动 `apps/api`
- **THEN** 控制台不再出现 `Nest can't resolve dependencies of the SessionGuard` 的错误
- **AND** 应用完成启动并可对外提供 `/v1/*` 路由

#### Scenario: 登录与鉴权可用
- **GIVEN** MySQL 与 Redis 正常可用，且存在用户 `demo/demo`
- **WHEN** 在登录页使用 `demo/demo` 登录
- **THEN** 登录接口返回成功，浏览器获得 `sid` Cookie
- **AND** 访问需要鉴权的 `/v1/todos` 不再因服务启动失败或守卫实例化失败而报错

## MODIFIED Requirements
### Requirement: AuthModule 对外提供可用的鉴权依赖集合
系统 SHALL 通过 `AuthModule`（或显式依赖模块）对外暴露 `SessionGuard` 及其运行所必需的会话相关 provider（至少包含 `SessionService` 可被解析的导出链路）。

## REMOVED Requirements
无

