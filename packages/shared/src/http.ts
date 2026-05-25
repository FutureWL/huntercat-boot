export type ApiErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_ERROR" // 接口错误码枚举（最小集合，后续可扩展）

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
