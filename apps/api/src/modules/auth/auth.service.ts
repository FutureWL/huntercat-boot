import bcrypt from "bcryptjs" // 引入 bcrypt：用于密码 hash 与比对
import { Injectable } from "@nestjs/common" // 引入 NestJS 可注入装饰器

import type { AuthUser } from "@pjd/shared" // 引入共享的用户类型（对外返回的用户字段）
import { UserRepository } from "../user/user.repository" // 引入用户仓储（读写 MySQL 用户表）
import { SessionService } from "../session/session.service" // 引入会话服务（创建 Redis 会话 + 写 Cookie）

@Injectable() // 声明为可注入的业务服务（由 NestJS DI 管理生命周期）
export class AuthService {
  constructor(
    private readonly users: UserRepository, // 注入用户仓储（查询/创建用户）
    private readonly sessions: SessionService, // 注入会话服务（创建会话）
  ) {}

  async login(username: string, password: string): Promise<{ user: AuthUser; sessionId: string } | null> {
    const user = await this.users.getUserWithPasswordByUsername(username) // 按用户名读取用户与密码 hash
    if (!user) return null // 用户不存在：返回 null（上层统一处理为 401）

    const okPassword = await bcrypt.compare(password, user.passwordHash) // 比对明文密码与 hash（避免自己实现加密算法）
    if (!okPassword) return null // 密码错误：返回 null（不泄露具体失败原因）

    const sessionId = await this.sessions.createSession(user.id) // 创建会话：写入 Redis（session:<sid> -> userId）
    return { user: { id: user.id, username: user.username }, sessionId } // 返回用户信息与会话 id（用于写 Cookie）
  }

  async register(username: string, password: string): Promise<{ user: AuthUser; sessionId: string }> {
    const passwordHash = await bcrypt.hash(password, 10) // 生成密码 hash（10 为 cost factor，越大越安全但越慢）
    const user = await this.users.createUser(username, passwordHash) // 创建用户（数据库唯一键由 MySQL 保障）
    const sessionId = await this.sessions.createSession(user.id) // 注册成功后创建会话（实现自动登录）
    return { user, sessionId } // 返回用户信息与会话 id
  }
}
