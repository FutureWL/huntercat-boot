"use client"

// Todo 页面（前端 UI）：通过 fetch 调用 /api/v1/todos* 接口，实现 CRUD 的完整闭环
import type { ApiResponse, AuthMeResponse, AuthUser, CreateTodoRequest, Todo, TodoListResponse, UpdateTodoRequest } from "@pjd/shared"
import { useRouter } from "next/navigation"
// React Hooks：用于管理页面状态与生命周期
import { useEffect, useMemo, useState } from "react"

// 页面 UI 状态：加载中/正常/错误
type UiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }

// 解析后端统一响应结构 ApiResponse<T>
async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>
  return json
}

// 获取 Todo 列表
async function fetchTodoList(): Promise<TodoListResponse> {
  const res = await fetch("/api/v1/todos", { method: "GET" })
  const body = await parseJson<TodoListResponse>(res)
  if (!body.ok) throw new Error(body.error.message)
  return body.data
}

// 创建 Todo
async function createTodo(title: string): Promise<Todo> {
  const payload: CreateTodoRequest = { title }
  const res = await fetch("/api/v1/todos", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })
  const body = await parseJson<Todo>(res)
  if (!body.ok) throw new Error(body.error.message)
  return body.data
}

// 局部更新 Todo（PATCH）
async function patchTodo(id: string, patch: UpdateTodoRequest): Promise<Todo> {
  const res = await fetch(`/api/v1/todos/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  })
  const body = await parseJson<Todo>(res)
  if (!body.ok) throw new Error(body.error.message)
  return body.data
}

// 删除 Todo
async function removeTodo(id: string): Promise<void> {
  const res = await fetch(`/api/v1/todos/${id}`, { method: "DELETE" })
  const body = await parseJson<{ id: string }>(res)
  if (!body.ok) throw new Error(body.error.message)
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
    const res = await fetch("/api/v1/auth/me", { method: "GET" })
    const body = await parseJson<AuthMeResponse>(res)
    if (!body.ok) {
      router.push("/login")
      return
    }
    setUser(body.data.user)
  }

  // 首次进入页面时加载列表
  useEffect(() => {
    void ensureLogin().then(() => refresh())
  }, [])

  async function onLogout() {
    await fetch("/api/v1/auth/logout", { method: "POST" })
    router.push("/login")
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
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Todos</h1>

      <p style={{ color: "#555" }}>
        这些数据来自 <code>/api/v1/todos</code>（MySQL 持久化），并且按登录用户隔离。
      </p>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
        <span style={{ color: "#555" }}>当前用户：{user ? user.username : "…"}</span>
        <button type="button" onClick={() => void onLogout()}>
          退出登录
        </button>
      </div>

      {/* 创建区：输入标题 + 新增 + 刷新 */}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入一个 todo 标题"
          style={{ flex: 1, padding: "8px 10px" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void onCreate()
          }}
        />
        <button
          type="button"
          onClick={() => void onCreate()}
          disabled={submitting}
          style={{ padding: "8px 12px" }}
        >
          新增
        </button>
        <button
          type="button"
          onClick={() => void refresh()}
          style={{ padding: "8px 12px" }}
        >
          刷新
        </button>
      </div>

      {/* 加载提示 */}
      {ui.status === "loading" && <p style={{ marginTop: 12 }}>加载中…</p>}

      {/* 错误提示 */}
      {ui.status === "error" && (
        <p style={{ marginTop: 12, color: "#b00020" }}>
          错误：{ui.message}
        </p>
      )}

      <p style={{ marginTop: 12, color: "#555" }}>未完成：{remainingCount}</p>

      {/* 列表区：逐条展示 Todo，并提供勾选/删除 */}
      <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
        {items.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 8px",
              borderBottom: "1px solid #eee",
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => void onToggle(todo)}
            />
            <span style={{ flex: 1, textDecoration: todo.completed ? "line-through" : "none" }}>
              {todo.title}
            </span>
            <button type="button" onClick={() => void onDelete(todo)}>
              删除
            </button>
          </li>
        ))}
      </ul>

      {/* 空态 */}
      {items.length === 0 && ui.status !== "loading" && (
        <p style={{ marginTop: 12, color: "#777" }}>暂无 Todo，先新增一个试试。</p>
      )}
    </main>
  )
}
