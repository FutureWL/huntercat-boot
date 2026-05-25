import type { ApiResponse, CreateTodoRequest, Todo, TodoListResponse } from "@pjd/shared" // 引入共享契约：响应结构与 DTO
import { NextResponse } from "next/server" // Next.js 的 Response 帮手（返回 JSON 等）

// 这个路由文件是“协议适配层”：只处理 HTTP 输入输出，不直接写 SQL
// 真正的数据读写在 src/server/todoRepo.ts（MySQL）
import { createTodo, listTodos } from "@/src/server/todoRepo" // 引入数据库 Repo（MySQL）

function ok<T>(data: T, init?: ResponseInit) {
  const body: ApiResponse<T> = { ok: true, data } // 统一成功响应体
  return NextResponse.json(body, init) // 返回 JSON（可附带 status 等）
}

function badRequest(message: string) {
  const body: ApiResponse<never> = { // 统一失败响应体
    ok: false, // 标记失败
    error: { code: "BAD_REQUEST", message }, // 填充错误码与错误信息
  } // body
  return NextResponse.json(body, { status: 400 }) // 返回 400
}

export async function GET() {
  const items = await listTodos() // 从数据库读取列表
  const data: TodoListResponse = { items } // 组装列表响应
  return ok<TodoListResponse>(data) // 返回列表
}

export async function POST(request: Request) {
  let payload: CreateTodoRequest // 声明请求体类型（CreateTodoRequest）

  try {
    payload = (await request.json()) as CreateTodoRequest // 解析 JSON 请求体
  } catch {
    return badRequest("请求体不是合法 JSON") // JSON 解析失败
  }

  if (!payload || typeof payload.title !== "string") {
    return badRequest("title 必须是字符串") // 字段校验失败
  }

  const title = payload.title.trim() // 去掉首尾空格
  if (!title) {
    return badRequest("title 不能为空") // 空字符串不允许
  }

  const created: Todo = await createTodo(title) // 创建 Todo
  return ok<Todo>(created, { status: 201 }) // 返回 201 Created
}
