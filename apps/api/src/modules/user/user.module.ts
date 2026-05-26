import { Module } from "@nestjs/common"

import { MysqlModule } from "../db/mysql.module"
import { UserRepository } from "./user.repository"

@Module({
  imports: [MysqlModule],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}

