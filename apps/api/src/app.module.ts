import { Module } from "@nestjs/common" // Nest 模块装饰器：定义模块
import { ConfigModule } from "@nestjs/config" // 配置模块：读取环境变量并注入配置
import { LoggerModule } from "nestjs-pino" // 日志模块：结构化 JSON 日志，便于 ELK 采集
import fs from "node:fs" // fs：用于检测根目录 .env 文件是否存在
import path from "node:path" // path：用于跨平台拼接与解析 env 文件路径

import { AuthModule } from "./modules/auth/auth.module"
import { TodoModule } from "./modules/todo/todo.module"
import { HealthController, PongController } from "./health.controller" // 健康检查控制器：提供 /health

const envFilePath = (() => { // envFilePath：优先从仓库根目录加载环境变量文件，避免在 apps/api 下重复维护
  const repoRoot = path.resolve(__dirname, "..", "..", "..") // repoRoot：定位到仓库根目录（从 src 或 dist 回到根）
  const candidates = [path.join(repoRoot, ".env"), path.join(repoRoot, ".env.local")] // candidates：按优先级枚举可用 env 文件路径
  const existing = candidates.filter((candidate) => fs.existsSync(candidate)) // existing：过滤出实际存在的 env 文件（可能为 0~2 个）
  return existing.length > 0 ? existing : undefined // 若存在则交给 ConfigModule 加载，否则走系统环境变量
})() // 立即执行：启动阶段就确定 envFilePath

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }), // 全局配置：通过 process.env 注入到应用
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? "info", // 日志级别：默认 info，可通过 LOG_LEVEL 覆盖
        transport: process.env.NODE_ENV === "production" ? undefined : { target: "pino-pretty" } // 本地开发美化输出：生产环境保持 JSON
      }
    }) // Pino 日志：输出结构化日志供 ELK/Filebeat 等采集
    ,
    AuthModule,
    TodoModule,
  ],
  controllers: [HealthController, PongController], // 控制器注册：健康检查端点
  providers: [] // 提供者列表：后续接入 MinIO/RabbitMQ/MongoDB 适配器时注入
})
export class AppModule {} // 根模块导出：供 main.ts 创建应用
