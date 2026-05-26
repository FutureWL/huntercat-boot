import bcrypt from "bcryptjs"
import { Injectable } from "@nestjs/common"

import type { AuthUser } from "@pjd/shared"
import { UserRepository } from "../user/user.repository"
import { SessionService } from "../session/session.service"

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionService,
  ) {}

  async login(username: string, password: string): Promise<{ user: AuthUser; sessionId: string } | null> {
    const user = await this.users.getUserWithPasswordByUsername(username)
    if (!user) return null

    const okPassword = await bcrypt.compare(password, user.passwordHash)
    if (!okPassword) return null

    const sessionId = await this.sessions.createSession(user.id)
    return { user: { id: user.id, username: user.username }, sessionId }
  }

  async register(username: string, password: string): Promise<{ user: AuthUser; sessionId: string }> {
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await this.users.createUser(username, passwordHash)
    const sessionId = await this.sessions.createSession(user.id)
    return { user, sessionId }
  }
}

