import type { ApiResponse } from "@pjd/shared"
import { NextResponse } from "next/server"

// 退出登录：删除 Redis Session，并清理 sid Cookie
import { deleteSession, SESSION_COOKIE_NAME, clearSessionCookie } from "@/src/server/session"

function ok<T>(data: T) {
  const body: ApiResponse<T> = { ok: true, data }
  return NextResponse.json(body)
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}

  const out: Record<string, string> = {}

  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=")
    if (!k) continue
    out[k] = decodeURIComponent(rest.join("="))
  }

  return out
}

export async function POST(request: Request) {
  const cookies = parseCookies(request.headers.get("cookie"))
  const sessionId = cookies[SESSION_COOKIE_NAME]

  if (sessionId) await deleteSession(sessionId)

  const res = ok<{ ok: true }>({ ok: true })
  clearSessionCookie(res)
  return res
}
