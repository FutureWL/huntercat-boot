import type { Request, Response } from "express" // Express 请求/响应类型：用于类型标注
import { Catch, type ArgumentsHost, type ExceptionFilter, HttpException } from "@nestjs/common" // Nest 异常过滤器相关类型与装饰器

import { fail } from "./api-response" // 统一失败响应体构造器

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp() // 切换到 HTTP 上下文
    const res = http.getResponse<Response>() // 获取响应对象
    const req = http.getRequest<Request>() // 获取请求对象

    const status = // 提取状态码：优先使用 HttpException，否则回退到 500
      exception instanceof HttpException
        ? exception.getStatus()
        : (exception as { status?: number } | undefined)?.status ?? 500

    if (
      exception instanceof SyntaxError &&
      (exception as unknown as { status?: number }).status === 400 &&
      (exception as unknown as { type?: string }).type === "entity.parse.failed"
    ) {
      res.status(400).json(fail("BAD_REQUEST_INVALID_JSON", "Request body is not valid JSON.")) // JSON 解析失败：统一返回错误码
      return // 结束处理
    }

    if (status === 404) {
      res.status(404).json(fail("NOT_FOUND", `Not found: ${req.path}`)) // 未匹配路由：返回 NOT_FOUND
      return // 结束处理
    }

    res.status(500).json(fail("INTERNAL_ERROR", "Internal error.")) // 兜底异常：不暴露内部细节
  }
}
