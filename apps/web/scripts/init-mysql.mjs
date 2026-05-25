import "dotenv/config" // 让脚本能读取 apps/web/.env（本地开发用，不提交 git）
import bcrypt from "bcryptjs"
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

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      username VARCHAR(64) NOT NULL,
      password_hash VARCHAR(100) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_users_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  // 创建 todos 表（最小字段：id/title/completed/created_at/updated_at）
  await conn.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NULL,
      title VARCHAR(255) NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_todos_user_id (user_id),
      CONSTRAINT fk_todos_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  const [users] = await conn.query("SELECT id FROM users WHERE username = ? LIMIT 1", ["demo"])
  let demoUserId = Array.isArray(users) ? users[0]?.id : undefined

  if (!demoUserId) {
    const passwordHash = await bcrypt.hash("demo", 10)
    await conn.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", ["demo", passwordHash])
    const [createdUsers] = await conn.query("SELECT id FROM users WHERE username = ? LIMIT 1", ["demo"])
    demoUserId = Array.isArray(createdUsers) ? createdUsers[0]?.id : undefined
  }

  const [columns] = await conn.query(
    "SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = ? AND table_name = 'todos' AND column_name = 'user_id'",
    [database],
  )
  const hasUserId = Array.isArray(columns) ? Number(columns[0]?.cnt ?? 0) > 0 : false

  if (!hasUserId) {
    await conn.query("ALTER TABLE todos ADD COLUMN user_id BIGINT UNSIGNED NULL")
    await conn.query("ALTER TABLE todos ADD KEY idx_todos_user_id (user_id)")
    await conn.query("ALTER TABLE todos ADD CONSTRAINT fk_todos_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE")
  }

  if (demoUserId) {
    await conn.query("UPDATE todos SET user_id = ? WHERE user_id IS NULL", [demoUserId])
    await conn.query("ALTER TABLE todos MODIFY user_id BIGINT UNSIGNED NOT NULL")
  }

  const [rows] = await conn.query("SELECT COUNT(*) AS cnt FROM todos")
  const count = Array.isArray(rows) ? rows[0]?.cnt ?? 0 : 0

  // 表为空时插入种子数据（避免每次执行都重复插入）
  if (Number(count) === 0) {
    await conn.query(
      "INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)",
      [
        demoUserId,
        "Learn Next.js Route Handler",
        1,
        demoUserId,
        "Connect MySQL in Docker",
        0,
        demoUserId,
        "Build Todo UI page",
        0,
      ],
    )
  }

  // 关闭连接
  await conn.end()
  console.log("MySQL init done.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
