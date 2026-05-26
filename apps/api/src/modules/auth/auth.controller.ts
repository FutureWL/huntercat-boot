import type { Request, Response } from "express" // 引入 Express 的请求与响应类型（用于类型标注）
import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common" // 引入 NestJS 装饰器（声明控制器、路由与参数注入）

import type { ApiResponse, AuthMeResponse, LoginRequest, RegisterRequest } from "@pjd/shared" // 引入共享的响应与 DTO 类型（前后端契约）
import { fail, ok } from "../../common/api-response" // 引入统一的成功/失败响应封装
import { UserRepository } from "../user/user.repository" // 引入用户仓储（读取用户信息）
import { SessionService, SESSION_COOKIE_NAME } from "../session/session.service" // 引入会话服务与 Cookie 名称常量
import { AuthService } from "./auth.service" // 引入认证服务（登录/注册核心逻辑）
import { SessionGuard, type AuthedRequest } from "./session.guard" // 引入会话守卫与已认证请求类型

@Controller("auth") // 声明认证控制器：路由前缀 /v1/auth
export class AuthController {
  constructor( // 构造函数：由 NestJS 注入依赖
    private readonly auth: AuthService, // 注入认证服务（处理登录/注册）
    private readonly users: UserRepository, // 注入用户仓储（查询用户信息）
    private readonly sessions: SessionService, // 注入会话服务（写入/清理 Cookie 与 Redis 会话）
  ) {} // 结束构造函数

  @Post("login") // 登录：POST /v1/auth/login
  async login( // 登录接口实现
    @Body() payload: LoginRequest, // 从请求体读取登录参数
    @Res({ passthrough: true }) res: Response, // 注入响应对象（passthrough 允许 Nest 继续处理返回值）
  ): Promise<ApiResponse<AuthMeResponse>> { // 返回统一 ApiResponse<AuthMeResponse>
    if (!payload || typeof payload.username !== "string" || typeof payload.password !== "string") { // 基础校验：必须包含 username/password 且为字符串
      res.status(400) // 设置 HTTP 状态码：参数错误
      return fail("BAD_REQUEST_VALIDATION", "Invalid username/password.") // 返回统一错误结构
    } // 结束参数校验分支

    const username = payload.username.trim() // 规范化用户名：去除首尾空白
    const password = payload.password // 密码原样保留（不做 trim，避免改变用户输入）
    if (!username) { // 校验用户名不能为空
      res.status(400) // 设置 HTTP 状态码：参数错误
      return fail("BAD_REQUEST_VALIDATION", "Invalid username/password.") // 返回统一错误结构
    } // 结束用户名为空校验

    const result = await this.auth.login(username, password) // 调用认证服务执行登录（校验密码 + 创建会话）
    if (!result) { // 登录失败：用户名不存在或密码不匹配
      res.status(401) // 设置 HTTP 状态码：未授权
      return fail("AUTH_INVALID_CREDENTIALS", "Invalid credentials.") // 返回统一错误结构（不泄露具体失败原因）
    } // 结束登录失败分支

    this.sessions.setSessionCookie(res, result.sessionId) // 写入 sid Cookie（HttpOnly）
    return ok<AuthMeResponse>({ user: result.user }) // 返回当前用户信息
  }

  @Post("register") // 注册：POST /v1/auth/register
  async register( // 注册接口实现
    @Body() payload: RegisterRequest, // 从请求体读取注册参数
    @Res({ passthrough: true }) res: Response, // 注入响应对象（用于设置状态码与 Cookie）
  ): Promise<ApiResponse<AuthMeResponse>> { // 返回统一 ApiResponse<AuthMeResponse>
    if (!payload || typeof payload.username !== "string" || typeof payload.password !== "string") { // 基础校验：必须包含 username/password 且为字符串
      res.status(400) // 设置 HTTP 状态码：参数错误
      return fail("BAD_REQUEST_VALIDATION", "Invalid username/password.") // 返回统一错误结构
    } // 结束参数校验分支

    const username = payload.username.trim() // 规范化用户名：去除首尾空白
    const password = payload.password // 密码原样保留（长度校验即可）

    if (!username || username.length > 64 || password.length < 6) { // 校验：用户名非空且最长 64，密码至少 6 位
      res.status(400) // 设置 HTTP 状态码：参数错误
      return fail("BAD_REQUEST_VALIDATION", "Invalid username/password.") // 返回统一错误结构
    } // 结束长度校验

    try { // 捕获数据库唯一键冲突等异常
      const { user, sessionId } = await this.auth.register(username, password) // 执行注册（写库 + 创建会话）
      this.sessions.setSessionCookie(res, sessionId) // 注册成功后立即登录：写入 sid Cookie
      res.status(201) // 设置 HTTP 状态码：创建成功
      return ok<AuthMeResponse>({ user }) // 返回当前用户信息
    } catch (e) { // 处理异常（例如用户名冲突）
      const code = (e as { code?: string } | undefined)?.code // 从错误对象上读取数据库错误码（兼容不同错误类型）
      if (code === "ER_DUP_ENTRY") { // MySQL 唯一键冲突：用户名已存在
        res.status(409) // 设置 HTTP 状态码：冲突
        return fail("USER_USERNAME_TAKEN", "Username already exists.") // 返回统一错误结构
      } // 结束重复用户名分支
      res.status(500) // 设置 HTTP 状态码：服务端错误
      return fail("INTERNAL_ERROR", "Internal error.") // 返回统一错误结构（避免泄露内部细节）
    } // 结束异常处理
  }

  @Post("logout") // 退出登录：POST /v1/auth/logout
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<ApiResponse<{ ok: true }>> { // 退出登录接口实现
    const sid = (req as unknown as { cookies?: Record<string, string> }).cookies?.[SESSION_COOKIE_NAME] // 从 Cookie 中读取 sid（由 cookie-parser 注入）
    if (sid) await this.sessions.deleteSession(sid) // 如果存在 sid，则删除 Redis 会话（幂等：重复调用不产生副作用）
    this.sessions.clearSessionCookie(res) // 清理客户端 Cookie
    return ok<{ ok: true }>({ ok: true }) // 返回退出成功
  }

  @UseGuards(SessionGuard) // 需要登录：由 SessionGuard 注入 userId
  @Get("me") // 获取当前用户：GET /v1/auth/me
  async me(@Req() req: AuthedRequest, @Res({ passthrough: true }) res: Response): Promise<ApiResponse<AuthMeResponse>> { // 获取当前用户接口实现
    const userId = req.userId! // 读取 SessionGuard 写入的 userId（能到这里说明已通过鉴权）
    const user = await this.users.getUserById(userId) // 从数据库读取用户信息
    if (!user) { // 理论上不应发生：会话存在但用户已被删除
      res.status(401) // 设置 HTTP 状态码：未授权
      return fail("AUTH_SESSION_INVALID", "Session invalid.") // 返回统一错误结构
    } // 结束用户不存在分支
    return ok<AuthMeResponse>({ user }) // 返回当前用户信息
  }
}
