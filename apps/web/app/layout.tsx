import "./globals.css" // 引入全局样式（Tailwind 指令 + CSS 变量主题）

import type { ReactNode } from "react" // ReactNode：用于标注 children 的类型
import { getLocale, getMessages, getTimeZone } from "next-intl/server" // next-intl：服务端读取当前请求的语言与 messages

import { Providers } from "@/app/providers" // Providers：主题 + 国际化上下文

// Next.js App Router 的根布局：所有页面都会被它包裹
// 放全局 CSS、语言、body 结构等“应用壳”配置
export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale() // 获取当前请求语言（由 next-intl/middleware 推导）
  const messages = await getMessages() // 加载当前语言的消息字典（见 i18n/request.ts）
  const timeZone = await getTimeZone()

  return (
    // 注意：<html> 下只能直接放 <head>/<body>，不能出现任何空白文本节点，否则会导致 hydration 报错
    <html lang={locale} suppressHydrationWarning><body className="min-h-dvh bg-background text-foreground antialiased">
      <Providers locale={locale} messages={messages} timeZone={timeZone}>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsla(var(--primary),0.18),transparent_55%)]" />
        {children}
      </Providers>
    </body></html>
  )
}
