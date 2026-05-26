import { Module } from "@nestjs/common"

import { AuthModule } from "../auth/auth.module"
import { MysqlModule } from "../db/mysql.module"
import { TodoController } from "./todo.controller"
import { TodoRepository } from "./todo.repository"

@Module({
  imports: [MysqlModule, AuthModule],
  controllers: [TodoController],
  providers: [TodoRepository],
})
export class TodoModule {}
