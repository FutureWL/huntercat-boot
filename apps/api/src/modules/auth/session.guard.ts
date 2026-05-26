import type { Request, Response } from "express" // 引入 Express 请求/响应类型（用于类型标注）
import { CanActivate, Injectable, type ExecutionContext } from "@nestjs/common" // 引入 NestJS 守卫接口与上下文类型

import { fail } from "../../common/api-response" // 引入统一失败响应封装（直接 res.json）
import { SessionService, SESSION_COOKIE_NAME } from "../session/session.service" // 引入会话服务与 Cookie 名称常量

export type AuthedRequest = Request & { userId?: string } // 扩展 Request：在鉴权通过后写入 userId

@Injectable() // 声明为可注入的守卫（可通过 DI 获取 SessionService）
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {} // 注入会话服务（用于读取 Redis 会话）

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp() // 从 Nest 执行上下文中切换到 HTTP 上下文
    const req = http.getRequest<AuthedRequest>() // 获取请求对象（用于读取 Cookie 与写入 userId）
    const res = http.getResponse<Response>() // 获取响应对象（用于直接返回 JSON）

    const sid = (req as unknown as { cookies?: Record<string, string> }).cookies?.[SESSION_COOKIE_NAME] // 从 cookie-parser 注入的 cookies 中读取 sid
    if (!sid) { // 未携带 sid：未登录
      res.status(401).json(fail("AUTH_REQUIRED", "Authentication required.")) // 返回统一错误结构
      return false // 拦截请求：不进入控制器
    } // 结束未登录分支

    const userId = await this.sessions.getSessionUserId(sid) // 通过 sid 查询 Redis 会话，拿到 userId
    if (!userId) { // sid 无效或已过期：会话不存在
      res.status(401).json(fail("AUTH_SESSION_INVALID", "Session invalid.")) // 返回统一错误结构
      return false // 拦截请求：不进入控制器
    } // 结束会话无效分支

    req.userId = userId // 将 userId 写入请求对象，供后续控制器读取
    return true // 放行请求：进入控制器
  }
}
