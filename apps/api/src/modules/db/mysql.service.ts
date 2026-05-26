import type { Pool } from "mysql2/promise"
import { createPool } from "mysql2/promise"
import { Injectable, OnModuleDestroy } from "@nestjs/common"

import { getMysqlEnv } from "../../config/env"

@Injectable()
export class MysqlService implements OnModuleDestroy {
  private pool: Pool | null = null

  getPool(): Pool {
    if (this.pool) return this.pool

    const env = getMysqlEnv()
    this.pool = createPool({
      host: env.host,
      port: env.port,
      user: env.user,
      password: env.password,
      database: env.database,
      connectionLimit: 10,
      namedPlaceholders: true,
      timezone: "Z",
    })
    return this.pool
  }

  async onModuleDestroy() {
    if (!this.pool) return
    await this.pool.end()
    this.pool = null
  }
}

