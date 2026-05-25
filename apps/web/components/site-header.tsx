"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/todos", label: "Todos" },
  { href: "/login", label: "登录" },
  { href: "/register", label: "注册" },
] as const

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold tracking-tight">
            huntercat-boot
          </Link>
          <span className="hidden text-xs text-muted-foreground sm:inline">黑金 · 暗色模式</span>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
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
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

