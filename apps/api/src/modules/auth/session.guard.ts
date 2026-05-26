import type { Request, Response } from "express"
import { CanActivate, Injectable, type ExecutionContext } from "@nestjs/common"

import { fail } from "../../common/api-response"
import { SessionService, SESSION_COOKIE_NAME } from "../session/session.service"

export type AuthedRequest = Request & { userId?: string }

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp()
    const req = http.getRequest<AuthedRequest>()
    const res = http.getResponse<Response>()

    const sid = (req as unknown as { cookies?: Record<string, string> }).cookies?.[SESSION_COOKIE_NAME]
    if (!sid) {
      res.status(401).json(fail("AUTH_REQUIRED", "Authentication required."))
      return false
    }

    const userId = await this.sessions.getSessionUserId(sid)
    if (!userId) {
      res.status(401).json(fail("AUTH_SESSION_INVALID", "Session invalid."))
      return false
    }

    req.userId = userId
    return true
  }
}

