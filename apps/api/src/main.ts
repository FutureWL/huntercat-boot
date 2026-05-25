import "reflect-metadata" // 启用反射元数据：Nest 依赖注入与装饰器需要

import { NestFactory } from "@nestjs/core" // Nest 应用工厂：用于创建应用实例
import { Logger } from "nestjs-pino" // Pino 日志适配：统一结构化日志输出

import { AppModule } from "./app.module" // 根模块：应用入口模块

async function bootstrap() { // 启动函数：创建并启动 HTTP 服务
  const app = await NestFactory.create(AppModule, { bufferLogs: true }) // 创建应用：缓冲启动阶段日志
  app.useLogger(app.get(Logger)) // 启用 Pino Logger：将 Nest 日志输出到结构化日志
  await app.listen(Number(process.env.PORT ?? 3001)) // 启动监听：默认端口 3001，可通过 PORT 覆盖
}

void bootstrap() // 启动应用：执行启动流程
