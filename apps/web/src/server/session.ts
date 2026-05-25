import { randomUUID } from "node:crypto"
import type { NextResponse } from "next/server"

import { getSessionTtlSeconds } from "./env"
import { getRedisClient } from "./redis"

export const SESSION_COOKIE_NAME = "sid"

// Cookie 解析：只够用即可（我们的 cookie 值都是简单字符串）
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}

  const out: Record<string, string> = {}

  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=")
    if (!k) continue
    out[k] = decodeURIComponent(rest.join("="))
  }

  return out
}

function keyOf(sessionId: string): string {
  return `session:${sessionId}`
}

// 创建 session：生成 sessionId 并写入 Redis（value = userId）
export async function createSession(userId: string): Promise<string> {
  const sessionId = randomUUID()
  const redis = await getRedisClient()
  const ttl = getSessionTtlSeconds()

  await redis.set(keyOf(sessionId), userId, { EX: ttl })
  return sessionId
}

// 从请求里读取 session，并从 Redis 取回 userId
export async function getSessionUserId(request: Request): Promise<string | null> {
  const cookies = parseCookies(request.headers.get("cookie"))
  const sessionId = cookies[SESSION_COOKIE_NAME]
  if (!sessionId) return null

  const redis = await getRedisClient()
  const userId = await redis.get(keyOf(sessionId))
  return userId ?? null
}

// 从 cookie header 字符串读取 session，并从 Redis 取回 userId（用于 Server Component 场景）
export async function getSessionUserIdFromCookieHeader(cookieHeader: string | null): Promise<string | null> {
  const cookies = parseCookies(cookieHeader)
  const sessionId = cookies[SESSION_COOKIE_NAME]
  if (!sessionId) return null

  const redis = await getRedisClient()
  const userId = await redis.get(keyOf(sessionId))
  return userId ?? null
}

// 删除 session（退出登录）
export async function deleteSession(sessionId: string): Promise<void> {
  const redis = await getRedisClient()
  await redis.del(keyOf(sessionId))
}

// 下发 session cookie（HttpOnly：前端 JS 读不到，更安全）
export function setSessionCookie(res: NextResponse, sessionId: string) {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: getSessionTtlSeconds(),
  })
}

// 清理 session cookie
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  })
}
