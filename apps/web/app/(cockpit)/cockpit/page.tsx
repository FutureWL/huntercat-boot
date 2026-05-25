"use client"

import { useMemo, useState } from "react" // Hooks：刷新时间与派生数据

import { Button } from "@/components/ui/button" // Button：刷新/全屏
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Card：KPI 卡片

export default function CockpitPage() {
  const [tick, setTick] = useState(0) // 刷新计数：用于模拟数据变动

  const nowText = useMemo(() => new Date().toLocaleString("zh-CN"), [tick]) // 当前时间展示

  return (
    <div className="min-h-dvh w-full px-4 py-6 md:px-6 lg:px-10"> {/* 驾驶舱页面容器：全屏 + 内边距 */}
      <div className="mx-auto w-full max-w-[1600px] space-y-6"> {/* 内容宽度上限：适配大屏 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">驾驶舱 /cockpit</h1>
            <p className="text-sm text-muted-foreground">这是大屏骨架：先把布局、KPI 卡片与图表占位搭起来。</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setTick((v) => v + 1)}>
              刷新
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-background/60">
            <CardHeader className="space-y-0">
              <CardTitle className="text-sm text-muted-foreground">当前时间</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg font-semibold">{nowText}</div>
            </CardContent>
          </Card>
          <Card className="bg-background/60">
            <CardHeader className="space-y-0">
              <CardTitle className="text-sm text-muted-foreground">在线用户</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{1200 + tick}</div>
            </CardContent>
          </Card>
          <Card className="bg-background/60">
            <CardHeader className="space-y-0">
              <CardTitle className="text-sm text-muted-foreground">请求 QPS</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{80 + (tick % 20)}</div>
            </CardContent>
          </Card>
          <Card className="bg-background/60">
            <CardHeader className="space-y-0">
              <CardTitle className="text-sm text-muted-foreground">告警数</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{3 + (tick % 3)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="bg-background/60 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">趋势图（占位）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[360px] items-center justify-center rounded-md border bg-background/60 text-sm text-muted-foreground">
                这里后续接入图表库（例如 ECharts/Recharts），并统一用 ChartContainer 做自适应。
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/60">
            <CardHeader>
              <CardTitle className="text-base">事件流（占位）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[360px] items-center justify-center rounded-md border bg-background/60 text-sm text-muted-foreground">
                这里后续做实时列表 / 滚动播报 / 告警面板。
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

