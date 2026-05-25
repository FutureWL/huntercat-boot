import { Controller, Get } from "@nestjs/common" // Controller/Get：声明路由控制器与 GET 端点

@Controller("health") // 健康检查路由前缀：/health
export class HealthController { // 健康检查控制器：用于探针与连通性验证
  @Get() // GET /health：返回服务状态
  getHealth() { // 健康检查处理函数：返回 ok 与时间戳
    return { ok: true, timestamp: new Date().toISOString() } // 返回结构化 JSON：便于日志与监控采集
  }
}
