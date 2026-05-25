"use client"
// 标记为客户端组件：按钮点击需要在浏览器里切换主题

import { Laptop, Moon, Sun } from "lucide-react" // 图标：笔记本/月亮/太阳
import { useTheme } from "next-themes" // useTheme：读取当前主题并提供 setTheme 切换方法
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react" // useEffect/useState：用于处理“只在客户端挂载后再渲染”的场景

import { Button } from "@/components/ui/button" // Button：统一按钮样式（shadcn 风格）
import { cn } from "@/lib/utils" // cn：className 合并工具函数

export function ModeToggle() {
  const { theme, setTheme } = useTheme() // 读取当前主题并拿到设置主题的方法
  const t = useTranslations()
  const [mounted, setMounted] = useState(false) // mounted：标记组件是否已在客户端完成挂载
  const currentTheme = mounted ? theme : undefined

  useEffect(() => {
    setMounted(true) // 客户端挂载后置为 true，避免 SSR/CSR 主题不一致导致 hydration mismatch
  }, [])

  return (
    <div className="inline-flex items-center rounded-md border border-input bg-background p-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          currentTheme === "light" && "bg-accent text-accent-foreground",
        )}
        aria-label={t("theme.action.light")}
        onClick={() => setTheme("light")}
      >
        <Sun />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          currentTheme === "system" && "bg-accent text-accent-foreground",
        )}
        aria-label={t("theme.action.system")}
        onClick={() => setTheme("system")}
      >
        <Laptop />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          currentTheme === "dark" && "bg-accent text-accent-foreground",
        )}
        aria-label={t("theme.action.dark")}
        onClick={() => setTheme("dark")}
      >
        <Moon />
      </Button>
    </div>
  )
}
