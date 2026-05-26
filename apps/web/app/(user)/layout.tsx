import type { ReactNode } from "react" // ReactNode：用于标注 children 的类型
import { cookies } from "next/headers"
import { redirect } from "next/navigation" // redirect：服务端重定向（未登录跳转）

import { UserHeader } from "@/components/user-header" // 用户端顶栏：用户端导航 + 主题切换

export default async function UserLayout({ children }: { children: ReactNode }) {
  const sid = (await cookies()).get("sid")?.value
  if (!sid) redirect("/login")

  return (
    <>
      <UserHeader /> {/* 用户端统一顶栏 */}
      <div className="mx-auto max-w-5xl px-4 py-10 lg:max-w-7xl lg:px-8">{children}</div> {/* 用户端内容容器 */}
    </>
  )
}
