"use client"

import Link from "next/link" // Link：Next.js 的客户端导航组件（无刷新跳转）

import { Button } from "@/components/ui/button" // Button：统一按钮样式
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Card：信息分组展示

export default function UserHomePage() {
  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">用户端 /app</h1>
        <p className="text-muted-foreground">
          这里是“用户端工作台”的骨架页：把高频入口集中在一个地方，方便后续按业务替换。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>业务示例（Todos）</CardTitle>
            <CardDescription>演示：登录态隔离 + CRUD 闭环</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/todos">进入 /todos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI 对话</CardTitle>
            <CardDescription>先做 UI/流式渲染骨架，后续对接模型</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/chat">进入 /chat</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>音视频</CardTitle>
            <CardDescription>封装原生播放器与媒体列表</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/media">进入 /media</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>驾驶舱大屏</CardTitle>
            <CardDescription>全屏布局 + KPI 卡片 + 图表容器</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/cockpit">进入 /cockpit</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>管理员端</CardTitle>
            <CardDescription>权限/配置/运维入口（需要登录）</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost">
              <Link href="/admin">进入 /admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

