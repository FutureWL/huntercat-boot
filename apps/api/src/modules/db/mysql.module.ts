import { Module } from "@nestjs/common" // Module：Nest 模块装饰器

import { MysqlService } from "./mysql.service" // MysqlService：提供 MySQL 连接池单例

@Module({
  providers: [MysqlService], // 提供者：注册到 DI 容器
  exports: [MysqlService], // 导出：允许其他模块注入 MysqlService
})
export class MysqlModule {}
