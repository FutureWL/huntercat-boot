import type { ApiResponse, AuthMeResponse, RegisterRequest } from "@pjd/shared"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

// 注册接口：创建用户（MySQL）+ 创建 session（Redis）+ 下发 sid Cookie
import { createUser } from "@/src/server/userRepo"
import { createSession, setSessionCookie } from "@/src/server/session"

function ok<T>(data: T, init?: ResponseInit) {
  const body: ApiResponse<T> = { ok: true, data }
  return NextResponse.json(body, init)
}

function fail(status: number, code: "BAD_REQUEST" | "CONFLICT", message: string) {
  const body: ApiResponse<never> = { ok: false, error: { code, message } }
  return NextResponse.json(body, { status })
}

export async function POST(request: Request) {
  let payload: RegisterRequest

  try {
    payload = (await request.json()) as RegisterRequest
  } catch {
    return fail(400, "BAD_REQUEST", "请求体不是合法 JSON")
  }

  if (!payload || typeof payload.username !== "string" || typeof payload.password !== "string") {
    return fail(400, "BAD_REQUEST", "username/password 必须是字符串")
  }

  const username = payload.username.trim()
  const password = payload.password

  if (!username) return fail(400, "BAD_REQUEST", "username 不能为空")
  if (username.length > 64) return fail(400, "BAD_REQUEST", "username 过长")
  if (password.length < 6) return fail(400, "BAD_REQUEST", "password 至少 6 位")

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const user = await createUser(username, passwordHash)
    const sessionId = await createSession(user.id)
    const res = ok<AuthMeResponse>({ user }, { status: 201 })
    setSessionCookie(res, sessionId)
    return res
  } catch (e) {
    const code = (e as { code?: string } | undefined)?.code
    if (code === "ER_DUP_ENTRY") return fail(409, "CONFLICT", "用户名已存在")
    return fail(400, "BAD_REQUEST", "注册失败")
  }
}
