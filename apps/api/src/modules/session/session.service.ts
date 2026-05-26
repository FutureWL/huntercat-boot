import { randomUUID } from "node:crypto" // 引入 UUID 生成器（用于生成 sid）
import type { Response } from "express" // 引入 Express Response 类型（用于设置 Cookie）
import { Injectable } from "@nestjs/common" // 引入 NestJS 可注入装饰器

import { getSessionTtlSeconds } from "../../config/env" // 引入会话过期时间配置读取方法
import { RedisService } from "../cache/redis.service" // 引入 Redis 服务（读写会话数据）

export const SESSION_COOKIE_NAME = "sid" // 会话 Cookie 名称（前后端约定）

@Injectable() // 声明为可注入服务（由 NestJS DI 管理）
export class SessionService {
  constructor(private readonly redis: RedisService) {} // 注入 Redis 服务（会话存储介质）

  private keyOf(sessionId: string) {
    return `session:${sessionId}` // 统一的 Redis Key 规则：session:<sid>
  }

  async createSession(userId: string): Promise<string> {
    const sessionId = randomUUID() // 生成新的 sid（随机且难以猜测）
    const ttl = getSessionTtlSeconds() // 读取会话 TTL（秒）
    const client = this.redis.getClient() // 获取 Redis 客户端（单例）
    await client.set(this.keyOf(sessionId), userId, { EX: ttl }) // 写入会话：sid -> userId，并设置过期时间
    return sessionId // 返回 sid（上层用于写入 Cookie）
  }

  async getSessionUserId(sessionId: string): Promise<string | null> {
    const client = this.redis.getClient() // 获取 Redis 客户端
    const userId = await client.get(this.keyOf(sessionId)) // 从 Redis 读取 userId（不存在则返回 null）
    return userId ?? null // 统一返回 null（避免 undefined 带来歧义）
  }

  async deleteSession(sessionId: string): Promise<void> {
    const client = this.redis.getClient() // 获取 Redis 客户端
    await client.del(this.keyOf(sessionId)) // 删除会话（幂等：不存在也不会报错）
  }

  setSessionCookie(res: Response, sessionId: string) {
    res.cookie(SESSION_COOKIE_NAME, sessionId, { // 写入 sid Cookie（用于浏览器后续请求自动携带）
      httpOnly: true, // 仅服务端可读（防止 XSS 读取）
      sameSite: "lax", // 降低 CSRF 风险（同站点策略）
      secure: false, // 本地开发默认 false；生产建议在 HTTPS 下设置为 true
      path: "/", // 作用域：全站
      maxAge: getSessionTtlSeconds() * 1000, // 过期时间（毫秒）
    }) // 结束 cookie 配置
  }

  clearSessionCookie(res: Response) {
    res.cookie(SESSION_COOKIE_NAME, "", { // 清空 sid Cookie（让浏览器不再携带 sid）
      httpOnly: true, // 保持一致的安全属性
      sameSite: "lax", // 保持一致的同站点策略
      secure: false, // 本地开发默认 false；生产建议在 HTTPS 下设置为 true
      path: "/", // 作用域：全站
      maxAge: 0, // 立即过期
    }) // 结束 cookie 配置
  }
}
