export type MysqlEnv = { // MySQL 连接配置结构：用于创建连接池
  host: string // 主机地址
  port: number // 端口
  user: string // 用户名
  password: string // 密码
  database: string // 数据库名
} // MysqlEnv 类型结束

export type RedisEnv = { // Redis 连接配置结构：用于 session 存储
  host: string // 主机地址
  port: number // 端口
  password: string // 密码
} // RedisEnv 类型结束

function read(name: string): string { // 读取必填环境变量：缺失则直接抛错（Fail-fast）
  const value = process.env[name] // 从进程环境变量读取
  if (!value) throw new Error(`Missing env var: ${name}`) // 缺失即报错，避免应用带病运行
  return value // 返回读取到的值
} // read 函数结束

export function getMysqlEnv(): MysqlEnv { // 解析 MySQL 环境变量为强类型配置
  const host = read("MYSQL_HOST") // MySQL 主机
  const port = Number(read("MYSQL_PORT")) // MySQL 端口（数字）
  if (!Number.isFinite(port)) throw new Error("MYSQL_PORT must be a number") // 端口必须可转为有限数字

  const user = read("MYSQL_USER") // MySQL 用户名
  const password = read("MYSQL_PASSWORD") // MySQL 密码
  const database = read("MYSQL_DATABASE") // MySQL 数据库名

  return { host, port, user, password, database } // 返回配置对象
} // getMysqlEnv 函数结束

export function getRedisEnv(): RedisEnv { // 解析 Redis 环境变量为强类型配置
  const host = read("REDIS_HOST") // Redis 主机
  const port = Number(read("REDIS_PORT")) // Redis 端口（数字）
  if (!Number.isFinite(port)) throw new Error("REDIS_PORT must be a number") // 端口必须可转为有限数字

  const password = read("REDIS_PASSWORD") // Redis 密码
  return { host, port, password } // 返回配置对象
} // getRedisEnv 函数结束

export function getSessionTtlSeconds(): number { // Session 过期时间（秒）：用于 Redis EX 与 Cookie maxAge
  const ttl = Number(read("SESSION_TTL_SECONDS")) // 将环境变量转为数字
  if (!Number.isFinite(ttl) || ttl <= 0) throw new Error("SESSION_TTL_SECONDS must be a positive number") // 必须为正数
  return ttl // 返回 ttl 秒数
} // getSessionTtlSeconds 函数结束
