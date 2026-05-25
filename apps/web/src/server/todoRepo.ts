// TodoRepo：把所有 Todo 的 SQL 操作集中到一层，Route Handler 只做协议适配（高内聚、低耦合）
import type { Todo } from "@pjd/shared"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"

import { getDbPool } from "./db"

// 数据库行结构（下划线命名是为了和表字段一致）
type TodoRow = RowDataPacket & {
  id: number
  title: string
  completed: 0 | 1
  created_at: Date
  updated_at: Date
}

// 把数据库行转换成前后端共享的 Todo 结构（字段命名转为 camelCase）
function mapRow(row: TodoRow): Todo {
  return {
    id: String(row.id),
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

// 列表：按 id 倒序（新建的在前）
export async function listTodos(): Promise<Todo[]> {
  const pool = getDbPool()
  const [rows] = await pool.query<TodoRow[]>(
    "SELECT id, title, completed, created_at, updated_at FROM todos ORDER BY id DESC",
  )
  return rows.map(mapRow)
}

// 详情：按主键查询
export async function getTodo(id: string): Promise<Todo | undefined> {
  const pool = getDbPool()
  const [rows] = await pool.query<TodoRow[]>(
    "SELECT id, title, completed, created_at, updated_at FROM todos WHERE id = ? LIMIT 1",
    [Number(id)],
  )

  const row = rows[0]
  return row ? mapRow(row) : undefined
}

// 创建：插入后再读一次，保证返回的数据与数据库一致（包含 created_at/updated_at）
export async function createTodo(title: string): Promise<Todo> {
  const pool = getDbPool()
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO todos (title, completed) VALUES (?, ?)",
    [title, 0],
  )

  const created = await getTodo(String(result.insertId))
  if (!created) throw new Error("创建成功但读取失败")
  return created
}

// 更新：只更新请求里出现的字段（PATCH 语义）
export async function updateTodo(
  id: string,
  patch: Partial<Pick<Todo, "title" | "completed">>,
): Promise<Todo | undefined> {
  const pool = getDbPool()

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

  if (updates.length === 0) return await getTodo(id)

  params.push(Number(id))
  await pool.execute(`UPDATE todos SET ${updates.join(", ")} WHERE id = ?`, params)

  return await getTodo(id)
}

// 删除：返回是否真的删到了数据
export async function deleteTodo(id: string): Promise<boolean> {
  const pool = getDbPool()
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM todos WHERE id = ?",
    [Number(id)],
  )
  return result.affectedRows > 0
}
