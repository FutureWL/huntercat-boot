"use client"

import type { ApiResponse, AuthMeResponse, RegisterRequest } from "@pjd/shared"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    <main className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>注册</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码（至少 6 位）</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              type="password"
              autoComplete="new-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSubmit()
              }}
            />
          </div>

          <Button className="w-full" type="button" onClick={() => void onSubmit()} disabled={submitting}>
            注册并登录
          </Button>

          {error && <p className="text-sm text-destructive">错误：{error}</p>}

          <p className="text-sm text-muted-foreground">
            已有账号？{" "}
            <a className="underline underline-offset-4 hover:text-primary" href="/login">
              去登录
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
