import { cookies, headers } from "next/headers" // cookies/headers：读取请求中的语言偏好（cookie + accept-language）
import { getRequestConfig } from "next-intl/server" // next-intl：服务端读取请求语言并加载 messages 的入口

import { defaultLocale, locales } from "./routing" // 语言白名单 + 默认语言：用于兜底与校验

function normalizeLocale(locale: string | undefined): string | undefined {
  if (!locale) return undefined // 空值直接忽略
  if (locales.includes(locale as never)) return locale // 完整匹配（如 zh-CN / en-US）

  const baseLocale = locale.split("-")[0]?.toLowerCase() // 提取语言主标识（如 zh / en）
  return locales.find((item) => item.toLowerCase().startsWith(`${baseLocale}-`)) // 尝试匹配到受支持的完整 locale
}

function resolveLocaleFromAcceptLanguage(acceptLanguage: string | null): string | undefined {
  if (!acceptLanguage) return undefined // 请求头不存在时交给后续兜底逻辑

  const candidates = acceptLanguage
    .split(",")
    .map((item) => item.split(";")[0]?.trim())
    .filter(Boolean)

  for (const candidate of candidates) {
    const matchedLocale = normalizeLocale(candidate)
    if (matchedLocale) return matchedLocale // 命中第一个受支持语言即返回
  }

  return undefined // 没命中受支持语言时返回 undefined
}

// next-intl 请求级配置：为每个请求确定 locale，并按 locale 动态加载对应语言包
export default getRequestConfig(async ({ requestLocale }: { requestLocale: Promise<string | undefined> }) => {
  const cookieStore = await cookies() // 读取 cookie：支持记住用户手动切换的语言
  const headerStore = await headers() // 读取请求头：首次访问时可参考浏览器语言
  const cookieLocale = normalizeLocale(cookieStore.get("NEXT_LOCALE")?.value) // 优先使用用户显式选择的语言
  const routedLocale = normalizeLocale(await requestLocale) // 若未来改成 locale 路由，也能继续兼容
  const headerLocale = resolveLocaleFromAcceptLanguage(headerStore.get("accept-language")) // 首次访问按浏览器偏好选择
  const locale = cookieLocale ?? routedLocale ?? headerLocale ?? defaultLocale // 按优先级选择最终语言
  const safeLocale = locales.includes(locale as never) ? locale : defaultLocale // 防御性校验：避免传入未支持的语言导致加载失败

  return {
    locale: safeLocale, // 告诉 next-intl 当前请求使用的语言
    messages: (await import(`../messages/${safeLocale}.json`)).default, // 动态导入语言包：仅加载当前语言，减少 bundle 体积
    timeZone: "Asia/Shanghai",
  }
})
