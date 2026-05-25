"use client"
// 标记为客户端组件：next-themes 需要在浏览器环境读取/写入主题状态

import * as React from "react" // React：用于 JSX 与类型支持
import { ThemeProvider as NextThemesProvider } from "next-themes" // NextThemesProvider：负责给 html 注入 class 并持久化主题
import type { ThemeProviderProps } from "next-themes" // ThemeProviderProps：主题 Provider 的 props 类型

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider> // 透传配置并渲染 children
}
