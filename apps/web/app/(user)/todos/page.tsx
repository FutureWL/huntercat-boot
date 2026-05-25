"use client"

// Todo 页面（前端 UI）：通过 fetch 调用 /api/v1/todos* 接口，实现 CRUD 的完整闭环
import type { ApiResponse, AuthMeResponse, AuthUser, CreateTodoRequest, Todo, TodoListResponse, UpdateTodoRequest } from "@pjd/shared" // 共享契约：DTO 与统一响应结构
import { useRouter } from "next/navigation" // Next.js 客户端路由：用于跳转登录页
// React Hooks：用于管理页面状态与生命周期
import { useEffect, useMemo, useState } from "react" // useEffect：副作用；useMemo：派生状态；useState：本地状态

import { Button } from "@/components/ui/button" // 按钮组件（shadcn 风格）
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // 卡片组件（用于承载 Todo 面板）
import { Input } from "@/components/ui/input" // 输入框组件

// 页面 UI 状态：加载中/正常/错误
type UiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }

// 解析后端统一响应结构 ApiResponse<T>
async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T> // 解析 JSON 并断言为统一响应结构
  return json // 返回解析后的响应体
}

// 获取 Todo 列表
async function fetchTodoList(): Promise<TodoListResponse> {
  const res = await fetch("/api/v1/todos", { method: "GET" }) // 请求 Todo 列表
  const body = await parseJson<TodoListResponse>(res) // 解析统一响应
  if (!body.ok) throw new Error(body.error.message) // 失败时抛错，交给上层统一处理
  return body.data // 返回后端 data
}

// 创建 Todo
async function createTodo(title: string): Promise<Todo> {
  const payload: CreateTodoRequest = { title } // 组装创建请求体
  const res = await fetch("/api/v1/todos", { // 调用创建接口
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })
  const body = await parseJson<Todo>(res) // 解析统一响应
  if (!body.ok) throw new Error(body.error.message) // 失败时抛错
  return body.data // 返回创建后的 todo
}

// 局部更新 Todo（PATCH）
async function patchTodo(id: string, patch: UpdateTodoRequest): Promise<Todo> {
  const res = await fetch(`/api/v1/todos/${id}`, { // 调用更新接口（PATCH）
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  })
  const body = await parseJson<Todo>(res) // 解析统一响应
  if (!body.ok) throw new Error(body.error.message) // 失败时抛错
  return body.data // 返回更新后的 todo
}

// 删除 Todo
async function removeTodo(id: string): Promise<void> {
  const res = await fetch(`/api/v1/todos/${id}`, { method: "DELETE" }) // 调用删除接口
  const body = await parseJson<{ id: string }>(res) // 解析统一响应
  if (!body.ok) throw new Error(body.error.message) // 失败时抛错
}

export default function TodosPage() {
  const router = useRouter()
  // 页面状态：ui 表示加载/错误状态；items 表示列表；title 表示输入框内容；submitting 表示创建中
  const [ui, setUi] = useState<UiState>({ status: "idle" })
  const [items, setItems] = useState<Todo[]>([])
  const [user, setUser] = useState<AuthUser | null>(null)
  const [title, setTitle] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // 派生状态：未完成数量
  const remainingCount = useMemo(
    () => items.filter((t) => !t.completed).length,
    [items],
  )

  // 重新拉取列表（用于首次加载与手动刷新）
  async function refresh() {
    setUi({ status: "loading" })
    try {
      const data = await fetchTodoList()
      setItems(data.items)
      setUi({ status: "idle" })
    } catch (e) {
      const message = e instanceof Error ? e.message : "加载失败"
      if (message.includes("请先登录")) router.push("/login")
      setUi({ status: "error", message })
    }
  }

  async function ensureLogin() {
    const res = await fetch("/api/v1/auth/me", { method: "GET" }) // 查询当前登录用户
    const body = await parseJson<AuthMeResponse>(res) // 解析统一响应
    if (!body.ok) {
      router.push("/login") // 未登录：跳转到登录页
      return // 结束流程
    }
    setUser(body.data.user) // 写入当前用户信息
  }

  // 首次进入页面时加载列表
  useEffect(() => {
    void ensureLogin().then(() => refresh())
  }, [])

  async function onLogout() {
    await fetch("/api/v1/auth/logout", { method: "POST" }) // 调用退出登录接口（清 cookie + redis session）
    router.push("/login") // 退出后回到登录页
  }

  // 创建按钮/回车触发：创建成功后把新 todo 插到列表头部
  async function onCreate() {
    const trimmed = title.trim()
    if (!trimmed) return

    setSubmitting(true)
    try {
      const created = await createTodo(trimmed)
      setItems((prev) => [created, ...prev])
      setTitle("")
    } catch (e) {
      setUi({ status: "error", message: e instanceof Error ? e.message : "创建失败" })
    } finally {
      setSubmitting(false)
    }
  }

  // 勾选完成：切换 completed 状态并回写到列表
  async function onToggle(todo: Todo) {
    try {
      const updated = await patchTodo(todo.id, { completed: !todo.completed })
      setItems((prev) => prev.map((t) => (t.id === todo.id ? updated : t)))
    } catch (e) {
      setUi({ status: "error", message: e instanceof Error ? e.message : "更新失败" })
    }
  }

  // 删除按钮：删除成功后从列表移除
  async function onDelete(todo: Todo) {
    try {
      await removeTodo(todo.id)
      setItems((prev) => prev.filter((t) => t.id !== todo.id))
    } catch (e) {
      setUi({ status: "error", message: e instanceof Error ? e.message : "删除失败" })
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
          <p className="text-muted-foreground">
            这些数据来自 <code className="rounded bg-muted px-1 py-0.5">/api/v1/todos</code>（MySQL 持久化），并且按登录用户隔离。
          </p>
        </div>
        <Button variant="outline" type="button" onClick={() => void onLogout()}>
          退出登录
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">
            {user ? `当前用户：${user.username}` : "当前用户：…"}
          </CardTitle>
          <div className="text-sm text-muted-foreground">未完成：{remainingCount}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入一个 todo 标题"
              onKeyDown={(e) => {
                if (e.key === "Enter") void onCreate()
              }}
            />
            <div className="flex gap-2">
              <Button type="button" onClick={() => void onCreate()} disabled={submitting}>
                新增
              </Button>
              <Button type="button" variant="secondary" onClick={() => void refresh()}>
                刷新
              </Button>
            </div>
          </div>

          {ui.status === "loading" && <p className="text-sm text-muted-foreground">加载中…</p>}

          {ui.status === "error" && (
            <p className="text-sm text-destructive">错误：{ui.message}</p>
          )}

          <div className="divide-y rounded-md border bg-background/60">
            {items.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 px-3 py-2">
                <input
                  className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => void onToggle(todo)}
                />
                <div className="min-w-0 flex-1">
                  <div className={todo.completed ? "truncate line-through text-muted-foreground" : "truncate"}>
                    {todo.title}
                  </div>
                </div>
                <Button variant="ghost" type="button" onClick={() => void onDelete(todo)}>
                  删除
                </Button>
              </div>
            ))}

            {items.length === 0 && ui.status !== "loading" && (
              <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                暂无 Todo，先新增一个试试。
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

