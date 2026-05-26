import type { RedisClientType } from "redis" // 引入 Redis 客户端类型（用于类型标注）
import { createClient } from "redis" // 引入 Redis 客户端工厂方法
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common" // 引入 NestJS 生命周期接口（初始化/销毁）

import { getRedisEnv } from "../../config/env" // 引入 Redis 环境变量读取方法（集中配置入口）

@Injectable() // 声明为可注入服务（由 NestJS 管理生命周期）
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null // 缓存 Redis 客户端实例（单例复用）

  async onModuleInit() {
    this.getClient() // 懒加载创建 client（避免多处重复 new）
    await this.client!.connect() // 建立 Redis 连接（启动阶段 fail-fast）
  }

  getClient(): RedisClientType {
    if (this.client) return this.client // 已创建则直接返回（保证单例）

    const env = getRedisEnv() // 读取 Redis 连接配置（host/port/password）
    this.client = createClient({ // 创建 Redis 客户端（连接在 onModuleInit 执行）
      socket: { host: env.host, port: env.port }, // 连接地址与端口
      password: env.password, // 访问密码（若未配置则为 undefined）
    }) // 结束 createClient 配置
    return this.client // 返回创建好的客户端
  }

  async onModuleDestroy() {
    if (!this.client) return // 未创建客户端则无需处理
    await this.client.disconnect() // 断开连接（应用关闭时释放资源）
    this.client = null // 清空缓存引用（避免重复使用已断开的 client）
  }
}
