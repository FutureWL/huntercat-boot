"use client"
// 标记为客户端组件：按钮点击需要在浏览器里切换主题

import { Moon, Sun } from "lucide-react" // 图标：月亮/太阳
import { useTheme } from "next-themes" // useTheme：读取当前主题并提供 setTheme 切换方法
import { useEffect, useState } from "react" // useEffect/useState：用于处理“只在客户端挂载后再渲染”的场景

import { Button } from "@/components/ui/button" // Button：统一按钮样式（shadcn 风格）

export function ModeToggle() {
  const { theme, setTheme } = useTheme() // 读取当前主题并拿到设置主题的方法
  const [mounted, setMounted] = useState(false) // mounted：标记组件是否已在客户端完成挂载
  const isDark = theme === "dark" // 判断当前是否为暗色模式（未挂载时 theme 可能为 undefined）

  useEffect(() => {
    setMounted(true) // 客户端挂载后置为 true，避免 SSR/CSR 主题不一致导致 hydration mismatch
  }, [])

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")} // 点击时在 light/dark 之间切换
    >
      {mounted ? (isDark ? <Sun /> : <Moon />) : null} {/* 未挂载时不渲染图标，避免首屏 hydration 不一致 */}
    </Button>
  )
}
