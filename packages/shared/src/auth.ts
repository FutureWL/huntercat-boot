export type AuthUser = { // 已登录用户信息：前后端共享的最小用户视图
  id: string // 用户唯一标识：通常为数据库主键或 UUID（字符串化）
  username: string // 用户名：用于展示与登录标识（业务侧约束唯一）
} // AuthUser 类型结束：用于 AuthMeResponse 等响应体

export type RegisterRequest = { // 注册请求体：客户端提交给注册接口的数据结构
  username: string // 用户名：通常需要 trim 并做长度/字符集校验
  password: string // 密码：仅用于注册阶段传输；服务端需进行哈希存储并避免明文落库
} // RegisterRequest 类型结束

export type LoginRequest = { // 登录请求体：客户端提交给登录接口的数据结构
  username: string // 用户名：用于定位用户并校验密码
  password: string // 密码：服务端将与保存的 passwordHash 进行比对（例如 bcrypt.compare）
} // LoginRequest 类型结束

export type AuthMeResponse = { // 当前登录用户响应体：用于 /auth/me 或登录/注册成功后的返回
  user: AuthUser // 当前会话对应的用户信息（不包含敏感字段，如 passwordHash）
} // AuthMeResponse 类型结束
