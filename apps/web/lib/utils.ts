import { clsx, type ClassValue } from "clsx" // clsx：用于条件拼接 className，并提供 ClassValue 类型
import { twMerge } from "tailwind-merge" // twMerge：用于合并 Tailwind class，并处理冲突覆盖规则

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)) // 先用 clsx 生成 class 字符串，再用 twMerge 做 Tailwind 冲突合并
}
