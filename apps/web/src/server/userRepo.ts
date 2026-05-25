import type { AuthUser } from "@pjd/shared"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"

import { getDbPool } from "./db"

// users 表：存用户名与密码哈希（不存明文密码）
type UserRow = RowDataPacket & {
  id: number
  username: string
  password_hash: string
}

export type UserWithPassword = {
  id: string
  username: string
  passwordHash: string
}

function mapUser(row: Pick<UserRow, "id" | "username">): AuthUser {
  return { id: String(row.id), username: row.username }
}

// 按 id 查用户（不返回密码哈希）
export async function getUserById(id: string): Promise<AuthUser | undefined> {
  const pool = getDbPool()
  const [rows] = await pool.query<UserRow[]>(
    "SELECT id, username, password_hash FROM users WHERE id = ? LIMIT 1",
    [Number(id)],
  )

  const row = rows[0]
  return row ? mapUser(row) : undefined
}

// 按用户名查用户（用于登录校验，需要取出 password_hash）
export async function getUserWithPasswordByUsername(
  username: string,
): Promise<UserWithPassword | undefined> {
  const pool = getDbPool()
  const [rows] = await pool.query<UserRow[]>(
    "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
    [username],
  )

  const row = rows[0]
  if (!row) return undefined

  return { id: String(row.id), username: row.username, passwordHash: row.password_hash }
}

// 创建用户：username 唯一，passwordHash 用 bcrypt 生成
export async function createUser(
  username: string,
  passwordHash: string,
): Promise<AuthUser> {
  const pool = getDbPool()
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, passwordHash],
  )

  const created = await getUserById(String(result.insertId))
  if (!created) throw new Error("创建用户成功但读取失败")
  return created
}
