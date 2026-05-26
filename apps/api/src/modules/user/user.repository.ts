import type { AuthUser } from "@pjd/shared" // 引入共享的用户类型（对外返回的字段结构）
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise" // 引入 MySQL 查询结果类型（用于类型标注）
import { Injectable } from "@nestjs/common" // 引入 NestJS 可注入装饰器

import { MysqlService } from "../db/mysql.service" // 引入 MySQL 服务（提供连接池）

type UserRow = RowDataPacket & {
  id: number // 主键 id（数据库为数字）
  username: string // 用户名
  password_hash: string // 密码 hash（数据库字段为下划线命名）
} // 结束 UserRow 类型定义

export type UserWithPassword = {
  id: string // 用户 id（对外统一 string）
  username: string // 用户名
  passwordHash: string // 密码 hash（驼峰字段供上层使用）
} // 结束 UserWithPassword 类型定义

function mapUser(row: Pick<UserRow, "id" | "username">): AuthUser {
  return { id: String(row.id), username: row.username } // 将数据库行映射为对外用户类型
}

@Injectable() // 声明为可注入仓储（由 NestJS DI 管理）
export class UserRepository {
  constructor(private readonly mysql: MysqlService) {} // 注入 MySQL 服务（获取连接池）

  async getUserById(id: string): Promise<AuthUser | undefined> {
    const pool = this.mysql.getPool() // 获取连接池
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, username, password_hash FROM users WHERE id = ? LIMIT 1", // 按 id 查询用户
      [Number(id)], // 参数化查询：避免 SQL 注入
    ) // 执行查询

    const row = rows[0] // 读取第一条结果
    return row ? mapUser(row) : undefined // 有结果则映射，否则返回 undefined
  }

  async getUserWithPasswordByUsername(username: string): Promise<UserWithPassword | undefined> {
    const pool = this.mysql.getPool() // 获取连接池
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1", // 按用户名查询用户（用于登录）
      [username], // 参数化查询：避免 SQL 注入
    ) // 执行查询

    const row = rows[0] // 读取第一条结果
    if (!row) return undefined // 未找到则返回 undefined
    return { id: String(row.id), username: row.username, passwordHash: row.password_hash } // 映射并返回（包含 passwordHash）
  }

  async createUser(username: string, passwordHash: string): Promise<AuthUser> {
    const pool = this.mysql.getPool() // 获取连接池
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)", // 插入用户（密码存 hash，不存明文）
      [username, passwordHash], // 参数化查询：避免 SQL 注入
    ) // 执行插入

    const created = await this.getUserById(String(result.insertId)) // 回读刚插入的用户（统一返回结构）
    if (!created) throw new Error("User created but failed to read back") // 理论不应发生：插入成功但回读失败
    return created // 返回创建结果
  }
}
