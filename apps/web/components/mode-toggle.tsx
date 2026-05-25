"use client"
// 标记为客户端组件：按钮点击需要在浏览器里切换主题

import { Moon, Sun } from "lucide-react" // 图标：月亮/太阳
import { useTheme } from "next-themes" // useTheme：读取当前主题并提供 setTheme 切换方法

import { Button } from "@/components/ui/button" // Button：统一按钮样式（shadcn 风格）

export function ModeToggle() {
  const { theme, setTheme } = useTheme() // 读取当前主题并拿到设置主题的方法
  const isDark = theme === "dark" // 判断当前是否为暗色模式

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")} // 点击时在 light/dark 之间切换
    >
      {isDark ? <Sun /> : <Moon />} {/* 暗色时显示太阳（提示切到亮色），亮色时显示月亮（提示切到暗色） */}
    </Button>
  )
}
