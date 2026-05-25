import { makeHello } from "@pjd/shared"
import { NextResponse } from "next/server"

// Route Handler：等价于一个后端接口（运行在 Node.js 或 Edge Runtime，取决于部署与配置）
// 这里演示“API 层”也能复用 shared 的同一份类型与逻辑
export function GET(request: Request) {
  const url = new URL(request.url)
  const name = url.searchParams.get("name") ?? "World"

  return NextResponse.json(makeHello(name))
}
