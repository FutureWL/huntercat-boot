"use client"

import { useEffect, useMemo, useRef, useState } from "react" // Hooks：聊天状态、滚动、派生数据

import { Button } from "@/components/ui/button" // Button：发送/清空
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Card：聊天容器
import { Input } from "@/components/ui/input" // Input：输入框

type ChatRole = "user" | "assistant" // 角色：用户/助手

type ChatMessage = {
  id: string // 消息 id：用于 React key
  role: ChatRole // 消息角色
  content: string // 消息内容
}

function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}` // 简单 id：足够用于前端 key
}

export default function ChatPage() {
  const [input, setInput] = useState("") // 输入框内容
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: nowId(), role: "assistant", content: "这是 AI 对话 UI 骨架页：后续把这里对接到模型流式接口即可。" },
  ])
  const listRef = useRef<HTMLDivElement | null>(null) // 列表容器 ref：用于滚动到底部

  const canSend = useMemo(() => input.trim().length > 0, [input]) // 是否允许发送

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length])

  async function onSend() {
    const content = input.trim()
    if (!content) return

    setInput("")
    setMessages((prev) => [...prev, { id: nowId(), role: "user", content }])

    const placeholder: ChatMessage = { id: nowId(), role: "assistant", content: "（占位）已收到：后续这里接入流式输出…" }
    setMessages((prev) => [...prev, placeholder])
  }

  return (
    <main className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">AI 对话 /chat</h1>
        <p className="text-muted-foreground">先把“消息渲染 + 输入 + 滚动”搭好，再接入模型与工具调用。</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">会话</CardTitle>
          <Button type="button" variant="secondary" onClick={() => setMessages([])}>
            清空
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div ref={listRef} className="h-[55dvh] overflow-auto rounded-md border bg-background/60 p-3">
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                        : "max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="py-14 text-center text-sm text-muted-foreground">暂无消息，发送一句试试。</div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题…"
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSend()
              }}
            />
            <Button type="button" onClick={() => void onSend()} disabled={!canSend}>
              发送
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

