import { Module } from "@nestjs/common" // 引入 NestJS 模块装饰器

import { RedisService } from "./redis.service" // 引入 Redis 服务（封装 redis client 生命周期）

@Module({ // 声明 Redis 模块：集中管理 Redis 客户端与连接
  providers: [RedisService], // 注册 RedisService（模块内可注入）
  exports: [RedisService], // 导出 RedisService（供 SessionService 等模块复用）
}) // 结束模块装饰器配置
export class RedisModule {} // Redis 模块声明（NestJS DI 边界）
