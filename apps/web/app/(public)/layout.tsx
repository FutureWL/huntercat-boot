import type { ReactNode } from "react" // ReactNode：用于标注 children 的类型

import { SiteHeader } from "@/components/site-header" // 站点顶栏：访客端导航 + 主题切换

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader /> {/* 访客端统一顶栏 */}
      <div className="mx-auto max-w-5xl px-4 py-10 lg:max-w-7xl lg:px-8">{children}</div> {/* 访客端内容容器：限制宽度并留出上下间距 */}
    </>
  )
}

