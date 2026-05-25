"use client"

import Link from "next/link" // Link：Next.js 的客户端导航组件（无刷新跳转）

import { Button } from "@/components/ui/button" // Button：统一按钮样式
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Card：模块入口卡片

export default function AdminHomePage() {
  return (
    <main className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">管理员端 /admin</h1>
        <p className="text-muted-foreground">
          这里是管理端骨架页：后续会把“用户管理 / 角色权限 / 系统配置 / 审计日志”等模块塞进来。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>驾驶舱</CardTitle>
            <CardDescription>运营/监控可视化入口</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/cockpit">进入 /cockpit</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>业务示例（Todos）</CardTitle>
            <CardDescription>演示：数据列表 + CRUD</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/todos">进入 /todos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>用户端</CardTitle>
            <CardDescription>返回用户侧体验</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/app">进入 /app</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

