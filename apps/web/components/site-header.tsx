"use client"
// 标记为客户端组件：导航高亮依赖 usePathname，需要在浏览器中运行

import Link from "next/link" // Link：Next.js 的客户端导航组件（无刷新跳转）
import { usePathname } from "next/navigation" // usePathname：获取当前路径，用于高亮导航

import { ModeToggle } from "@/components/mode-toggle" // 主题切换按钮
import { Button } from "@/components/ui/button" // Button：用于统一导航按钮样式
import { cn } from "@/lib/utils" // cn：className 合并工具函数

const navItems = [
  { href: "/todos", label: "Todos" }, // Todos 页面入口
  { href: "/login", label: "登录" }, // 登录页面入口
  { href: "/register", label: "注册" }, // 注册页面入口
] as const

export function SiteHeader() {
  const pathname = usePathname() // 当前路由路径（用于判断哪个导航项处于激活态）

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur"> {/* 顶部吸顶栏：半透明背景 + 毛玻璃 */}
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4"> {/* 居中容器：限制宽度并左右布局 */}
        <div className="flex items-center gap-2"> {/* 左侧：站点标题与提示文案 */}
          <Link href="/" className="font-semibold tracking-tight"> {/* 返回首页 */}
            huntercat-boot {/* 项目名称 */}
          </Link>
          <span className="hidden text-xs text-muted-foreground sm:inline">黑金 · 暗色模式</span> {/* 桌面端提示：主题风格 */}
        </div> {/* 左侧区域结束 */}

        <nav className="hidden items-center gap-1 sm:flex"> {/* 中间导航：移动端隐藏，sm 以上显示 */}
          {navItems.map((item) => {
            const active = pathname === item.href // 当前路径与导航项相同则视为激活
            // 注意：Button 开启 asChild 时，children 必须是“唯一的一个 React 元素”，不能夹杂任何文本/注释节点
            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(active && "bg-accent text-accent-foreground")} // 激活态：加 accent 背景与文字颜色
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2"> {/* 右侧：功能按钮区域 */}
          <ModeToggle /> {/* 主题切换 */}
          {/* 右侧区域结束 */}
        </div>
        {/* 容器结束 */}
      </div>
      {/* 顶栏结束 */}
    </header>
  )
}
