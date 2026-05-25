// shared 包的目标：放“跨端可复用”的纯 TypeScript 代码
// - 不依赖 Next.js/React 等运行时
// - 只输出类型（type/interface）与纯函数（pure function）
export type HelloResponse = { // Hello 示例响应类型
  message: string // 文本消息
} // HelloResponse

// 例子：返回一个标准化响应结构，既可以在页面里用，也可以在 API 里用
export function makeHello(name: string): HelloResponse {
  return { message: `Hello, ${name}` };
}

export * from "./http" // 统一导出：HTTP 通用协议（ApiResponse 等）
export * from "./todo" // 统一导出：Todo 资源契约（DTO/类型）
