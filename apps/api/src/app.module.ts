import { Module } from "@nestjs/common" // Nest 模块装饰器：定义模块
import { ConfigModule } from "@nestjs/config" // 配置模块：读取环境变量并注入配置
import { LoggerModule } from "nestjs-pino" // 日志模块：结构化 JSON 日志，便于 ELK 采集

import { AuthModule } from "./modules/auth/auth.module"
import { TodoModule } from "./modules/todo/todo.module"
import { HealthController } from "./health.controller" // 健康检查控制器：提供 /health

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 全局配置：通过 process.env 注入到应用
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
  controllers: [HealthController], // 控制器注册：健康检查端点
  providers: [] // 提供者列表：后续接入 MinIO/RabbitMQ/MongoDB 适配器时注入
})
export class AppModule {} // 根模块导出：供 main.ts 创建应用
