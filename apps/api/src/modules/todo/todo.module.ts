import { Module } from "@nestjs/common" // 引入 NestJS 模块装饰器

import { AuthModule } from "../auth/auth.module" // 引入认证模块（提供 SessionGuard 等鉴权能力）
import { MysqlModule } from "../db/mysql.module" // 引入 MySQL 模块（提供 MysqlService）
import { TodoController } from "./todo.controller" // 引入 Todo 控制器（路由层）
import { TodoRepository } from "./todo.repository" // 引入 Todo 仓储（数据访问层）

@Module({ // 声明 Todo 模块：聚合 Todo 控制器与仓储
  imports: [MysqlModule, AuthModule], // 依赖 MySQL（持久化）与 Auth（鉴权）
  controllers: [TodoController], // 注册控制器（对外暴露 HTTP 接口）
  providers: [TodoRepository], // 注册仓储（模块内可注入）
}) // 结束模块装饰器配置
export class TodoModule {} // Todo 模块声明（NestJS DI 边界）
