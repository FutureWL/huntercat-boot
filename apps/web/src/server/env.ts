// MySQL 连接所需的环境变量结构（在 Next.js 服务端运行）
export type MysqlEnv = {
  host: string
  port: number
  user: string
  password: string
  database: string
}

// 读取必填环境变量：缺失则直接抛错，避免“连不上库但接口默默失败”
function read(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`缺少环境变量：${name}`)
  return value
}

// 将环境变量解析为强类型配置
export function getMysqlEnv(): MysqlEnv {
  const host = read("MYSQL_HOST")
  const port = Number(read("MYSQL_PORT"))
  if (!Number.isFinite(port)) throw new Error("MYSQL_PORT 必须是数字")

  const user = read("MYSQL_USER")
  const password = read("MYSQL_PASSWORD")
  const database = read("MYSQL_DATABASE")

  return { host, port, user, password, database }
}
