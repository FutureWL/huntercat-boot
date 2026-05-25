"use client"

import Link from "next/link" // Link：Next.js 的客户端导航组件（无刷新跳转）
import { useTranslations } from "next-intl" // useTranslations：多语言文案读取

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Card：用于分区展示能力点
import { Button } from "@/components/ui/button" // Button：统一按钮样式

// 访客端首页：产品能力介绍 + 公司介绍 + 转化入口
export default function HomePage() {
  const t = useTranslations() // 读取多语言文案（默认命名空间）

  return (
    <main className="space-y-16">
      <section className="space-y-6 py-2 sm:py-6"> {/* Hero：首屏价值表达 + 转化按钮 */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("landing.hero.title")}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("landing.hero.subtitle")}
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3"> {/* 三条核心卖点 */}
          <li className="rounded-lg border bg-card px-4 py-3 text-sm">
            <span className="font-medium">{t("landing.hero.points.0.title")}</span>
            <span className="ml-2 text-muted-foreground">{t("landing.hero.points.0.desc")}</span>
          </li>
          <li className="rounded-lg border bg-card px-4 py-3 text-sm">
            <span className="font-medium">{t("landing.hero.points.1.title")}</span>
            <span className="ml-2 text-muted-foreground">{t("landing.hero.points.1.desc")}</span>
          </li>
          <li className="rounded-lg border bg-card px-4 py-3 text-sm">
            <span className="font-medium">{t("landing.hero.points.2.title")}</span>
            <span className="ml-2 text-muted-foreground">{t("landing.hero.points.2.desc")}</span>
          </li>
        </ul>

        <div className="flex flex-wrap gap-3"> {/* 首屏按钮：试用/演示/销售 */}
          <Button asChild>
            <Link href="/register">{t("landing.hero.actions.trial")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register?intent=demo">{t("landing.hero.actions.demo")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register?intent=sales">{t("landing.hero.actions.sales")}</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2"> {/* Pain → Gain：痛点与解决方案 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("landing.pain.title")}</CardTitle>
            <CardDescription>{t("landing.pain.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>{t("landing.pain.items.0")}</li>
              <li>{t("landing.pain.items.1")}</li>
              <li>{t("landing.pain.items.2")}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("landing.gain.title")}</CardTitle>
            <CardDescription>{t("landing.gain.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>{t("landing.gain.items.0")}</li>
              <li>{t("landing.gain.items.1")}</li>
              <li>{t("landing.gain.items.2")}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section id="features" className="space-y-6 scroll-mt-20"> {/* Features：开箱即用能力清单 */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{t("landing.features.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("landing.features.subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"> {/* 功能卡片：8 项 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.features.items.rbac.title")}</CardTitle>
              <CardDescription>{t("landing.features.items.rbac.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.features.items.menu.title")}</CardTitle>
              <CardDescription>{t("landing.features.items.menu.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.features.items.audit.title")}</CardTitle>
              <CardDescription>{t("landing.features.items.audit.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.features.items.config.title")}</CardTitle>
              <CardDescription>{t("landing.features.items.config.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.features.items.i18n.title")}</CardTitle>
              <CardDescription>{t("landing.features.items.i18n.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.features.items.theme.title")}</CardTitle>
              <CardDescription>{t("landing.features.items.theme.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.features.items.upload.title")}</CardTitle>
              <CardDescription>{t("landing.features.items.upload.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.features.items.notify.title")}</CardTitle>
              <CardDescription>{t("landing.features.items.notify.desc")}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="solutions" className="space-y-6 scroll-mt-20"> {/* Solutions：适用场景 */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{t("landing.solutions.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("landing.solutions.subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2"> {/* 场景卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.solutions.items.0.title")}</CardTitle>
              <CardDescription>{t("landing.solutions.items.0.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.solutions.items.1.title")}</CardTitle>
              <CardDescription>{t("landing.solutions.items.1.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.solutions.items.2.title")}</CardTitle>
              <CardDescription>{t("landing.solutions.items.2.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.solutions.items.3.title")}</CardTitle>
              <CardDescription>{t("landing.solutions.items.3.desc")}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="cases" className="space-y-6 scroll-mt-20"> {/* Cases：客户案例 */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{t("landing.cases.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("landing.cases.subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"> {/* 客户案例卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.cases.items.0.name")}</CardTitle>
              <CardDescription>{t("landing.cases.items.0.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.cases.items.1.name")}</CardTitle>
              <CardDescription>{t("landing.cases.items.1.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.cases.items.2.name")}</CardTitle>
              <CardDescription>{t("landing.cases.items.2.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.cases.items.3.name")}</CardTitle>
              <CardDescription>{t("landing.cases.items.3.desc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("landing.cases.items.4.name")}</CardTitle>
              <CardDescription>{t("landing.cases.items.4.desc")}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="about" className="space-y-6 scroll-mt-20"> {/* About：公司介绍 */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{t("landing.about.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("landing.about.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("landing.about.companyName")}</CardTitle>
            <CardDescription>{t("landing.about.companyDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>{t("landing.about.points.0")}</li>
              <li>{t("landing.about.points.1")}</li>
              <li>{t("landing.about.points.2")}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section id="cta" className="space-y-4 rounded-xl border bg-card px-6 py-8 text-center"> {/* CTA：结束转化区 */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{t("landing.cta.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("landing.cta.subtitle")}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/register">{t("landing.cta.actions.trial")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register?intent=demo">{t("landing.cta.actions.demo")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register?intent=sales">{t("landing.cta.actions.sales")}</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
