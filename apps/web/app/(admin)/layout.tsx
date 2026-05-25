import type { ReactNode } from "react" // ReactNode：用于标注 children 的类型
import { headers } from "next/headers" // headers：读取请求头（用于取 cookie）
import { redirect } from "next/navigation" // redirect：服务端重定向（未登录跳转）

import { AdminHeader } from "@/components/admin-header" // 管理端顶栏：管理端导航 + 主题切换
import { getSessionUserIdFromCookieHeader } from "@/src/server/session" // 从 cookie header 解析登录态并读 Redis session

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieHeader = (await headers()).get("cookie") // 读取 cookie header（包含 sid）
  const userId = await getSessionUserIdFromCookieHeader(cookieHeader) // 从 Redis 取回 userId
  if (!userId) redirect("/login") // 未登录：跳转到登录页

  return (
    <>
      <AdminHeader /> {/* 管理端统一顶栏 */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">{children}</div> {/* 管理端内容容器：更宽 */}
    </>
  )
}
