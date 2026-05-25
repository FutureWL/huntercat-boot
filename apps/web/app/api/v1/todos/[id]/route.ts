import type { ApiResponse, Todo, UpdateTodoRequest } from "@pjd/shared" // 引入共享契约：响应结构与更新 DTO
import { NextResponse } from "next/server" // Next.js 的 Response 帮手（返回 JSON 等）

// 这个路由文件处理单条 Todo：GET/PATCH/DELETE
// 数据库操作全部交给 src/server/todoRepo.ts，避免路由层与存储层强耦合
import { deleteTodo, getTodo, updateTodo } from "@/src/server/todoRepo" // 引入数据库 Repo（MySQL）

function ok<T>(data: T, init?: ResponseInit) {
  const body: ApiResponse<T> = { ok: true, data } // 统一成功响应体
  return NextResponse.json(body, init) // 返回 JSON（可附带 status 等）
}

function fail(status: number, code: "BAD_REQUEST" | "NOT_FOUND", message: string) {
  const body: ApiResponse<never> = { ok: false, error: { code, message } } // 统一失败响应体
  return NextResponse.json(body, { status }) // 返回指定状态码
}

export async function GET(
  _request: Request, // GET 不使用请求体，故参数名加 _ 表示刻意未使用
  context: { params: Promise<{ id: string }> }, // Next.js 15 的 route handler：params 是 Promise
) {
  const { id } = await context.params // 读取路由参数
  const todo = await getTodo(id) // 读取 Todo
  if (!todo) return fail(404, "NOT_FOUND", "Todo 不存在") // 找不到则 404
  return ok<Todo>(todo) // 返回详情
}

export async function PATCH(
  request: Request, // PATCH 请求对象（读取 JSON body）
  context: { params: Promise<{ id: string }> }, // Next.js 15 的 route handler：params 是 Promise
) {
  const { id } = await context.params // 读取路由参数
  let payload: UpdateTodoRequest // 声明请求体类型（UpdateTodoRequest）

  try {
    payload = (await request.json()) as UpdateTodoRequest // 解析 JSON 请求体
  } catch {
    return fail(400, "BAD_REQUEST", "请求体不是合法 JSON") // JSON 解析失败
  }

  if (!payload || typeof payload !== "object") {
    return fail(400, "BAD_REQUEST", "请求体不合法") // payload 为空或类型不对
  }

  const patch: UpdateTodoRequest = {} // 组装最终可写入的 patch（只放校验后的字段）

  if ("title" in payload) {
    if (payload.title !== undefined && typeof payload.title !== "string") {
      return fail(400, "BAD_REQUEST", "title 必须是字符串") // 类型校验失败
    }
    if (typeof payload.title === "string") {
      const title = payload.title.trim() // 去掉首尾空格
      if (!title) return fail(400, "BAD_REQUEST", "title 不能为空") // 空字符串不允许
      patch.title = title // 写入 patch
    }
  }

  if ("completed" in payload) {
    if (payload.completed !== undefined && typeof payload.completed !== "boolean") {
      return fail(400, "BAD_REQUEST", "completed 必须是布尔值") // 类型校验失败
    }
    if (typeof payload.completed === "boolean") patch.completed = payload.completed // 写入 patch
  }

  const updated = await updateTodo(id, patch) // 执行更新
  if (!updated) return fail(404, "NOT_FOUND", "Todo 不存在") // 找不到则 404

  return ok<Todo>(updated) // 返回更新后的实体
}

export async function DELETE(
  _request: Request, // DELETE 不使用请求体，故参数名加 _ 表示刻意未使用
  context: { params: Promise<{ id: string }> }, // Next.js 15 的 route handler：params 是 Promise
) {
  const { id } = await context.params // 读取路由参数
  const deleted = await deleteTodo(id) // 执行删除
  if (!deleted) return fail(404, "NOT_FOUND", "Todo 不存在") // 找不到则 404
  return ok<{ id: string }>(
    { id }, // 返回被删除的 id
    { status: 200 }, // 删除成功
  )
}
