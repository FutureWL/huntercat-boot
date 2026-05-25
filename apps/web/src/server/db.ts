import type { Pool } from "mysql2/promise"
import { createPool } from "mysql2/promise"

import { getMysqlEnv } from "./env"

const POOL_KEY = Symbol.for("pjd.vcn.mysqlPool") // 连接池全局缓存 key（用于 dev 热更新保持单例）

// 获取 MySQL 连接池（单例）
// - 生产环境：模块只加载一次，自然是单例
// - 开发环境：Next dev 可能热更新模块，用 globalThis 缓存可避免重复建连
export function getDbPool(): Pool {
  const g = globalThis as unknown as Record<PropertyKey, unknown> // 取全局对象作为缓存容器
  const existing = g[POOL_KEY] as Pool | undefined // 尝试复用已创建的 pool

  if (existing) return existing // 已存在就直接返回

  const env = getMysqlEnv() // 读取环境变量

  const pool = createPool({
    host: env.host,
    port: env.port,
    user: env.user,
    password: env.password,
    database: env.database,
    connectionLimit: 10,
    namedPlaceholders: true,
    timezone: "Z",
  })

  g[POOL_KEY] = pool // 写入全局缓存
  return pool // 返回连接池
}
