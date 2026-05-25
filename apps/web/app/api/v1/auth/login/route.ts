import type { ApiResponse, AuthMeResponse, LoginRequest } from "@pjd/shared"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

// 登录接口：校验 username/password，通过后创建 Redis Session 并下发 HttpOnly Cookie（sid）
import { getUserWithPasswordByUsername } from "@/src/server/userRepo"
import { createSession, setSessionCookie } from "@/src/server/session"

function ok<T>(data: T, init?: ResponseInit) {
  const body: ApiResponse<T> = { ok: true, data }
  return NextResponse.json(body, init)
}

function fail(status: number, code: "BAD_REQUEST" | "UNAUTHORIZED", message: string) {
  const body: ApiResponse<never> = { ok: false, error: { code, message } }
  return NextResponse.json(body, { status })
}

export async function POST(request: Request) {
  let payload: LoginRequest

  try {
    payload = (await request.json()) as LoginRequest
  } catch {
    return fail(400, "BAD_REQUEST", "请求体不是合法 JSON")
  }

  if (!payload || typeof payload.username !== "string" || typeof payload.password !== "string") {
    return fail(400, "BAD_REQUEST", "username/password 必须是字符串")
  }

  const username = payload.username.trim()
  const password = payload.password

  if (!username) return fail(400, "BAD_REQUEST", "username 不能为空")

  const user = await getUserWithPasswordByUsername(username)
  if (!user) return fail(401, "UNAUTHORIZED", "用户名或密码错误")

  const okPassword = await bcrypt.compare(password, user.passwordHash)
  if (!okPassword) return fail(401, "UNAUTHORIZED", "用户名或密码错误")

  const sessionId = await createSession(user.id)
  const res = ok<AuthMeResponse>({ user: { id: user.id, username: user.username } })
  setSessionCookie(res, sessionId)
  return res
}
