import type { Todo } from "@pjd/shared" // 引入共享的 Todo 类型（对外返回的字段结构）
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise" // 引入 MySQL 查询结果类型（用于类型标注）
import { Injectable } from "@nestjs/common" // 引入 NestJS 可注入装饰器

import { MysqlService } from "../db/mysql.service" // 引入 MySQL 服务（提供连接池）

type TodoRow = RowDataPacket & {
  id: number // 主键 id（数据库为数字）
  title: string // Todo 标题
  completed: 0 | 1 // 完成状态（MySQL 中用 0/1 表示）
  created_at: Date // 创建时间（数据库时间）
  updated_at: Date // 更新时间（数据库时间）
} // 结束 TodoRow 类型定义

function mapRow(row: TodoRow): Todo {
  return {
    id: String(row.id), // 将数字 id 转为字符串（对外统一 string）
    title: row.title, // 透传标题
    completed: row.completed === 1, // 将 0/1 转为 boolean
    createdAt: row.created_at.toISOString(), // 将 Date 转为 ISO 字符串（便于前端展示）
    updatedAt: row.updated_at.toISOString(), // 将 Date 转为 ISO 字符串（便于前端展示）
  } // 结束返回对象
} // 结束 mapRow

@Injectable() // 声明为可注入仓储（由 NestJS DI 管理）
export class TodoRepository {
  constructor(private readonly mysql: MysqlService) {} // 注入 MySQL 服务（获取连接池）

  async listTodos(userId: string): Promise<Todo[]> {
    const pool = this.mysql.getPool() // 获取连接池（复用连接）
    const [rows] = await pool.query<TodoRow[]>(
      "SELECT id, title, completed, created_at, updated_at FROM todos WHERE user_id = ? ORDER BY id DESC", // 仅查询当前用户的数据（按 user_id 隔离）
      [Number(userId)], // 参数化查询：避免 SQL 注入
    ) // 执行查询
    return rows.map(mapRow) // 映射为对外 Todo 类型数组
  }

  async getTodo(userId: string, id: string): Promise<Todo | undefined> {
    const pool = this.mysql.getPool() // 获取连接池
    const [rows] = await pool.query<TodoRow[]>(
      "SELECT id, title, completed, created_at, updated_at FROM todos WHERE user_id = ? AND id = ? LIMIT 1", // 按 user_id + id 查询单条（越权访问会查不到）
      [Number(userId), Number(id)], // 参数化查询：避免 SQL 注入
    ) // 执行查询
    const row = rows[0] // 读取第一条结果
    return row ? mapRow(row) : undefined // 有结果则映射，否则返回 undefined
  }

  async createTodo(userId: string, title: string): Promise<Todo> {
    const pool = this.mysql.getPool() // 获取连接池
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?)", // 插入一条 Todo（初始 completed=0）
      [Number(userId), title, 0], // 参数化查询：避免 SQL 注入
    ) // 执行插入

    const created = await this.getTodo(userId, String(result.insertId)) // 回读刚插入的数据（统一返回结构）
    if (!created) throw new Error("Todo created but failed to read back") // 理论不应发生：插入成功但回读失败
    return created // 返回创建结果
  }

  async updateTodo(
    userId: string, // 当前用户 id（用于隔离数据）
    id: string, // Todo id
    patch: Partial<Pick<Todo, "title" | "completed">>, // 可更新字段：title/completed
  ): Promise<Todo | undefined> {
    const pool = this.mysql.getPool() // 获取连接池

    const updates: string[] = [] // SQL SET 片段集合（按传入字段拼接）
    const params: (string | number)[] = [] // 参数数组（与 updates 对齐）

    if (patch.title !== undefined) {
      updates.push("title = ?") // 拼接 title 更新
      params.push(patch.title) // 追加对应参数
    }

    if (patch.completed !== undefined) {
      updates.push("completed = ?") // 拼接 completed 更新
      params.push(patch.completed ? 1 : 0) // 将 boolean 转为 0/1
    }

    if (updates.length === 0) return await this.getTodo(userId, id) // 无可更新字段：直接回读当前值（保持幂等）

    params.push(Number(id)) // 追加 where 参数：id
    params.push(Number(userId)) // 追加 where 参数：user_id（避免越权更新）
    await pool.execute(`UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`, params) // 执行更新（参数化 + user_id 限制）

    return await this.getTodo(userId, id) // 更新后回读，返回最新数据
  }

  async deleteTodo(userId: string, id: string): Promise<boolean> {
    const pool = this.mysql.getPool() // 获取连接池
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM todos WHERE user_id = ? AND id = ?", // 按 user_id + id 删除（避免越权删除）
      [Number(userId), Number(id)], // 参数化查询：避免 SQL 注入
    ) // 执行删除
    return result.affectedRows > 0 // 返回是否删除成功（影响行数 > 0）
  }
}
