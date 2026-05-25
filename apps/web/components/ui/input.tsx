import * as React from "react" // React：用于 JSX 与 forwardRef

import { cn } from "@/lib/utils" // cn：合并 className（含 Tailwind 冲突合并）

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type} // 输入框类型（text/password 等）
        className={cn( // 组合输入框基础样式与外部 className
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className, // 外部自定义样式
        )}
        ref={ref} // 透传 ref，便于外部聚焦
        {...props} // 透传其余 input 属性（value/onChange/placeholder 等）
      />
    )
  },
)
Input.displayName = "Input" // 设置组件显示名

export { Input } // 导出 Input 组件
