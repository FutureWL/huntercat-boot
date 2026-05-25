import * as React from "react" // React：用于 JSX 与 forwardRef

import { cn } from "@/lib/utils" // cn：合并 className（含 Tailwind 冲突合并）

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref} // 透传 ref，便于外部聚焦/测量
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} // Card 基础样式 + 外部 className
      {...props} // 透传原生 div 属性（onClick、data-* 等）
    />
  ),
)
Card.displayName = "Card" // 设置组件显示名，便于 React DevTools 查看

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} /> // Header：标题区域的布局与内边距
  ),
)
CardHeader.displayName = "CardHeader" // 设置组件显示名

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref} // 透传 ref
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)} // Title：字体大小/字重/行高
      {...props} // 透传原生 h3 属性
    />
  ),
)
CardTitle.displayName = "CardTitle" // 设置组件显示名

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref} // 透传 ref
    className={cn("text-sm text-muted-foreground", className)} // Description：弱化文字颜色
    {...props} // 透传原生 p 属性
  />
))
CardDescription.displayName = "CardDescription" // 设置组件显示名

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} /> // Content：内容区，默认去掉顶部 padding（与 header 衔接）
  ),
)
CardContent.displayName = "CardContent" // 设置组件显示名

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} /> // Footer：底部操作区，默认横向布局
  ),
)
CardFooter.displayName = "CardFooter" // 设置组件显示名

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } // 统一导出 Card 相关子组件
