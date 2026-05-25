import type { ApiResponse } from "@pjd/shared"
import { NextResponse } from "next/server"

import { getSessionUserId } from "./session"

// 简单鉴权工具：从 session 取 userId；没有就返回 401 响应
export async function getUserIdOrUnauthorized(request: Request) {
  const userId = await getSessionUserId(request)
  if (userId) return { userId }

  const body: ApiResponse<never> = {
    ok: false,
    error: { code: "AUTH_REQUIRED", message: "Authentication required." },
  }

  return { response: NextResponse.json(body, { status: 401 }) }
}
