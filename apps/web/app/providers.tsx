"use client"
// 客户端 Providers：集中挂载主题与国际化上下文（ThemeProvider + NextIntlClientProvider）

import type { ReactNode } from "react" // ReactNode：用于 children 类型
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl" // next-intl：客户端 i18n Provider（提供 t() 等能力）

import { ThemeProvider } from "@/components/theme-provider" // 主题 Provider：支持明亮/暗黑/跟随系统

type ProvidersProps = {
  children: ReactNode // 子树内容：页面与组件
  locale: string // 当前语言：来自服务端请求配置
  messages: AbstractIntlMessages // 当前语言的消息字典：供 next-intl 查找文案
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> {/* 主题上下文：通过 class="dark" 切换并避免切换动画闪烁 */}
      <NextIntlClientProvider locale={locale} messages={messages}> {/* 国际化上下文：向子组件提供 locale 与 messages */}
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
