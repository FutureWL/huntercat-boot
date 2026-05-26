import type { ReactNode } from "react" // ReactNode：用于标注 children 的类型
import { cookies } from "next/headers"
import { redirect } from "next/navigation" // redirect：服务端重定向（未登录跳转）

import { AdminHeader } from "@/components/admin-header" // 管理端顶栏：管理端导航 + 主题切换

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const sid = (await cookies()).get("sid")?.value
  if (!sid) redirect("/login")

  return (
    <>
      <AdminHeader /> {/* 管理端统一顶栏 */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">{children}</div> {/* 管理端内容容器：更宽 */}
    </>
  )
}
