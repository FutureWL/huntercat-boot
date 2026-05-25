import type { RedisClientType } from "redis"
import { createClient } from "redis"

import { getRedisEnv } from "./env"

const CLIENT_KEY = Symbol.for("pjd.vcn.redisClient")
const CONNECTING_KEY = Symbol.for("pjd.vcn.redisConnecting")

// 获取 Redis Client（单例）
// - Session 存 Redis：route handler 每次请求都可能触发模块重新加载，所以用 globalThis 缓存
export async function getRedisClient(): Promise<RedisClientType> {
  const g = globalThis as unknown as Record<PropertyKey, unknown>
  const existing = g[CLIENT_KEY] as RedisClientType | undefined
  const connecting = g[CONNECTING_KEY] as Promise<RedisClientType> | undefined

  if (existing) return existing
  if (connecting) return connecting

  const env = getRedisEnv()

  const client: RedisClientType = createClient({
    socket: { host: env.host, port: env.port },
    password: env.password,
  })

  const promise = (async () => {
    await client.connect()
    g[CLIENT_KEY] = client
    g[CONNECTING_KEY] = undefined
    return client
  })()

  g[CONNECTING_KEY] = promise
  return promise
}
