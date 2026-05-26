import type { Request, Response } from "express"
import { Catch, type ArgumentsHost, type ExceptionFilter, HttpException } from "@nestjs/common"

import { fail } from "./api-response"

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp()
    const res = http.getResponse<Response>()
    const req = http.getRequest<Request>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : (exception as { status?: number } | undefined)?.status ?? 500

    if (
      exception instanceof SyntaxError &&
      (exception as unknown as { status?: number }).status === 400 &&
      (exception as unknown as { type?: string }).type === "entity.parse.failed"
    ) {
      res.status(400).json(fail("BAD_REQUEST_INVALID_JSON", "Request body is not valid JSON."))
      return
    }

    if (status === 404) {
      res.status(404).json(fail("NOT_FOUND", `Not found: ${req.path}`))
      return
    }

    res.status(500).json(fail("INTERNAL_ERROR", "Internal error."))
  }
}

