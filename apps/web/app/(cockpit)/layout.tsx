import type { ReactNode } from "react" // ReactNode：用于标注 children 的类型
import { cookies } from "next/headers"
import { redirect } from "next/navigation" // redirect：服务端重定向（未登录跳转）

export default async function CockpitLayout({ children }: { children: ReactNode }) {
  const sid = (await cookies()).get("sid")?.value
  if (!sid) redirect("/login")

  return (
    <div className="min-h-dvh w-full bg-background text-foreground"> {/* 驾驶舱全屏容器：不限制宽度 */}
      {children}
    </div>
  )
}
