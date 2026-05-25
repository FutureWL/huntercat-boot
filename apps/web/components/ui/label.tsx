import * as React from "react" // React：用于 JSX 与 forwardRef

import { cn } from "@/lib/utils" // cn：合并 className（含 Tailwind 冲突合并）

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<"label">
>(({ className, ...props }, ref) => (
  <label
    ref={ref} // 透传 ref
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} // Label 基础样式 + 外部 className
    {...props} // 透传原生 label 属性（htmlFor 等）
  />
))
Label.displayName = "Label" // 设置组件显示名

export { Label } // 导出 Label 组件
