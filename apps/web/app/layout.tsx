import "./globals.css"

import type { ReactNode } from "react"

// Next.js App Router 的根布局：所有页面都会被它包裹
// 放全局 CSS、语言、body 结构等“应用壳”配置
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
