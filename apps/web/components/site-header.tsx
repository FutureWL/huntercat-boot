"use client"
// 标记为客户端组件：导航高亮依赖 usePathname，需要在浏览器中运行

import Link from "next/link" // Link：Next.js 的客户端导航组件（无刷新跳转）
import { usePathname } from "next/navigation" // usePathname：获取当前路径，用于高亮导航
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { LanguageSwitcher } from "@/components/language-switcher"
import { ModeToggle } from "@/components/mode-toggle" // 主题切换按钮
import { Button } from "@/components/ui/button" // Button：用于统一导航按钮样式
import { cn } from "@/lib/utils" // cn：className 合并工具函数

const navItems = [
  { href: "/#features", labelKey: "nav.features" }, // 产品能力（锚点）
  { href: "/#solutions", labelKey: "nav.solutions" }, // 解决方案（锚点）
  { href: "/#cases", labelKey: "nav.cases" }, // 客户案例（锚点）
  { href: "/#about", labelKey: "nav.about" }, // 关于我们（锚点）
] as const

export function SiteHeader() {
  const pathname = usePathname() // 当前路由路径（用于判断哪个导航项处于激活态）
  const t = useTranslations()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const themeLabel = mounted
    ? theme === "system"
      ? t("theme.system", {
          mode: resolvedTheme === "dark" ? t("theme.mode.dark") : t("theme.mode.light"),
        })
      : theme === "dark"
        ? t("theme.dark")
        : t("theme.light")
    : t("theme.unknown")

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur"> {/* 顶部吸顶栏：半透明背景 + 毛玻璃 */}
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4"> {/* 居中容器：限制宽度并左右布局 */}
        <div className="flex items-center gap-2"> {/* 左侧：站点标题与提示文案 */}
          <Link href="/" className="font-semibold tracking-tight"> {/* 返回首页 */}
            huntercat-boot {/* 项目名称 */}
          </Link>
          <span className="hidden text-xs text-muted-foreground sm:inline">{themeLabel}</span> {/* 桌面端提示：主题风格 */}
        </div> {/* 左侧区域结束 */}

        <nav className="hidden items-center gap-1 sm:flex"> {/* 中间导航：移动端隐藏，sm 以上显示 */}
          {navItems.map((item) => {
            const active = item.href.includes("#") ? false : pathname === item.href // 锚点路由无法通过 pathname 判断激活态
            // 注意：Button 开启 asChild 时，children 必须是“唯一的一个 React 元素”，不能夹杂任何文本/注释节点
            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(active && "bg-accent text-accent-foreground")} // 激活态：加 accent 背景与文字颜色
              >
                <Link href={item.href}>{t(item.labelKey)}</Link>
              </Button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2"> {/* 右侧：功能按钮区域 */}
          <div className="hidden items-center gap-2 md:flex"> {/* 右侧转化按钮：移动端隐藏，md 以上显示 */}
            <Button asChild size="sm" variant="ghost">
              <Link href="/login">{t("nav.login")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">{t("nav.freeTrial")}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/register?intent=demo">{t("nav.bookDemo")}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/register?intent=sales">{t("nav.contactSales")}</Link>
            </Button>
          </div>
          <LanguageSwitcher />
          <ModeToggle /> {/* 主题切换 */}
          {/* 右侧区域结束 */}
        </div>
        {/* 容器结束 */}
      </div>
      {/* 顶栏结束 */}
    </header>
  )
}
