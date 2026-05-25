// 国际化路由配置：集中定义项目支持的语言列表与默认语言
export const locales = ["zh-CN", "en-US"] as const // locales：允许的语言集合（as const 保持字面量类型）

export type Locale = (typeof locales)[number] // Locale：从 locales 推导出的联合类型（"zh-CN" | "en-US"）

export const defaultLocale: Locale = "zh-CN" // defaultLocale：未匹配到合法语言时的兜底默认值
