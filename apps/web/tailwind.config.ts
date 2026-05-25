import type { Config } from "tailwindcss" // Tailwind 配置类型：用于为 config 提供 TS 类型检查

const config: Config = {
  darkMode: ["class"], // 深色模式策略：通过给 html/body 添加 class="dark" 切换（与 next-themes 常用方式一致）
  content: [
    "./app/**/*.{ts,tsx}", // Next App Router 目录：页面/布局/路由等
    "./components/**/*.{ts,tsx}", // 通用组件目录（含 shadcn/ui）
    "./src/**/*.{ts,tsx}", // 业务/服务端工具代码目录（server 等）
    "./lib/**/*.{ts,tsx}", // 通用工具与辅助函数目录
  ],
  theme: {
    extend: {
      colors: {
        // 颜色全部基于 CSS 变量：便于主题切换（明亮/黑暗/跟随系统），并与 shadcn/ui 变量体系对齐
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        // 圆角同样基于 CSS 变量：统一控制组件圆角大小
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Radix Accordion 动画：通过内容高度变量实现展开/收起过渡
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        // 动画名称映射：供 className 里直接使用 animate-accordion-xxx
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // 额外动画工具类（shadcn/ui 常用依赖）
}

export default config
