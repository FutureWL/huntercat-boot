"use client"

import Link from "next/link" // Link：Next.js 的客户端导航组件（无刷新跳转）

import { Button } from "@/components/ui/button" // Button：导航按钮
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Card：入口分组

export default function MediaHomePage() {
  return (
    <main className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">媒体 /media</h1>
        <p className="text-muted-foreground">先用原生 audio/video 做可用骨架，后续再加 HLS/字幕/播放列表等能力。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>视频播放器</CardTitle>
            <CardDescription>支持输入 URL 预览播放</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/media/video">进入 /media/video</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>音频播放器</CardTitle>
            <CardDescription>支持输入 URL 预览播放</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/media/audio">进入 /media/audio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

