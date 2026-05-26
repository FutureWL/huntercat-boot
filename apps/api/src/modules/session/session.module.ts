import { Module } from "@nestjs/common" // 引入 NestJS 模块装饰器

import { RedisModule } from "../cache/redis.module" // 引入 Redis 模块（提供 RedisService）
import { SessionService } from "./session.service" // 引入会话服务（管理 sid 与 Redis 会话）

@Module({ // 声明会话模块：聚合 SessionService 及其依赖
  imports: [RedisModule], // 依赖 Redis 模块（会话数据存储在 Redis）
  providers: [SessionService], // 注册会话服务（模块内可注入）
  exports: [SessionService], // 导出会话服务（供 AuthService 等复用）
}) // 结束模块装饰器配置
export class SessionModule {} // 会话模块声明（NestJS DI 边界）
