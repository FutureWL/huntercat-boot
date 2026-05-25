"use client"
// 标记为客户端组件：导航高亮依赖 usePathname，需要在浏览器中运行

import Link from "next/link" // Link：Next.js 的客户端导航组件（无刷新跳转）
import { usePathname } from "next/navigation" // usePathname：获取当前路径，用于高亮导航
import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

import { ModeToggle } from "@/components/mode-toggle" // 主题切换按钮
import { Button } from "@/components/ui/button" // Button：用于统一导航按钮样式
import { cn } from "@/lib/utils" // cn：className 合并工具函数

const navItems = [
  { href: "/admin", label: "管理首页" }, // 管理端首页
  { href: "/todos", label: "Todos" }, // 演示：数据列表页
  { href: "/cockpit", label: "驾驶舱" }, // 大屏入口（通常给管理者/运营）
  { href: "/app", label: "用户端" }, // 返回用户端
] as const

export function AdminHeader() {
  const pathname = usePathname() // 当前路由路径（用于判断哪个导航项处于激活态）
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur"> {/* 顶部吸顶栏：半透明背景 + 毛玻璃 */}
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8"> {/* 管理端通常更宽 */}
        <div className="flex items-center gap-2">
          <Link href="/admin" className="font-semibold tracking-tight">
            管理端
          </Link>
          <span className="hidden text-xs text-muted-foreground md:inline">系统配置 · 权限 · 运维</span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(active && "bg-accent text-accent-foreground")}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
          <ModeToggle />
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-black/40" aria-hidden onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 right-0 top-14 z-50 border-b bg-background/95 backdrop-blur">
            <nav className="mx-auto w-full max-w-7xl px-4 py-3 md:px-6 lg:px-8">
              <div className="grid gap-1">
                {navItems.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Button
                      key={item.href}
                      asChild
                      variant="ghost"
                      className={cn("w-full justify-start", active && "bg-accent text-accent-foreground")}
                    >
                      <Link href={item.href} onClick={() => setMobileOpen(false)}>
                        {item.label}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

