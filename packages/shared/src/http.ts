export type ApiErrorCode =
  | "BAD_REQUEST" // 参数/请求体不合法
  | "BAD_REQUEST_INVALID_JSON" // 请求体不是合法 JSON
  | "BAD_REQUEST_VALIDATION" // 参数校验失败
  | "UNAUTHORIZED" // 未登录或登录态失效
  | "AUTH_REQUIRED" // 需要登录
  | "AUTH_INVALID_CREDENTIALS" // 用户名或密码错误
  | "AUTH_SESSION_INVALID" // 登录态失效
  | "FORBIDDEN" // 已登录但无权限
  | "NOT_FOUND" // 资源不存在
  | "TODO_NOT_FOUND" // Todo 不存在
  | "CONFLICT" // 唯一性冲突（如用户名已存在）
  | "USER_USERNAME_TAKEN" // 用户名已存在
  | "INTERNAL_ERROR" // 服务端异常（兜底）

export type ApiError = {
  code: ApiErrorCode // 错误码（机器可读）
  message: string // 错误信息（人可读）
} // 统一错误结构

export type ApiSuccess<T> = {
  ok: true // 成功标记
  data: T // 成功数据载荷
} // 统一成功结构

export type ApiFailure = {
  ok: false // 失败标记
  error: ApiError // 失败信息
} // 统一失败结构

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure // 接口返回：成功/失败二选一（便于前后端统一处理）
