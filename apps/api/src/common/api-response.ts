import type { ApiErrorCode, ApiResponse } from "@pjd/shared"

export function ok<T>(data: T): ApiResponse<T> {
  return { ok: true, data }
}

export function fail(code: ApiErrorCode, message: string): ApiResponse<never> {
  return { ok: false, error: { code, message } }
}

