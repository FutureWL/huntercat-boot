"use client"

import { useMemo, useState } from "react" // Hooks：输入 URL 与派生状态

import { Button } from "@/components/ui/button" // Button：快捷设置
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Card：播放器容器
import { Input } from "@/components/ui/input" // Input：URL 输入框

export default function AudioPage() {
  const [url, setUrl] = useState("") // 音频地址输入

  const canPlay = useMemo(() => url.trim().length > 0, [url]) // 是否允许播放

  return (
    <main className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">音频 /media/audio</h1>
        <p className="text-muted-foreground">先封装原生 audio：后续可以加波形、播放列表、倍速等能力。</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">播放器</CardTitle>
          <CardDescription>请输入可访问的音频 URL（例如你自己的文件服务或 CDN 地址）。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setUrl("")}>
                清空
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUrl("https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3")}
              >
                示例
              </Button>
            </div>
          </div>

          <div className="rounded-md border bg-background/60 p-3">
            {canPlay ? (
              <audio className="w-full" controls src={url} />
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">输入 URL 后开始播放。</div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

