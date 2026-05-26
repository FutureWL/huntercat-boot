import type { ApiErrorCode, ApiResponse } from "@pjd/shared" // 共享契约：统一响应结构与错误码枚举

export function ok<T>(data: T): ApiResponse<T> { // 构造统一成功响应体
  return { ok: true, data } // ok=true 时携带 data
} // ok 函数结束

export function fail(code: ApiErrorCode, message: string): ApiResponse<never> { // 构造统一失败响应体
  return { ok: false, error: { code, message } } // ok=false 时携带 error（机器可读 code + 人类可读 message）
} // fail 函数结束
