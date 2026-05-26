# huntercat-boot

`huntercat`（猎手猫）指 **南昌猎手猫数字科技有限公司**。本项目的知识产权/技术成果归属以公司为知识主体。

`boot`（启动）表示“起步/基座”。`huntercat-boot` 是公司的通用开发基础工程，用于沉淀工程化、架构与通用能力；后续不同业务项目都会基于该工程进行快速开发与迭代。

## 项目目标

- 提供一套可直接复用的 TypeScript 全栈工程基座（从 0 到 1 的最小闭环）
- 统一代码结构与工程规范：monorepo、共享契约、接口分层、鉴权与数据隔离
- 作为后续业务项目的“模板仓库/脚手架基底”

## 技术栈概览

- Monorepo：pnpm workspaces
- Web：Next.js（App Router，页面与交互）
- API：NestJS（承载登录/注册/会话/Todos 等服务端职责）
- 共享契约：`packages/shared`（DTO、ApiResponse、错误码等）
- 数据库：MySQL（持久化 Todo）
- 会话：Redis（Session 存储，Cookie `sid`）

## 目录结构

```text
.
├─ apps/
│  ├─ web/                # Next.js 应用（前端）
│  └─ api/                # NestJS 应用（后端 API）
├─ packages/
│  └─ shared/             # 前后端共享契约（types/DTO/错误码）
├─ pnpm-workspace.yaml
├─ package.json
└─ tsconfig.base.json
```

## 本地启动（开发环境）

### 1. 安装依赖

```bash
pnpm install
```

### 2. 准备环境变量

复制根目录 `.env.example` 的内容到 `apps/api/.env` 与 `apps/web/.env`（这些文件已被 `.gitignore` 忽略，不会提交）：

```ini
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=pjd_vcn

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=redis

SESSION_TTL_SECONDS=604800
```

### 3. 启动 MySQL 与 Redis

你可以使用本机服务或 Docker。确保：

- MySQL：`127.0.0.1:3306` 可访问
- Redis：`127.0.0.1:6379` 可访问，且密码为 `redis`

### 4. 初始化数据库结构与种子数据

```bash
pnpm --filter @pjd/api db:init
```

该脚本会：

- 创建数据库（默认 `pjd_vcn`）
- 创建表：`users`、`todos`（含 `user_id` 外键）
- 插入演示用户与种子数据（如果库为空）

### 5. 启动开发服务器

```bash
pnpm --filter @pjd/api dev
pnpm --filter @pjd/web dev --port 3000
```

Web 会将 `/api/v1/*` 通过 Next.js rewrites 反向代理到 API（默认 `http://localhost:3001/v1/*`）。如需自定义 API 地址，可设置环境变量 `API_INTERNAL_BASE_URL`。

打开：

- 首页：http://localhost:3000/
- 登录：http://localhost:3000/login
- 注册：http://localhost:3000/register
- Todo：http://localhost:3000/todos

## 演示账号

初始化脚本会创建演示账号：

- 用户名：`demo`
- 密码：`demo`

## 核心能力说明

### 1) 认证与会话（Redis Session）

- 登录成功后服务端创建 session（Redis：`session:<sid> -> userId`）
- 浏览器持有 HttpOnly Cookie：`sid`
- 通过 `/api/v1/auth/me` 获取当前登录用户
- 通过 `/api/v1/auth/logout` 删除 session 并清理 cookie

### 2) Todo 数据隔离（按用户）

- `todos` 表包含 `user_id`
- 所有 Todo API 强制登录，并只允许读写自己的 Todo

## 常用命令

```bash
# 全仓库类型检查
pnpm -r typecheck

# 初始化数据库
pnpm --filter @pjd/api db:init

# 启动 Web（Next.js）
pnpm --filter @pjd/web dev --port 3000

# 启动 API（NestJS）
pnpm --filter @pjd/api dev
```

## 备注

- `apps/web/.env` 属于本地环境配置，不应提交到仓库
- 本仓库当前提供的是可学习、可扩展的基础工程能力，后续业务可在此基础上扩展：权限、角色、审计日志、分页/搜索、业务领域模块化等
