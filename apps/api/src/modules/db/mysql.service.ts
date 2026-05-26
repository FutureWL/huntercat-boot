import type { Pool } from "mysql2/promise" // Pool：MySQL 连接池类型（promise API）
import { createPool } from "mysql2/promise" // createPool：创建 MySQL 连接池（复用连接提升性能）
import { Injectable, OnModuleDestroy } from "@nestjs/common" // Injectable：DI 注入；OnModuleDestroy：模块销毁时清理资源

import { getMysqlEnv } from "../../config/env" // 环境变量解析：读取 MYSQL_* 配置

@Injectable()
export class MysqlService implements OnModuleDestroy {
  private pool: Pool | null = null // 连接池单例：延迟创建，避免启动阶段无谓建连

  getPool(): Pool { // 获取连接池（单例）
    if (this.pool) return this.pool // 已创建则复用

    const env = getMysqlEnv() // 读取 MySQL 配置
    this.pool = createPool({ // 创建连接池：常驻复用连接
      host: env.host,
      port: env.port,
      user: env.user,
      password: env.password,
      database: env.database,
      connectionLimit: 10, // 最大连接数
      namedPlaceholders: true, // 支持命名参数（如 :id），便于维护复杂 SQL
      timezone: "Z", // 统一用 UTC，避免时区差异
    })
    return this.pool // 返回连接池
  } // getPool 结束

  async onModuleDestroy() { // Nest 模块销毁钩子：优雅关闭连接池
    if (!this.pool) return // 未创建则无需处理
    await this.pool.end() // 关闭连接池
    this.pool = null // 清空引用，避免重复 close
  } // onModuleDestroy 结束
}
