export type MysqlEnv = {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export type RedisEnv = {
  host: string
  port: number
  password: string
}

function read(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

export function getMysqlEnv(): MysqlEnv {
  const host = read("MYSQL_HOST")
  const port = Number(read("MYSQL_PORT"))
  if (!Number.isFinite(port)) throw new Error("MYSQL_PORT must be a number")

  const user = read("MYSQL_USER")
  const password = read("MYSQL_PASSWORD")
  const database = read("MYSQL_DATABASE")

  return { host, port, user, password, database }
}

export function getRedisEnv(): RedisEnv {
  const host = read("REDIS_HOST")
  const port = Number(read("REDIS_PORT"))
  if (!Number.isFinite(port)) throw new Error("REDIS_PORT must be a number")

  const password = read("REDIS_PASSWORD")
  return { host, port, password }
}

export function getSessionTtlSeconds(): number {
  const ttl = Number(read("SESSION_TTL_SECONDS"))
  if (!Number.isFinite(ttl) || ttl <= 0) throw new Error("SESSION_TTL_SECONDS must be a positive number")
  return ttl
}

