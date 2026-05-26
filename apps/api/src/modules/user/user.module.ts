import { Module } from "@nestjs/common" // 引入 NestJS 模块装饰器

import { MysqlModule } from "../db/mysql.module" // 引入 MySQL 模块（提供 MysqlService）
import { UserRepository } from "./user.repository" // 引入用户仓储（读写 users 表）

@Module({ // 声明用户模块：聚合用户仓储能力
  imports: [MysqlModule], // 依赖 MySQL 模块（用户数据持久化）
  providers: [UserRepository], // 注册用户仓储（模块内可注入）
  exports: [UserRepository], // 导出用户仓储（供 AuthService 等复用）
}) // 结束模块装饰器配置
export class UserModule {} // 用户模块声明（NestJS DI 边界）
