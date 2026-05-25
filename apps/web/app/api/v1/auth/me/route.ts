import type { ApiResponse, AuthMeResponse } from "@pjd/shared"
import { NextResponse } from "next/server"

// 当前登录用户：从 session 取 userId，再从 MySQL 读取用户信息
import { getUserIdOrUnauthorized } from "@/src/server/auth"
import { getUserById } from "@/src/server/userRepo"

function ok<T>(data: T) {
  const body: ApiResponse<T> = { ok: true, data }
  return NextResponse.json(body)
}

export async function GET(request: Request) {
  const { userId, response } = await getUserIdOrUnauthorized(request)
  if (response) return response

  const user = await getUserById(userId!)
  if (!user) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { code: "AUTH_SESSION_INVALID", message: "Session invalid." },
    }
    return NextResponse.json(body, { status: 401 })
  }

  return ok<AuthMeResponse>({ user })
}
