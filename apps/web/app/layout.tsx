import "./globals.css"

import type { ReactNode } from "react"

import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"

// Next.js App Router 的根布局：所有页面都会被它包裹
// 放全局 CSS、语言、body 结构等“应用壳”配置
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <header className="border-b">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
              <a href="/" className="font-semibold tracking-tight">
                huntercat-boot
              </a>
              <ModeToggle />
            </div>
          </header>
          <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
