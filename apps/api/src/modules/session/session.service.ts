import { randomUUID } from "node:crypto"
import type { Response } from "express"
import { Injectable } from "@nestjs/common"

import { getSessionTtlSeconds } from "../../config/env"
import { RedisService } from "../cache/redis.service"

export const SESSION_COOKIE_NAME = "sid"

@Injectable()
export class SessionService {
  constructor(private readonly redis: RedisService) {}

  private keyOf(sessionId: string) {
    return `session:${sessionId}`
  }

  async createSession(userId: string): Promise<string> {
    const sessionId = randomUUID()
    const ttl = getSessionTtlSeconds()
    const client = this.redis.getClient()
    await client.set(this.keyOf(sessionId), userId, { EX: ttl })
    return sessionId
  }

  async getSessionUserId(sessionId: string): Promise<string | null> {
    const client = this.redis.getClient()
    const userId = await client.get(this.keyOf(sessionId))
    return userId ?? null
  }

  async deleteSession(sessionId: string): Promise<void> {
    const client = this.redis.getClient()
    await client.del(this.keyOf(sessionId))
  }

  setSessionCookie(res: Response, sessionId: string) {
    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: getSessionTtlSeconds() * 1000,
    })
  }

  clearSessionCookie(res: Response) {
    res.cookie(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 0,
    })
  }
}

