"use client"

import type { ApiResponse, AuthMeResponse, RegisterRequest } from "@pjd/shared"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>
  return json
}

export default function RegisterPage() {
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
      const payload: RegisterRequest = { username: username.trim(), password }
      const res = await fetch("/api/v1/auth/register", {
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
      setError(e instanceof Error ? e.message : "注册失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 520 }}>
      <h1>注册</h1>

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
          <span>密码（至少 6 位）</span>
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
          注册并登录
        </button>

        {error && <p style={{ color: "#b00020" }}>错误：{error}</p>}

        <p style={{ color: "#555" }}>
          已有账号？<a href="/login">去登录</a>
        </p>
      </div>
    </main>
  )
}

