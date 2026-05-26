import { Module } from "@nestjs/common" // 引入 NestJS 模块装饰器

import { SessionModule } from "../session/session.module" // 引入会话模块（提供 SessionService）
import { UserModule } from "../user/user.module" // 引入用户模块（提供 UserRepository）
import { AuthController } from "./auth.controller" // 引入认证控制器（路由层）
import { AuthService } from "./auth.service" // 引入认证服务（业务层）
import { SessionGuard } from "./session.guard" // 引入会话守卫（鉴权）

@Module({ // 声明认证模块：聚合登录/注册/会话守卫等能力
  imports: [UserModule, SessionModule], // 依赖用户与会话能力（通过 DI 注入）
  controllers: [AuthController], // 注册控制器（对外暴露 HTTP 接口）
  providers: [AuthService, SessionGuard], // 注册服务与守卫（模块内可注入）
  exports: [SessionGuard], // 导出守卫（供 TodoModule 等复用）
}) // 结束模块装饰器配置
export class AuthModule {} // 认证模块声明（NestJS 用于依赖注入边界）
