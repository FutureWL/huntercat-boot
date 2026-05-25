import { makeHello } from "@pjd/shared" // 从共享包导入演示函数（monorepo 跨包复用）

// 首页：演示 monorepo 的“共享包（@pjd/shared）→ Web 应用（@pjd/web）”的直接复用
export default function HomePage() {
  // 这里是“页面端”调用 shared 的纯函数
  const { message } = makeHello("Monorepo")

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{message}</h1>
      <p className="text-muted-foreground">
        这个字符串来自 packages/shared，并在 apps/web 中直接复用。
      </p>
      <div className="flex flex-wrap gap-3">
        <a className="underline underline-offset-4 hover:text-primary" href="/api/hello?name=TS"> {/* 示例接口：hello */}
          /api/hello?name=TS
        </a>
        <a className="underline underline-offset-4 hover:text-primary" href="/todos"> {/* Todo 页面入口 */}
          /todos
        </a>
        <a className="underline underline-offset-4 hover:text-primary" href="/login"> {/* 登录页面入口 */}
          /login
        </a>
        <a className="underline underline-offset-4 hover:text-primary" href="/register"> {/* 注册页面入口 */}
          /register
        </a>
      </div>
    </main>
  )
}
