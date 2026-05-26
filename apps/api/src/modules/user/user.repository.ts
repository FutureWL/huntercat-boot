import type { AuthUser } from "@pjd/shared"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { Injectable } from "@nestjs/common"

import { MysqlService } from "../db/mysql.service"

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

@Injectable()
export class UserRepository {
  constructor(private readonly mysql: MysqlService) {}

  async getUserById(id: string): Promise<AuthUser | undefined> {
    const pool = this.mysql.getPool()
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, username, password_hash FROM users WHERE id = ? LIMIT 1",
      [Number(id)],
    )

    const row = rows[0]
    return row ? mapUser(row) : undefined
  }

  async getUserWithPasswordByUsername(username: string): Promise<UserWithPassword | undefined> {
    const pool = this.mysql.getPool()
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
      [username],
    )

    const row = rows[0]
    if (!row) return undefined
    return { id: String(row.id), username: row.username, passwordHash: row.password_hash }
  }

  async createUser(username: string, passwordHash: string): Promise<AuthUser> {
    const pool = this.mysql.getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, passwordHash],
    )

    const created = await this.getUserById(String(result.insertId))
    if (!created) throw new Error("User created but failed to read back")
    return created
  }
}

