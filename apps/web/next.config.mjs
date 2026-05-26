import createNextIntlPlugin from "next-intl/plugin" // next-intl 插件：让 Next.js 识别并加载 i18n 配置

const withNextIntl = createNextIntlPlugin("./i18n/request.ts") // 指定 next-intl 的请求配置文件路径

const apiBaseUrl = process.env.API_INTERNAL_BASE_URL ?? "http://localhost:3001" // API 内网地址：用于 Next rewrites 反代（默认指向本机 3001）

const nextConfig = {
  async rewrites() {
    // rewrites：把前端同源的 /api/v1/* 请求转发到后端 Nest API（避免 CORS 与跨域 Cookie）
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl}/v1/:path*`,
      },
    ]
  },
}

export default withNextIntl(nextConfig) // 导出最终 Next 配置：叠加 next-intl 插件能力
