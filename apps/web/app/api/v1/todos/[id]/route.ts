import type { ApiResponse, Todo, UpdateTodoRequest } from "@pjd/shared" // 引入共享契约：响应结构与更新 DTO
import { NextResponse } from "next/server" // Next.js 的 Response 帮手（返回 JSON 等）

// 这个路由文件处理单条 Todo：GET/PATCH/DELETE
// 数据库操作全部交给 src/server/todoRepo.ts，避免路由层与存储层强耦合
import { deleteTodo, getTodo, updateTodo } from "@/src/server/todoRepo" // 引入数据库 Repo（MySQL）
import { getUserIdOrUnauthorized } from "@/src/server/auth" // 鉴权：确保用户已登录

function ok<T>(data: T, init?: ResponseInit) {
  const body: ApiResponse<T> = { ok: true, data } // 统一成功响应体
  return NextResponse.json(body, init) // 返回 JSON（可附带 status 等）
}

function fail(status: number, code: "BAD_REQUEST_INVALID_JSON" | "BAD_REQUEST_VALIDATION" | "TODO_NOT_FOUND", message: string) {
  const body: ApiResponse<never> = { ok: false, error: { code, message } } // 统一失败响应体
  return NextResponse.json(body, { status }) // 返回指定状态码
}

export async function GET(
  request: Request, // 请求对象（读取 cookie 登录态）
  context: { params: Promise<{ id: string }> }, // Next.js 15 的 route handler：params 是 Promise
) {
  const { userId, response } = await getUserIdOrUnauthorized(request) // 获取当前登录用户
  if (response) return response // 未登录直接返回 401

  const { id } = await context.params // 读取路由参数
  const todo = await getTodo(userId!, id) // 读取 Todo（仅能读自己的）
  if (!todo) return fail(404, "TODO_NOT_FOUND", "Todo not found.") // 找不到则 404
  return ok<Todo>(todo) // 返回详情
}

export async function PATCH(
  request: Request, // PATCH 请求对象（读取 JSON body）
  context: { params: Promise<{ id: string }> }, // Next.js 15 的 route handler：params 是 Promise
) {
  const { userId, response } = await getUserIdOrUnauthorized(request) // 获取当前登录用户
  if (response) return response // 未登录直接返回 401

  const { id } = await context.params // 读取路由参数
  let payload: UpdateTodoRequest // 声明请求体类型（UpdateTodoRequest）

  try {
    payload = (await request.json()) as UpdateTodoRequest // 解析 JSON 请求体
  } catch {
    return fail(400, "BAD_REQUEST_INVALID_JSON", "Request body is not valid JSON.") // JSON 解析失败
  }

  if (!payload || typeof payload !== "object") {
    return fail(400, "BAD_REQUEST_VALIDATION", "Invalid request body.") // payload 为空或类型不对
  }

  const patch: UpdateTodoRequest = {} // 组装最终可写入的 patch（只放校验后的字段）

  if ("title" in payload) {
    if (payload.title !== undefined && typeof payload.title !== "string") {
      return fail(400, "BAD_REQUEST_VALIDATION", "Invalid title.") // 类型校验失败
    }
    if (typeof payload.title === "string") {
      const title = payload.title.trim() // 去掉首尾空格
      if (!title) return fail(400, "BAD_REQUEST_VALIDATION", "Invalid title.") // 空字符串不允许
      patch.title = title // 写入 patch
    }
  }

  if ("completed" in payload) {
    if (payload.completed !== undefined && typeof payload.completed !== "boolean") {
      return fail(400, "BAD_REQUEST_VALIDATION", "Invalid completed value.") // 类型校验失败
    }
    if (typeof payload.completed === "boolean") patch.completed = payload.completed // 写入 patch
  }

  const updated = await updateTodo(userId!, id, patch) // 执行更新（仅能改自己的）
  if (!updated) return fail(404, "TODO_NOT_FOUND", "Todo not found.") // 找不到则 404

  return ok<Todo>(updated) // 返回更新后的实体
}

export async function DELETE(
  request: Request, // 请求对象（读取 cookie 登录态）
  context: { params: Promise<{ id: string }> }, // Next.js 15 的 route handler：params 是 Promise
) {
  const { userId, response } = await getUserIdOrUnauthorized(request) // 获取当前登录用户
  if (response) return response // 未登录直接返回 401

  const { id } = await context.params // 读取路由参数
  const deleted = await deleteTodo(userId!, id) // 执行删除（仅能删自己的）
  if (!deleted) return fail(404, "TODO_NOT_FOUND", "Todo not found.") // 找不到则 404
  return ok<{ id: string }>(
    { id }, // 返回被删除的 id
    { status: 200 }, // 删除成功
  )
}
