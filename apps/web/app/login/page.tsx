"use client"

import type { ApiResponse, AuthMeResponse, LoginRequest } from "@pjd/shared"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>
  return json
}

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/v1/auth/me", { method: "GET" })
      const body = await parseJson<AuthMeResponse>(res)
      if (body.ok) router.push("/todos")
    })()
  }, [router])

  async function onSubmit() {
    setError(null)
    setSubmitting(true)

    try {
      const payload: LoginRequest = { username: username.trim(), password }
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await parseJson<AuthMeResponse>(res)
      if (!body.ok) {
        setError(body.error.message)
        return
      }
      router.push("/todos")
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 520 }}>
      <h1>登录</h1>

      <p style={{ color: "#555" }}>
        默认演示账号：<code>demo</code> / <code>demo</code>
      </p>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>用户名</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            style={{ padding: "8px 10px" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>密码</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
            style={{ padding: "8px 10px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void onSubmit()
            }}
          />
        </label>

        <button type="button" onClick={() => void onSubmit()} disabled={submitting}>
          登录
        </button>

        {error && <p style={{ color: "#b00020" }}>错误：{error}</p>}

        <p style={{ color: "#555" }}>
          没有账号？<a href="/register">去注册</a>
        </p>
      </div>
    </main>
  )
}

