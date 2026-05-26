import "dotenv/config" // 加载 .env 环境变量（用于本地脚本读取 MYSQL_* 配置）
import bcrypt from "bcryptjs" // 引入 bcrypt：用于生成 demo 用户密码 hash
import { createConnection } from "mysql2/promise" // 引入 MySQL 连接方法（脚本一次性连接）

function read(name) {
  const value = process.env[name] // 从环境变量读取指定配置
  if (!value) throw new Error(`缺少环境变量：${name}`) // 缺失则直接抛错（fail-fast，避免误写到错误库）
  return value // 返回读取到的值
}

async function main() {
  const host = read("MYSQL_HOST") // MySQL 主机地址
  const port = Number(read("MYSQL_PORT")) // MySQL 端口（转换为 number）
  const user = read("MYSQL_USER") // MySQL 用户名
  const password = read("MYSQL_PASSWORD") // MySQL 密码
  const database = read("MYSQL_DATABASE") // 目标数据库名

  const conn = await createConnection({ host, port, user, password, multipleStatements: true }) // 建立连接（允许多语句执行）

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`, // 创建数据库（不存在则创建）
  ) // 执行创建数据库
  await conn.query(`USE \`${database}\``) // 切换到目标数据库

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
  `) // 创建用户表（users）

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
  `) // 创建待办表（todos）

  const [users] = await conn.query("SELECT id FROM users WHERE username = ? LIMIT 1", ["demo"]) // 查询 demo 用户是否存在
  let demoUserId = Array.isArray(users) ? users[0]?.id : undefined // 读取 demo 用户 id（可能为 undefined）

  if (!demoUserId) {
    const passwordHash = await bcrypt.hash("demo", 10) // 生成 demo 密码 hash（明文 demo）
    await conn.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", ["demo", passwordHash]) // 创建 demo 用户
    const [createdUsers] = await conn.query("SELECT id FROM users WHERE username = ? LIMIT 1", ["demo"]) // 回读 demo 用户 id
    demoUserId = Array.isArray(createdUsers) ? createdUsers[0]?.id : undefined // 更新 demoUserId
  }

  const [columns] = await conn.query(
    "SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = ? AND table_name = 'todos' AND column_name = 'user_id'", // 检查 user_id 字段是否存在
    [database], // 参数：目标库名
  ) // 执行字段检查查询
  const hasUserId = Array.isArray(columns) ? Number(columns[0]?.cnt ?? 0) > 0 : false // 是否存在 user_id 字段

  if (!hasUserId) {
    await conn.query("ALTER TABLE todos ADD COLUMN user_id BIGINT UNSIGNED NULL") // 补充 user_id 字段（兼容旧表结构）
    await conn.query("ALTER TABLE todos ADD KEY idx_todos_user_id (user_id)") // 补充索引（按用户查询）
    await conn.query(
      "ALTER TABLE todos ADD CONSTRAINT fk_todos_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE", // 补充外键（删除用户时级联删除 todos）
    ) // 执行外键补充
  }

  if (demoUserId) {
    await conn.query("UPDATE todos SET user_id = ? WHERE user_id IS NULL", [demoUserId]) // 将历史 NULL user_id 的数据归属到 demo 用户
    await conn.query("ALTER TABLE todos MODIFY user_id BIGINT UNSIGNED NOT NULL") // 将 user_id 设为 NOT NULL（数据完成补齐后收紧约束）
  }

  const [rows] = await conn.query("SELECT COUNT(*) AS cnt FROM todos") // 查询 todos 总数（用于是否需要插入种子数据）
  const count = Array.isArray(rows) ? rows[0]?.cnt ?? 0 : 0 // 提取数量字段

  if (Number(count) === 0) {
    await conn.query(
      "INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)", // 插入三条 demo Todo
      [
        demoUserId, // 第一条：demo 用户 id
        "Learn Next.js Route Handler", // 第一条：标题
        1, // 第一条：已完成
        demoUserId, // 第二条：demo 用户 id
        "Connect MySQL in Docker", // 第二条：标题
        0, // 第二条：未完成
        demoUserId, // 第三条：demo 用户 id
        "Build Todo UI page", // 第三条：标题
        0, // 第三条：未完成
      ],
    ) // 执行插入种子数据
  }

  await conn.end() // 关闭数据库连接
  console.log("MySQL init done.") // 输出初始化完成日志
}

main().catch((e) => {
  console.error(e) // 输出错误（注意：不要输出敏感环境变量）
  process.exit(1) // 以非 0 退出码结束进程（便于 CI/脚本检测失败）
})
