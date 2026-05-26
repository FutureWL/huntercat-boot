import type { Todo } from "@pjd/shared"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { Injectable } from "@nestjs/common"

import { MysqlService } from "../db/mysql.service"

type TodoRow = RowDataPacket & {
  id: number
  title: string
  completed: 0 | 1
  created_at: Date
  updated_at: Date
}

function mapRow(row: TodoRow): Todo {
  return {
    id: String(row.id),
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

@Injectable()
export class TodoRepository {
  constructor(private readonly mysql: MysqlService) {}

  async listTodos(userId: string): Promise<Todo[]> {
    const pool = this.mysql.getPool()
    const [rows] = await pool.query<TodoRow[]>(
      "SELECT id, title, completed, created_at, updated_at FROM todos WHERE user_id = ? ORDER BY id DESC",
      [Number(userId)],
    )
    return rows.map(mapRow)
  }

  async getTodo(userId: string, id: string): Promise<Todo | undefined> {
    const pool = this.mysql.getPool()
    const [rows] = await pool.query<TodoRow[]>(
      "SELECT id, title, completed, created_at, updated_at FROM todos WHERE user_id = ? AND id = ? LIMIT 1",
      [Number(userId), Number(id)],
    )
    const row = rows[0]
    return row ? mapRow(row) : undefined
  }

  async createTodo(userId: string, title: string): Promise<Todo> {
    const pool = this.mysql.getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?)",
      [Number(userId), title, 0],
    )

    const created = await this.getTodo(userId, String(result.insertId))
    if (!created) throw new Error("Todo created but failed to read back")
    return created
  }

  async updateTodo(
    userId: string,
    id: string,
    patch: Partial<Pick<Todo, "title" | "completed">>,
  ): Promise<Todo | undefined> {
    const pool = this.mysql.getPool()

    const updates: string[] = []
    const params: (string | number)[] = []

    if (patch.title !== undefined) {
      updates.push("title = ?")
      params.push(patch.title)
    }

    if (patch.completed !== undefined) {
      updates.push("completed = ?")
      params.push(patch.completed ? 1 : 0)
    }

    if (updates.length === 0) return await this.getTodo(userId, id)

    params.push(Number(id))
    params.push(Number(userId))
    await pool.execute(`UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`, params)

    return await this.getTodo(userId, id)
  }

  async deleteTodo(userId: string, id: string): Promise<boolean> {
    const pool = this.mysql.getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM todos WHERE user_id = ? AND id = ?",
      [Number(userId), Number(id)],
    )
    return result.affectedRows > 0
  }
}

