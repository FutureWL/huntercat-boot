import type { ReactNode } from "react" // ReactNode：用于标注 children 的类型
import { headers } from "next/headers" // headers：读取请求头（用于取 cookie）
import { redirect } from "next/navigation" // redirect：服务端重定向（未登录跳转）

import { getSessionUserIdFromCookieHeader } from "@/src/server/session" // 从 cookie header 解析登录态并读 Redis session

export default async function CockpitLayout({ children }: { children: ReactNode }) {
  const cookieHeader = (await headers()).get("cookie") // 读取 cookie header（包含 sid）
  const userId = await getSessionUserIdFromCookieHeader(cookieHeader) // 从 Redis 取回 userId
  if (!userId) redirect("/login") // 未登录：跳转到登录页

  return (
    <div className="min-h-dvh w-full bg-background text-foreground"> {/* 驾驶舱全屏容器：不限制宽度 */}
      {children}
    </div>
  )
}
