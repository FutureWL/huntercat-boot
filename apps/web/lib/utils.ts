import { clsx, type ClassValue } from "clsx" // clsx：将字符串/数组/对象等多种输入统一规整为 className 字符串；ClassValue：clsx 可接受的输入类型定义
import { twMerge } from "tailwind-merge" // twMerge：在 clsx 的结果上进一步合并 Tailwind class；当存在互斥类（如 p-2 与 p-4）时按后者覆盖并去重

export function cn(...inputs: ClassValue[]) {
  const className = clsx(inputs) // 第一步：用 clsx 将多种条件输入（含 falsy 值）安全地拼接为 className 字符串
  return twMerge(className) // 第二步：用 twMerge 处理 Tailwind 冲突与重复，确保最终 className 更符合预期
}
