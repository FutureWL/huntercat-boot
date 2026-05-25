"use client"
// 语言切换按钮：在 zh-CN 与 en-US 之间循环切换，并通过 NEXT_LOCALE cookie 让 next-intl/middleware 生效

import { useLocale, useTranslations } from "next-intl" // useLocale/useTranslations：读取当前语言与翻译函数
import { useRouter } from "next/navigation" // router.refresh：刷新当前路由以重新加载服务端文案

import { Button } from "@/components/ui/button" // 统一按钮组件
import { locales } from "@/i18n/routing" // 支持的语言列表

function setLocaleCookie(locale: string) {
  // NEXT_LOCALE：next-intl 默认读取的语言 cookie key
  document.cookie = `NEXT_LOCALE=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`
}

export function LanguageSwitcher() {
  const locale = useLocale() // 当前语言
  const t = useTranslations() // 翻译函数（基于当前 messages）
  const router = useRouter() // 用于刷新页面

  const currentIndex = locales.indexOf(locale as never) // 在 locales 中定位当前语言下标（不在列表中则为 -1）
  const safeIndex = currentIndex === -1 ? 0 : currentIndex
  const nextLocale = locales[(safeIndex + 1) % locales.length] as (typeof locales)[number]

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={t("language.label")}
      onClick={() => {
        setLocaleCookie(nextLocale) // 写入 cookie，供服务端下一次渲染识别语言
        router.refresh() // 刷新当前路由：触发 Server Component 重新加载 messages
      }}
    >
      {t(`language.${locale}`)}
    </Button>
  )
}
