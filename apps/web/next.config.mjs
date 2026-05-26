import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const apiBaseUrl = process.env.API_INTERNAL_BASE_URL ?? "http://localhost:3001"

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl}/v1/:path*`,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
