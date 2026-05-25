"use client"

import type { ApiResponse, AuthMeResponse, LoginRequest } from "@pjd/shared" // 共享契约：统一响应结构 + 登录/当前用户 DTO
import { useRouter } from "next/navigation" // Next.js 客户端路由：用于跳转页面
import { useEffect, useState } from "react" // React Hooks：状态与副作用

import { Button } from "@/components/ui/button" // 按钮组件（shadcn 风格）
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // 卡片组件（用于登录表单容器）
import { Input } from "@/components/ui/input" // 输入框组件
import { Label } from "@/components/ui/label" // 表单标签组件

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T> // 解析 JSON 并断言为统一响应结构
  return json // 返回解析后的响应体
}

export default function LoginPage() {
  const router = useRouter() // 路由实例：用于跳转
  const [username, setUsername] = useState("") // 用户名输入框状态
  const [password, setPassword] = useState("") // 密码输入框状态
  const [submitting, setSubmitting] = useState(false) // 提交中状态：用于禁用按钮
  const [error, setError] = useState<string | null>(null) // 错误信息：用于页面提示

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/v1/auth/me", { method: "GET" }) // 探测是否已登录
      const body = await parseJson<AuthMeResponse>(res) // 解析统一响应
      if (body.ok) router.push("/todos") // 已登录则直接进入 Todos
    })()
  }, [router])

  async function onSubmit() {
    setError(null) // 提交前清空上一次错误
    setSubmitting(true) // 进入提交中状态

    try {
      const payload: LoginRequest = { username: username.trim(), password } // 组装登录请求体
      const res = await fetch("/api/v1/auth/login", { // 调用登录接口（成功会写入 HttpOnly sid cookie）
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await parseJson<AuthMeResponse>(res) // 解析登录返回（包含 user）
      if (!body.ok) {
        setError(body.error.message) // 登录失败：展示后端错误信息
        return // 直接结束，不跳转
      }
      router.push("/todos") // 登录成功：跳转到 Todos
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败") // 网络/未知错误兜底提示
    } finally {
      setSubmitting(false) // 无论成功/失败都退出提交中状态
    }
  }

  return (
    <main className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>
            默认演示账号：<code className="rounded bg-muted px-1 py-0.5">demo</code> /{" "}
            <code className="rounded bg-muted px-1 py-0.5">demo</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // 同步用户名输入
              placeholder="username"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // 同步密码输入
              placeholder="password"
              type="password"
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSubmit() // 回车触发登录
              }}
            />
          </div>

          <Button className="w-full" type="button" onClick={() => void onSubmit()} disabled={submitting}>
            登录
          </Button>

          {error && <p className="text-sm text-destructive">错误：{error}</p>} {/* 错误提示 */}

          <p className="text-sm text-muted-foreground">
            没有账号？{" "}
            <a className="underline underline-offset-4 hover:text-primary" href="/register">
              去注册
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

