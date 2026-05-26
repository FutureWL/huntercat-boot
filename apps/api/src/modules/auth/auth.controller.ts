import type { Request, Response } from "express"
import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common"

import type { ApiResponse, AuthMeResponse, LoginRequest, RegisterRequest } from "@pjd/shared"
import { fail, ok } from "../../common/api-response"
import { UserRepository } from "../user/user.repository"
import { SessionService, SESSION_COOKIE_NAME } from "../session/session.service"
import { AuthService } from "./auth.service"
import { SessionGuard, type AuthedRequest } from "./session.guard"

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserRepository,
    private readonly sessions: SessionService,
  ) {}

  @Post("login")
  async login(
    @Body() payload: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthMeResponse>> {
    if (!payload || typeof payload.username !== "string" || typeof payload.password !== "string") {
      res.status(400)
      return fail("BAD_REQUEST_VALIDATION", "Invalid username/password.")
    }

    const username = payload.username.trim()
    const password = payload.password
    if (!username) {
      res.status(400)
      return fail("BAD_REQUEST_VALIDATION", "Invalid username/password.")
    }

    const result = await this.auth.login(username, password)
    if (!result) {
      res.status(401)
      return fail("AUTH_INVALID_CREDENTIALS", "Invalid credentials.")
    }

    this.sessions.setSessionCookie(res, result.sessionId)
    return ok<AuthMeResponse>({ user: result.user })
  }

  @Post("register")
  async register(
    @Body() payload: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthMeResponse>> {
    if (!payload || typeof payload.username !== "string" || typeof payload.password !== "string") {
      res.status(400)
      return fail("BAD_REQUEST_VALIDATION", "Invalid username/password.")
    }

    const username = payload.username.trim()
    const password = payload.password

    if (!username || username.length > 64 || password.length < 6) {
      res.status(400)
      return fail("BAD_REQUEST_VALIDATION", "Invalid username/password.")
    }

    try {
      const { user, sessionId } = await this.auth.register(username, password)
      this.sessions.setSessionCookie(res, sessionId)
      res.status(201)
      return ok<AuthMeResponse>({ user })
    } catch (e) {
      const code = (e as { code?: string } | undefined)?.code
      if (code === "ER_DUP_ENTRY") {
        res.status(409)
        return fail("USER_USERNAME_TAKEN", "Username already exists.")
      }
      res.status(500)
      return fail("INTERNAL_ERROR", "Internal error.")
    }
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<ApiResponse<{ ok: true }>> {
    const sid = (req as unknown as { cookies?: Record<string, string> }).cookies?.[SESSION_COOKIE_NAME]
    if (sid) await this.sessions.deleteSession(sid)
    this.sessions.clearSessionCookie(res)
    return ok<{ ok: true }>({ ok: true })
  }

  @UseGuards(SessionGuard)
  @Get("me")
  async me(@Req() req: AuthedRequest, @Res({ passthrough: true }) res: Response): Promise<ApiResponse<AuthMeResponse>> {
    const userId = req.userId!
    const user = await this.users.getUserById(userId)
    if (!user) {
      res.status(401)
      return fail("AUTH_SESSION_INVALID", "Session invalid.")
    }
    return ok<AuthMeResponse>({ user })
  }
}

