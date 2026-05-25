import { makeHello } from "@pjd/shared"

// 首页：演示 monorepo 的“共享包（@pjd/shared）→ Web 应用（@pjd/web）”的直接复用
export default function HomePage() {
  // 这里是“页面端”调用 shared 的纯函数
  const { message } = makeHello("Monorepo")

  return (
    <main style={{ padding: 24 }}>
      <h1>{message}</h1>
      <p>这个字符串来自 packages/shared，并在 apps/web 中直接复用。</p>
      <p>
        {/* 这里是“服务端 API”也复用同一份 shared 逻辑 */}
        试试访问 <a href="/api/hello?name=TS">/api/hello?name=TS</a>
      </p>
      <p>
        Todo 示例页面：<a href="/todos">/todos</a>
      </p>
      <p>
        登录/注册：<a href="/login">/login</a> | <a href="/register">/register</a>
      </p>
    </main>
  )
}
