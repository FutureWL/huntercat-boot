import "dotenv/config" // 让脚本能读取 apps/web/.env（本地开发用，不提交 git）
import { createConnection } from "mysql2/promise"

function read(name) {
  const value = process.env[name]
  if (!value) throw new Error(`缺少环境变量：${name}`)
  return value
}

async function main() {
  const host = read("MYSQL_HOST")
  const port = Number(read("MYSQL_PORT"))
  const user = read("MYSQL_USER")
  const password = read("MYSQL_PASSWORD")
  const database = read("MYSQL_DATABASE")

  // 先连到 MySQL Server（不指定 database），用于创建数据库与表
  const conn = await createConnection({ host, port, user, password, multipleStatements: true })

  // 创建数据库并切换
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`)
  await conn.query(`USE \`${database}\``)

  // 创建 todos 表（最小字段：id/title/completed/created_at/updated_at）
  await conn.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  const [rows] = await conn.query("SELECT COUNT(*) AS cnt FROM todos")
  const count = Array.isArray(rows) ? rows[0]?.cnt ?? 0 : 0

  // 表为空时插入种子数据（避免每次执行都重复插入）
  if (Number(count) === 0) {
    await conn.query("INSERT INTO todos (title, completed) VALUES (?, ?), (?, ?), (?, ?)", [
      "Learn Next.js Route Handler",
      1,
      "Connect MySQL in Docker",
      0,
      "Build Todo UI page",
      0,
    ])
  }

  // 关闭连接
  await conn.end()
  console.log("MySQL init done.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
