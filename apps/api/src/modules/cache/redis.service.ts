import type { RedisClientType } from "redis"
import { createClient } from "redis"
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common"

import { getRedisEnv } from "../../config/env"

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null

  async onModuleInit() {
    this.getClient()
    await this.client!.connect()
  }

  getClient(): RedisClientType {
    if (this.client) return this.client

    const env = getRedisEnv()
    this.client = createClient({
      socket: { host: env.host, port: env.port },
      password: env.password,
    })
    return this.client
  }

  async onModuleDestroy() {
    if (!this.client) return
    await this.client.disconnect()
    this.client = null
  }
}

