import "./globals.css" // 引入全局样式（Tailwind 指令 + CSS 变量主题）

import type { ReactNode } from "react" // ReactNode：用于标注 children 的类型

import { SiteHeader } from "@/components/site-header" // 站点顶栏：导航 + 主题切换
import { ThemeProvider } from "@/components/theme-provider" // 主题 Provider：负责暗色/亮色 class 注入

// Next.js App Router 的根布局：所有页面都会被它包裹
// 放全局 CSS、语言、body 结构等“应用壳”配置
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // 注意：<html> 下只能直接放 <head>/<body>，不能出现任何空白文本节点，否则会导致 hydration 报错
    <html lang="zh-CN" suppressHydrationWarning><body className="min-h-dvh bg-background text-foreground antialiased">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsla(var(--primary),0.18),transparent_55%)]" />
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
      </ThemeProvider>
    </body></html>
  )
}
