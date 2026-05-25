import * as React from "react" // React：用于 JSX 与 forwardRef
import { Slot } from "@radix-ui/react-slot" // Slot：支持 asChild，把按钮样式“套”到子元素上
import { cva, type VariantProps } from "class-variance-authority" // cva：声明变体 class；VariantProps：推导变体 props 类型

import { cn } from "@/lib/utils" // cn：合并 className（含 Tailwind 冲突合并）

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", // 基础按钮样式：布局/尺寸/焦点态/禁用态/图标大小
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90", // 主按钮：主色背景
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", // 次按钮：secondary 背景
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground", // 描边按钮：边框 + hover accent
        ghost: "hover:bg-accent hover:text-accent-foreground", // 幽灵按钮：无背景，hover 才出现底色
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90", // 危险按钮：红色背景
      },
      size: {
        default: "h-10 px-4 py-2", // 默认尺寸
        sm: "h-9 rounded-md px-3", // 小尺寸
        lg: "h-11 rounded-md px-8", // 大尺寸
        icon: "h-10 w-10", // 图标按钮：等宽等高
      },
    },
    defaultVariants: {
      variant: "default", // 默认变体：default
      size: "default", // 默认尺寸：default
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean // 为 true 时使用 Slot，把按钮样式应用到子元素（例如 Link）
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button" // 根据 asChild 决定渲染 Slot 还是原生 button
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))} // 合并变体样式与外部 className
        ref={ref} // 透传 ref，便于外部聚焦/测量
        {...props} // 透传其余原生 button 属性（onClick、disabled 等）
      />
    )
  },
)
Button.displayName = "Button" // 设置组件显示名，便于 React DevTools 查看

export { Button, buttonVariants } // 导出 Button 组件与变体工具（可在别处复用变体）
