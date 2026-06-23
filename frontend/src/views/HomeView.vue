<template>
  <!-- Custom Home Content: Full Page Mode -->
  <div v-if="homeContent" class="min-h-screen">
    <!-- iframe mode -->
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <!-- HTML mode - SECURITY: homeContent is admin-only setting, XSS risk is acceptable -->
    <div v-else v-html="homeContent"></div>
  </div>

  <!-- Default Home Page -->
  <div
    v-else
    class="home-page relative flex min-h-screen flex-col bg-[var(--youc-bg)] text-[var(--youc-ink)]"
  >
    <!-- Header -->
    <header class="home-header">
      <nav class="mx-auto flex h-[68px] max-w-[1120px] items-center justify-between px-6">
        <!-- Logo -->
        <div class="flex items-center gap-3 text-lg font-[850] uppercase tracking-[0.04em]">
          <div class="flex h-[34px] w-[34px] items-center justify-center overflow-hidden border-[2.5px] border-[var(--youc-line)] bg-[var(--youc-ink)]">
            <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
          </div>
          <span>{{ siteName }}</span>
        </div>

        <div class="home-navlinks">
          <a href="#how">{{ homeCopy.nav.how }}</a>
          <a href="#features">{{ homeCopy.nav.features }}</a>
          <a href="#why">{{ homeCopy.nav.why }}</a>
          <a href="#pricing">{{ homeCopy.nav.pricing }}</a>
          <a href="#faq">{{ homeCopy.nav.faq }}</a>
        </div>

        <!-- Nav Actions -->
        <div class="flex items-center gap-3">
          <!-- Language Switcher -->
          <LocaleSwitcher />

          <!-- Doc Link -->
          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-sm"
            :title="t('home.viewDocs')"
          >
            <Icon name="book" size="md" />
          </a>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="btn btn-ghost btn-sm"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          >
            <Icon v-if="isDark" name="sun" size="md" />
            <Icon v-else name="moon" size="md" />
          </button>

          <!-- Login / Dashboard Button -->
          <router-link
            v-if="isAuthenticated"
            :to="dashboardPath"
            class="btn btn-primary btn-sm"
          >
            <span
              class="flex h-5 w-5 items-center justify-center border-2 border-[var(--youc-bg)] bg-[var(--youc-accent-2)] text-[10px] font-black text-[#04231f]"
            >
              {{ userInitial }}
            </span>
            <span>{{ t('home.dashboard') }}</span>
            <svg
              class="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </router-link>
          <router-link
            v-else
            to="/login"
            class="btn btn-primary btn-sm"
          >
            {{ t('home.login') }}
          </router-link>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-1 py-10 md:py-[74px]">
      <div class="w-full">
        <!-- Hero Section - Left/Right Layout -->
        <div class="home-container hero-grid mb-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <!-- Left: Text Content -->
          <div class="text-center lg:text-left">
            <span class="tagline">{{ homeCopy.heroKicker }}</span>
            <h1
              class="my-6 text-5xl font-[850] uppercase leading-[1.02] tracking-[-0.04em] text-[var(--youc-ink)] md:text-6xl"
            >
              {{ homeCopy.heroTitleLine1 }}<br />
              <mark>{{ homeCopy.heroTitleHighlight }}</mark>
            </h1>
            <p class="sans mx-auto mb-8 max-w-xl text-base text-[var(--youc-muted)] lg:mx-0">
              {{ siteSubtitle }}
            </p>

            <!-- CTA Button -->
            <div class="flex flex-wrap justify-center gap-3 lg:justify-start">
              <router-link
                :to="isAuthenticated ? dashboardPath : '/login'"
                class="btn btn-success btn-lg"
              >
                {{ isAuthenticated ? t('home.goToDashboard') : t('home.getStarted') }}
                <Icon name="arrowRight" size="md" class="ml-2" :stroke-width="2" />
              </router-link>
              <a
                v-if="docUrl"
                :href="docUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-lg"
              >
                {{ t('home.viewDocs') }}
              </a>
            </div>

            <div class="hero-stats mt-10">
              <div v-for="stat in homeCopy.heroStats" :key="stat.label">
                <div class="n">{{ stat.value }}</div>
                <div class="l">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- Right: Terminal Animation -->
          <div class="flex justify-center lg:justify-end">
            <div class="terminal-container">
              <div class="terminal-window">
                <!-- Window header -->
                <div class="terminal-header">
                  <span>{{ homeCopy.terminal.scriptTitle }}</span>
                  <span>{{ homeCopy.terminal.method }}</span>
                </div>
                <!-- Terminal content -->
                <div class="terminal-body">
                  <div class="code-line line-0">
                    <span class="code-comment"># {{ homeCopy.terminal.baseUrl }}</span>
                  </div>
                  <div class="code-line line-1">
                    <span class="code-prompt">$</span>
                    <span class="code-cmd">curl</span>
                    <span class="code-url">ai.youc.online/messages</span>
                    <span class="code-flag">\</span>
                  </div>
                  <div class="code-line line-2">
                    <span class="code-flag">-H</span>
                    <span class="code-response">"Authorization: Bearer sk-***"</span>
                  </div>
                  <div class="code-line line-3">
                    <span class="code-comment"># {{ homeCopy.terminal.routing }}</span>
                  </div>
                  <div class="code-line line-4">
                    <span class="code-success">200 OK</span>
                    <span class="code-response">{ "content": "{{ homeCopy.terminal.responseContent }}" }</span>
                  </div>
                  <div class="code-line line-5">
                    <span class="code-comment"># 1,240 tokens · ¥0.018</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Tags - Centered -->
        <div class="feature-strip mb-14">
          <div class="strip-track">
            <div class="strip-group" aria-hidden="false">
              <span v-for="(tag, index) in homeCopy.stripTags" :key="`strip-a-${index}`">{{ tag }}</span>
            </div>
            <div class="strip-group" aria-hidden="true">
              <span v-for="(tag, index) in homeCopy.stripTags" :key="`strip-b-${index}`">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div class="home-container mb-12 flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <div class="provider-chip">
            <Icon name="swap" size="sm" class="text-primary-500" />
            <span>{{
              t('home.tags.subscriptionToApi')
            }}</span>
          </div>
          <div class="provider-chip">
            <Icon name="shield" size="sm" class="text-primary-500" />
            <span>{{
              t('home.tags.stickySession')
            }}</span>
          </div>
          <div class="provider-chip">
            <Icon name="chart" size="sm" class="text-primary-500" />
            <span>{{
              t('home.tags.realtimeBilling')
            }}</span>
          </div>
        </div>

        <!-- How It Works -->
        <section id="how" class="home-section">
          <div class="section-head">
            <h2>{{ homeCopy.howTitle }}</h2>
            <span class="section-index">{{ homeCopy.sectionIndexes.how }}</span>
          </div>
          <div class="steps-grid">
            <div v-for="step in homeCopy.howSteps" :key="step.no" class="step-card">
              <div class="step-no">{{ step.no }}</div>
              <h3>{{ step.title }}</h3>
              <p class="sans">{{ step.description }}</p>
              <code v-if="step.code">{{ step.code }}</code>
            </div>
          </div>
        </section>

        <!-- Features Grid -->
        <section id="features" class="home-section">
          <div class="section-head">
            <h2>{{ homeCopy.featuresTitle }}</h2>
            <span class="section-index">{{ homeCopy.sectionIndexes.features }}</span>
          </div>
          <div class="grid gap-6 md:grid-cols-3">
          <!-- Feature 1: Unified Gateway -->
          <div
            class="feature-card group"
          >
            <div
              class="feature-icon bg-[#1d4ed8]"
            >
              <Icon name="server" size="lg" class="text-white" />
            </div>
            <div class="feature-no">01</div>
            <h3>
              {{ homeCopy.featureCards[0].title }}
            </h3>
            <p class="sans">
              {{ homeCopy.featureCards[0].description }}
            </p>
          </div>

          <!-- Feature 2: Account Pool -->
          <div
            class="feature-card group"
          >
            <div
              class="feature-icon bg-[var(--youc-accent)]"
            >
              <svg
                class="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <div class="feature-no">02</div>
            <h3>
              {{ homeCopy.featureCards[1].title }}
            </h3>
            <p class="sans">
              {{ homeCopy.featureCards[1].description }}
            </p>
          </div>

          <!-- Feature 3: Billing & Quota -->
          <div
            class="feature-card group"
          >
            <div
              class="feature-icon bg-[#db2777]"
            >
              <svg
                class="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
            </div>
            <div class="feature-no">03</div>
            <h3>
              {{ homeCopy.featureCards[2].title }}
            </h3>
            <p class="sans">
              {{ homeCopy.featureCards[2].description }}
            </p>
          </div>
            <div
              v-for="(feature, index) in homeCopy.featureCards.slice(3)"
              :key="feature.title"
              class="feature-card group"
            >
              <div class="feature-icon" :class="feature.iconClass">
                <Icon :name="feature.icon" size="lg" class="text-white" />
              </div>
              <div class="feature-no">{{ String(index + 4).padStart(2, '0') }}</div>
              <h3>{{ feature.title }}</h3>
              <p class="sans">{{ feature.description }}</p>
            </div>
          </div>
        </section>

        <!-- Comparison -->
        <section id="why" class="home-section">
          <div class="section-head">
            <h2>{{ homeCopy.compareTitle }}</h2>
            <span class="section-index">{{ homeCopy.sectionIndexes.compare }}</span>
          </div>
          <div class="compare-wrap">
            <div class="compare-table">
              <div class="compare-row compare-head">
                <div>{{ homeCopy.compareHeaders.item }}</div>
                <div>{{ homeCopy.compareHeaders.official }}</div>
                <div>{{ siteName }}</div>
              </div>
              <div v-for="row in homeCopy.compareRows" :key="row.item" class="compare-row">
                <div>{{ row.item }}</div>
                <div>{{ row.official }}</div>
                <div class="compare-us">{{ row.us }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Supported Providers -->
        <section id="providers" class="home-section">
          <div class="section-head">
            <h2>
              {{ homeCopy.providersTitle }}
            </h2>
            <span class="section-index">{{ homeCopy.sectionIndexes.providers }}</span>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <div
              v-for="provider in homeCopy.providers"
              :key="provider.name"
              class="provider-chip"
              :class="{ 'opacity-60': provider.status === 'soon' }"
            >
              <div class="provider-avatar" :class="provider.avatarClass">
                <span class="text-xs font-bold text-white">{{ provider.short }}</span>
              </div>
              <span>{{ provider.name }}</span>
              <span v-if="provider.status === 'live'" class="live-badge">{{ homeCopy.providerStatus.live }}</span>
              <span v-else class="soon-badge">{{ homeCopy.providerStatus.soon }}</span>
            </div>
          </div>
        </section>

        <!-- Pricing -->
        <section id="pricing" class="home-section">
          <div class="section-head">
            <h2>{{ homeCopy.pricingTitle }}</h2>
            <span class="section-index">{{ homeCopy.sectionIndexes.pricing }}</span>
          </div>
          <div class="pricing-grid">
            <div v-for="plan in homeCopy.pricing" :key="plan.name" class="pricing-card" :class="{ hot: plan.hot }">
              <span class="pricing-tag">{{ plan.name }}</span>
              <div class="pricing-amount">
                {{ plan.amount }}<small>{{ plan.suffix }}</small>
              </div>
              <p class="sans">{{ plan.description }}</p>
              <ul class="sans">
                <li v-for="item in plan.items" :key="item">{{ item }}</li>
              </ul>
              <router-link
                v-if="plan.route"
                :to="plan.route"
                class="btn"
                :class="plan.hot ? 'btn-success' : 'btn-secondary'"
              >
                {{ plan.action }}
              </router-link>
              <a
                v-else-if="docUrl"
                :href="docUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-secondary"
              >
                {{ plan.action }}
              </a>
              <router-link v-else to="/login" class="btn btn-secondary">
                {{ plan.action }}
              </router-link>
            </div>
          </div>
        </section>

        <!-- FAQ -->
        <section id="faq" class="home-section">
          <div class="section-head">
            <h2>{{ homeCopy.faqTitle }}</h2>
            <span class="section-index">{{ homeCopy.sectionIndexes.faq }}</span>
          </div>
          <div class="faq-list">
            <details v-for="(item, index) in homeCopy.faq" :key="item.question" :open="index === 0">
              <summary>{{ item.question }}</summary>
              <p class="sans">{{ item.answer }}</p>
            </details>
          </div>
        </section>

        <!-- CTA -->
        <section class="home-section">
          <div class="cta-band">
            <h2>{{ homeCopy.ctaTitle }}</h2>
            <p class="sans">{{ homeCopy.ctaDescription }}</p>
            <router-link
              :to="isAuthenticated ? dashboardPath : '/login'"
              class="btn btn-success btn-lg"
            >
              {{ isAuthenticated ? t('home.goToDashboard') : t('home.getStarted') }}
              <Icon name="arrowRight" size="md" class="ml-2" :stroke-width="2" />
            </router-link>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="home-footer relative z-10">
      <div class="mx-auto max-w-6xl px-6">
        <div class="footer-grid">
          <div>
            <div class="mb-4 flex items-center gap-3 text-lg font-[850] uppercase tracking-[0.04em]">
              <div class="flex h-[34px] w-[34px] items-center justify-center overflow-hidden border-[2.5px] border-[var(--youc-line)] bg-[var(--youc-ink)]">
                <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
              </div>
              <span>{{ siteName }}</span>
            </div>
            <p class="sans max-w-sm text-sm text-[var(--youc-muted)]">
              {{ homeCopy.footerDescription }}
            </p>
          </div>
          <div class="footer-col">
            <h4>{{ homeCopy.footer.product }}</h4>
            <a href="#features">{{ homeCopy.nav.features }}</a>
            <a href="#pricing">{{ homeCopy.nav.pricing }}</a>
            <a href="#providers">{{ homeCopy.providersTitle }}</a>
            <router-link :to="isAuthenticated ? dashboardPath : '/login'">{{ t('home.dashboard') }}</router-link>
          </div>
          <div class="footer-col">
            <h4>{{ homeCopy.footer.resources }}</h4>
            <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer">{{ t('home.docs') }}</a>
            <a href="#faq">{{ homeCopy.nav.faq }}</a>
          </div>
          <div class="footer-col">
            <h4>{{ homeCopy.footer.about }}</h4>
            <a :href="githubUrl" target="_blank" rel="noopener noreferrer">GitHub</a>
            <router-link to="/legal/terms">{{ homeCopy.footer.terms }}</router-link>
            <router-link to="/legal/usage-policy">{{ homeCopy.footer.policy }}</router-link>
          </div>
        </div>
        <div class="footer-bar">
          <div>&copy; {{ currentYear }} {{ siteName }} - {{ homeCopy.footer.copyrightSuffix }}</div>
          <div class="flex gap-5">
            <a :href="githubUrl" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer">{{ homeCopy.footer.docs }}</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { normalizeBrandName } from '@/config/brand'

const { t, locale } = useI18n()

const authStore = useAuthStore()
const appStore = useAppStore()
const defaultSiteSubtitleEn = 'Subscription to API Conversion Platform'

const homeCopy = computed(() => {
  if (locale.value.startsWith('zh')) {
    return {
      nav: {
        how: '流程',
        features: '功能',
        why: '优势',
        pricing: '定价',
        faq: '问题',
      },
      heroKicker: 'AI API 网关 // 订阅额度分发',
      heroTitleLine1: '一个密钥',
      heroTitleHighlight: '所有模型',
      heroDescription:
        '无需管理多个订阅账号。YOUC 统一鉴权、智能调度、按量计费，把分散的 AI 订阅变成一把可分发、可计量、可管控的 API 密钥。',
      terminal: {
        scriptTitle: '请求示例',
        method: 'POST /v1/messages',
        baseUrl: '替换 BaseURL，统一密钥',
        routing: '路由 / 均衡 / 计费',
        responseContent: '你好！',
      },
      heroStats: [
        { value: '99.9%', label: 'SLA' },
        { value: '4+', label: '服务商' },
        { value: '<800ms', label: '延迟' },
        { value: '∞', label: '密钥' },
      ],
      stripTags: [
        '订阅转 API',
        '会话保持',
        '实时计费',
        '统一网关',
        '账号池',
        '额度控制',
        '全部模型',
      ],
      sectionIndexes: {
        how: '/ 01 - 使用流程',
        features: '/ 02 - 核心功能',
        compare: '/ 03 - 方案对比',
        providers: '/ 04 - 支持模型',
        pricing: '/ 05 - 定价方案',
        faq: '/ 06 - 常见问题',
      },
      howTitle: '三步使用',
      howSteps: [
        {
          no: '01',
          title: '注册账号',
          description: '创建 YOUC 账号，绑定你的上游订阅或交由平台账号池托管。',
          code: '',
        },
        {
          no: '02',
          title: '获取密钥',
          description: '在控制台一键生成 API Key，并按团队成员配置额度与限额。',
          code: 'sk-s2a-********',
        },
        {
          no: '03',
          title: '替换 BaseURL',
          description: '把请求地址指向网关即可，兼容官方 SDK，无需改动业务代码。',
          code: 'ai.youc.online',
        },
      ],
      featuresTitle: '核心能力',
      featureCards: [
        {
          title: '统一接入',
          description: '一把 API 密钥即可调用所有已接入的 AI 模型，无需为每个厂商单独申请与维护。',
          icon: 'server' as const,
          iconClass: 'bg-[#1d4ed8]',
        },
        {
          title: '稳定可靠',
          description: '智能调度多个上游账号，自动切换与负载均衡，告别频繁报错与触发限流。',
          icon: 'shield' as const,
          iconClass: 'bg-[var(--youc-accent)]',
        },
        {
          title: '用多少算多少',
          description: '按实际 Token 用量精准计费，支持为团队成员配置额度与限额，成本透明。',
          icon: 'chart' as const,
          iconClass: 'bg-[#db2777]',
        },
        {
          title: '会话保持',
          description: 'Sticky Session 让同一会话稳定命中同一上游，多轮对话上下文更连贯。',
          icon: 'link' as const,
          iconClass: 'bg-[#7c3aed]',
        },
        {
          title: '并发与限流',
          description: '按用户、按账号粒度配置并发与速率限制，保护上游、保障公平使用。',
          icon: 'bolt' as const,
          iconClass: 'bg-[#b45309]',
        },
        {
          title: '管理后台',
          description: '可视化监控用量、订单与账号健康，支持 iframe 嵌入外部系统扩展。',
          icon: 'cog' as const,
          iconClass: 'bg-[#334155]',
        },
      ],
      compareTitle: '为什么选我们',
      compareHeaders: {
        item: '对比项',
        official: '官方订阅',
      },
      compareRows: [
        { item: '付费方式', official: '固定月费，用不完也付', us: '按量付费，多用多付' },
        { item: '模型选择', official: '单一服务商', us: '多厂商任意切换' },
        { item: '账号管理', official: '各自分散管理', us: '统一密钥一站管理' },
        { item: '稳定性', official: '单账号易触发限流', us: '多账号调度自动容错' },
        { item: '用量可视', official: '分散、难统计', us: '实时计量与成本分析' },
      ],
      providersTitle: '支持模型',
      providers: [
        { name: 'Claude', short: 'C', status: 'live', avatarClass: 'bg-[#ea580c]' },
        { name: 'GPT', short: 'G', status: 'live', avatarClass: 'bg-[#059669]' },
        { name: 'Gemini', short: 'G', status: 'live', avatarClass: 'bg-[#1d4ed8]' },
        { name: 'Antigravity', short: 'A', status: 'live', avatarClass: 'bg-[#db2777]' },
        { name: '更多', short: '+', status: 'soon', avatarClass: 'bg-[#334155]' },
      ],
      providerStatus: {
        live: '已接入',
        soon: '即将支持',
      },
      pricingTitle: '定价',
      pricing: [
        {
          name: '免费版',
          amount: '¥0',
          suffix: '/ 月',
          description: '个人体验，零门槛起步。',
          items: ['1 个 API 密钥', '基础模型访问', '社区文档支持', '用量看板'],
          action: '免费开始',
          route: '/login',
          hot: false,
        },
        {
          name: '专业版 · 推荐',
          amount: '按量',
          suffix: ' 付费',
          description: '团队首选，用多少付多少。',
          items: ['无限 API 密钥', '全部模型 + 多账号调度', '会话保持 / 并发限流', '成员额度与成本分析'],
          action: '立即开通',
          route: '/login',
          hot: true,
        },
        {
          name: '企业版',
          amount: '定制',
          suffix: ' 方案',
          description: '私有部署与定制集成。',
          items: ['私有化 / 独享资源', 'SLA 与专属支持', '外部系统 iframe 集成', '审计与权限管控'],
          action: '联系我们',
          route: '',
          hot: false,
        },
      ],
      faqTitle: '常见问题',
      faq: [
        {
          question: 'YOUC 是什么？',
          answer:
            '一个 AI API 网关平台，把 AI 产品的订阅额度统一分发与管理。用户通过平台生成的 API Key 访问上游 AI 服务，平台负责鉴权、计费、负载均衡与请求转发。',
        },
        {
          question: '需要改动现有代码吗？',
          answer: '几乎不需要。兼容官方 SDK，只要把请求的 BaseURL 指向网关、替换为平台密钥即可开始调用。',
        },
        {
          question: '支持哪些模型厂商？',
          answer: '当前已支持 Claude、GPT、Gemini、Antigravity，更多主流大模型持续接入中。',
        },
        {
          question: '计费方式是怎样的？',
          answer: '按实际 Token 用量精准计费，多用多付；可为团队成员配置额度与限额，并在后台查看实时成本分析。',
        },
        {
          question: '如何保证稳定性？',
          answer: '平台对多个上游账号智能调度，自动切换与负载均衡，并提供并发与速率限制，降低触发限流与报错的概率。',
        },
      ],
      ctaTitle: '现在就开始',
      ctaDescription: '注册账号 → 获取密钥 → 替换 BaseURL。兼容现有 SDK，5 分钟即刻上线。',
      footerDescription: 'AI API 网关平台，把 AI 订阅额度变成可分发、可计量、可管控的 API 能力。',
      footer: {
        product: '产品',
        resources: '资源',
        about: '关于',
        terms: '服务条款',
        policy: '使用政策',
        docs: '文档',
        copyrightSuffix: 'AI API 网关',
      },
    }
  }

  return {
    nav: {
      how: 'How',
      features: 'Features',
      why: 'Why',
      pricing: 'Pricing',
      faq: 'FAQ',
    },
    heroKicker: 'AI API Gateway // Subscription Quota Distribution',
    heroTitleLine1: 'One Key',
    heroTitleHighlight: 'All Models',
    heroDescription:
      'Stop managing scattered subscriptions. YOUC unifies auth, smart routing, and usage billing, turning AI subscriptions into one distributable and measurable API key.',
    terminal: {
      scriptTitle: 'request.sh',
      method: 'POST /v1/messages',
      baseUrl: 'Replace BaseURL, use one key',
      routing: 'routing / balancing / billing',
      responseContent: 'Hello!',
    },
    heroStats: [
      { value: '99.9%', label: 'SLA' },
      { value: '4+', label: 'Providers' },
      { value: '<800ms', label: 'Latency' },
      { value: '∞', label: 'Keys' },
    ],
    stripTags: [
      'Subscription To API',
      'Sticky Session',
      'Realtime Billing',
      'Unified Gateway',
      'Account Pool',
      'Quota Control',
      'All Models',
    ],
    sectionIndexes: {
      how: '/ 01 - HOW IT WORKS',
      features: '/ 02 - FEATURES',
      compare: '/ 03 - COMPARE',
      providers: '/ 04 - PROVIDERS',
      pricing: '/ 05 - PRICING',
      faq: '/ 06 - FAQ',
    },
    howTitle: 'Three Steps',
    howSteps: [
      {
        no: '01',
        title: 'Create Account',
        description: 'Create a YOUC account, connect upstream subscriptions, or use the managed account pool.',
        code: '',
      },
      {
        no: '02',
        title: 'Get API Key',
        description: 'Generate an API key in the console and assign quota limits for team members.',
        code: 'sk-s2a-********',
      },
      {
        no: '03',
        title: 'Replace BaseURL',
        description: 'Point requests to the gateway. Official SDKs stay compatible with no business-code rewrite.',
        code: 'ai.youc.online',
      },
    ],
    featuresTitle: 'Core Features',
    featureCards: [
      {
        title: 'Unified Access',
        description: 'Use one API key to call every connected AI model without separate provider applications.',
        icon: 'server' as const,
        iconClass: 'bg-[#1d4ed8]',
      },
      {
        title: 'Reliable Routing',
        description: 'Smart scheduling across upstream accounts with automatic failover and load balancing.',
        icon: 'shield' as const,
        iconClass: 'bg-[var(--youc-accent)]',
      },
      {
        title: 'Usage Billing',
        description: 'Precise token-based billing with team quotas, limits, and transparent cost tracking.',
        icon: 'chart' as const,
        iconClass: 'bg-[#db2777]',
      },
      {
        title: 'Sticky Session',
        description: 'Keep the same conversation on the same upstream account for more stable context.',
        icon: 'link' as const,
        iconClass: 'bg-[#7c3aed]',
      },
      {
        title: 'Rate Limits',
        description: 'Configure concurrency and rate limits by user or account to protect upstream capacity.',
        icon: 'bolt' as const,
        iconClass: 'bg-[#b45309]',
      },
      {
        title: 'Admin Console',
        description: 'Monitor usage, orders, and account health visually, with iframe extensions supported.',
        icon: 'cog' as const,
        iconClass: 'bg-[#334155]',
      },
    ],
    compareTitle: 'Why Choose Us',
    compareHeaders: {
      item: 'Item',
      official: 'Official Subscription',
    },
    compareRows: [
      { item: 'Billing', official: 'Fixed monthly fee, paid even when unused', us: 'Pay as you go' },
      { item: 'Models', official: 'Single provider only', us: 'Switch across providers' },
      { item: 'Accounts', official: 'Managed separately', us: 'One key, one console' },
      { item: 'Stability', official: 'Single account hits limits easily', us: 'Multi-account auto failover' },
      { item: 'Visibility', official: 'Scattered and hard to audit', us: 'Realtime usage and cost analytics' },
    ],
    providersTitle: 'Supported Models',
    providers: [
      { name: 'Claude', short: 'C', status: 'live', avatarClass: 'bg-[#ea580c]' },
      { name: 'GPT', short: 'G', status: 'live', avatarClass: 'bg-[#059669]' },
      { name: 'Gemini', short: 'G', status: 'live', avatarClass: 'bg-[#1d4ed8]' },
      { name: 'Antigravity', short: 'A', status: 'live', avatarClass: 'bg-[#db2777]' },
      { name: 'More', short: '+', status: 'soon', avatarClass: 'bg-[#334155]' },
    ],
    providerStatus: {
      live: 'LIVE',
      soon: 'SOON',
    },
    pricingTitle: 'Pricing',
    pricing: [
      {
        name: 'Free',
        amount: '$0',
        suffix: '/ mo',
        description: 'A low-friction personal trial.',
        items: ['1 API key', 'Basic model access', 'Community docs support', 'Usage dashboard'],
        action: 'Start Free',
        route: '/login',
        hot: false,
      },
      {
        name: 'Pro · Recommended',
        amount: 'Usage',
        suffix: ' based',
        description: 'Best for teams that want flexible usage.',
        items: ['Unlimited API keys', 'All models + account pool routing', 'Sticky session / rate limits', 'Member quota and cost analytics'],
        action: 'Start Pro',
        route: '/login',
        hot: true,
      },
      {
        name: 'Enterprise',
        amount: 'Custom',
        suffix: ' plan',
        description: 'Private deployment and custom integration.',
        items: ['Private resources', 'SLA and dedicated support', 'External iframe integration', 'Audit and permission controls'],
        action: 'Contact Us',
        route: '',
        hot: false,
      },
    ],
    faqTitle: 'FAQ',
    faq: [
      {
        question: 'What is YOUC?',
        answer:
          'YOUC is an AI API gateway that distributes and manages AI subscription quota through generated API keys, handling auth, billing, load balancing, and request forwarding.',
      },
      {
        question: 'Do I need to change existing code?',
        answer: 'Almost no changes are needed. Keep using official SDKs, replace the BaseURL, and use the platform key.',
      },
      {
        question: 'Which providers are supported?',
        answer: 'Claude, GPT, Gemini, and Antigravity are supported now, with more major model providers being added.',
      },
      {
        question: 'How does billing work?',
        answer: 'Billing is based on actual token usage. Teams can set quotas and limits while tracking realtime costs in the console.',
      },
      {
        question: 'How is stability improved?',
        answer: 'YOUC schedules requests across multiple upstream accounts with failover, load balancing, concurrency controls, and rate limits.',
      },
    ],
    ctaTitle: 'Start Now',
    ctaDescription: 'Create account -> get API key -> replace BaseURL. Compatible with existing SDKs and ready in minutes.',
    footerDescription: 'AI API Gateway Platform that turns AI subscription quota into distributable, measurable, controllable API capacity.',
    footer: {
      product: 'Product',
      resources: 'Resources',
      about: 'About',
      terms: 'Terms',
      policy: 'Usage Policy',
      docs: 'Docs',
      copyrightSuffix: 'AI API GATEWAY',
    },
  }
})

// Site settings - directly from appStore (already initialized from injected config)
const siteName = computed(() => normalizeBrandName(appStore.cachedPublicSettings?.site_name || appStore.siteName))
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const siteSubtitle = computed(() => {
  const configuredSubtitle = appStore.cachedPublicSettings?.site_subtitle?.trim()
  if (configuredSubtitle && !(locale.value.startsWith('zh') && configuredSubtitle === defaultSiteSubtitleEn)) {
    return configuredSubtitle
  }
  return homeCopy.value.heroDescription
})
const docUrl = computed(() => appStore.cachedPublicSettings?.doc_url || appStore.docUrl || '')
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')

// Check if homeContent is a URL (for iframe display)
const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

// Theme
const isDark = ref(document.documentElement.classList.contains('dark'))

// GitHub URL
const githubUrl = 'https://github.com/Wei-Shaw/sub2api'

// Auth state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => isAdmin.value ? '/admin/dashboard' : '/dashboard')
const userInitial = computed(() => {
  const user = authStore.user
  if (!user || !user.email) return ''
  return user.email.charAt(0).toUpperCase()
})

// Current year for footer
const currentYear = computed(() => new Date().getFullYear())

// Toggle theme
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
}

onMounted(() => {
  initTheme()

  // Check auth state
  authStore.checkAuth()

  // Ensure public settings are loaded (will use cache if already loaded from injected config)
  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings()
  }
})
</script>

<style scoped>
.sans {
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
}

.home-header {
  position: sticky;
  top: 0;
  z-index: 60;
  border-bottom: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
}

.home-container,
.home-section {
  width: min(100%, 1120px);
  margin-right: auto;
  margin-left: auto;
  padding-right: 24px;
  padding-left: 24px;
}

.home-page {
  width: 100%;
}

.home-page mark {
  background: var(--youc-accent-2);
  color: #04231f;
  padding: 0 6px;
}

.home-navlinks {
  display: none;
  align-items: center;
  gap: 26px;
  font-size: 13.5px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home-navlinks a {
  border-bottom: 2.5px solid transparent;
  padding: 4px 2px;
}

.home-navlinks a:hover {
  border-color: var(--youc-accent);
}

@media (min-width: 880px) {
  .home-navlinks {
    display: flex;
  }
}

.tagline {
  display: inline-block;
  border: 2.5px solid var(--youc-line);
  background: var(--youc-accent);
  color: #ffffff;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
}

.hero-stats > div {
  border-right: 2.5px solid var(--youc-line);
  padding: 18px 16px;
}

.hero-stats > div:last-child {
  border-right: 0;
}

.hero-stats .n {
  font-size: 24px;
  font-weight: 850;
  line-height: 1.1;
}

.hero-stats .l {
  color: var(--youc-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.terminal-container {
  position: relative;
  display: inline-block;
  width: min(100%, 460px);
}

.terminal-window {
  width: 100%;
  border: 2.5px solid var(--youc-line);
  background: #111111;
  color: #d6d3cb;
  box-shadow: 8px 8px 0 var(--youc-line);
  overflow: hidden;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease;
}

.terminal-window:hover {
  transform: translate(-3px, -3px);
  box-shadow: 11px 11px 0 var(--youc-line);
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px dashed #444444;
  padding: 14px 16px;
  color: #7a766d;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.terminal-body {
  padding: 20px 22px 24px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 2;
}

.code-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  opacity: 0;
  animation: line-appear 0.5s ease forwards;
}

.line-1 {
  animation-delay: 0.3s;
}
.line-2 {
  animation-delay: 1s;
}
.line-3 {
  animation-delay: 1.8s;
}
.line-4 {
  animation-delay: 2.5s;
}
.line-5 {
  animation-delay: 3s;
}

@keyframes line-appear {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.code-prompt {
  color: #86efac;
  font-weight: bold;
}
.code-cmd {
  color: var(--youc-accent-2);
}
.code-flag {
  color: #f0abfc;
}
.code-url {
  color: var(--youc-accent-2);
}
.code-comment {
  color: #7a766d;
  font-style: italic;
}
.code-success {
  color: #86efac;
  font-weight: 800;
}
.code-response {
  color: #f0abfc;
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: #86efac;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.feature-strip {
  border-top: 2.5px solid var(--youc-line);
  border-bottom: 2.5px solid var(--youc-line);
  background: var(--youc-ink);
  color: var(--youc-bg);
  overflow: hidden;
  padding: 12px 0;
  white-space: nowrap;
}

.strip-track {
  display: flex;
  width: max-content;
  animation: home-scroll 28s linear infinite;
  will-change: transform;
}

.strip-group {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}

.strip-group span {
  display: inline-block;
  padding: 0 26px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

@keyframes home-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.feature-card {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
  box-shadow: 4px 4px 0 var(--youc-line);
  padding: 26px;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease;
}

.feature-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 7px 7px 0 var(--youc-accent);
}

.feature-icon,
.provider-avatar {
  display: grid;
  place-items: center;
  border: 2.5px solid var(--youc-line);
  color: #ffffff;
}

.feature-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
}

.feature-no {
  margin-bottom: 8px;
  color: var(--youc-accent);
  font-size: 13px;
  font-weight: 850;
  letter-spacing: 0.12em;
}

.home-section {
  padding-top: 70px;
  padding-bottom: 10px;
}

.feature-card h3 {
  margin-bottom: 10px;
  color: var(--youc-ink);
  font-size: 21px;
  font-weight: 850;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.feature-card p {
  color: var(--youc-muted);
  font-size: 14px;
  line-height: 1.7;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 2.5px solid var(--youc-line);
  margin-bottom: 28px;
  padding-bottom: 18px;
  text-align: left;
}

.section-head h2 {
  color: var(--youc-ink);
  font-size: 32px;
  font-weight: 850;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.section-index {
  color: var(--youc-accent);
  font-size: 13px;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
}

.steps-grid,
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.step-card,
.pricing-card {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
  box-shadow: 4px 4px 0 var(--youc-line);
  padding: 26px;
}

.step-no {
  color: var(--youc-accent-2);
  font-size: 54px;
  font-weight: 850;
  line-height: 1;
  -webkit-text-stroke: 2px var(--youc-ink);
}

.step-card h3 {
  margin: 14px 0 8px;
  font-size: 19px;
  font-weight: 850;
  text-transform: uppercase;
}

.step-card p {
  color: var(--youc-muted);
  font-size: 13.5px;
}

.step-card code {
  display: inline-block;
  margin-top: 10px;
  background: var(--youc-ink);
  color: #86efac;
  padding: 2px 7px;
  font-size: 12px;
}

.compare-wrap {
  overflow-x: auto;
  padding-bottom: 8px;
}

.compare-table {
  min-width: 720px;
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
  box-shadow: 4px 4px 0 var(--youc-line);
}

.compare-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 2.5px solid var(--youc-line);
}

.compare-row:last-child {
  border-bottom: 0;
}

.compare-row > div {
  border-right: 2.5px solid var(--youc-line);
  padding: 16px 18px;
  font-size: 14px;
}

.compare-row > div:last-child {
  border-right: 0;
}

.compare-head > div {
  background: var(--youc-ink);
  color: var(--youc-bg);
  font-size: 12.5px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.compare-us {
  background: var(--youc-accent-2);
  color: #04231f;
  font-weight: 850;
}

.provider-chip {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
  box-shadow: 4px 4px 0 var(--youc-line);
  padding: 12px 16px;
  color: var(--youc-ink);
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.provider-avatar {
  width: 32px;
  height: 32px;
}

.live-badge,
.soon-badge {
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.live-badge {
  background: var(--youc-accent);
  color: #ffffff;
}

.soon-badge {
  border: 2px solid var(--youc-line);
  color: var(--youc-ink);
}

.pricing-card {
  display: flex;
  flex-direction: column;
}

.pricing-card.hot {
  background: var(--youc-ink);
  color: var(--youc-bg);
  box-shadow: 8px 8px 0 var(--youc-line);
}

.pricing-tag {
  color: var(--youc-accent);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.pricing-card.hot .pricing-tag {
  color: var(--youc-accent-2);
}

.pricing-amount {
  margin: 14px 0 4px;
  font-size: 42px;
  font-weight: 850;
  letter-spacing: -0.02em;
}

.pricing-amount small {
  font-size: 14px;
  font-weight: 700;
}

.pricing-card p {
  color: inherit;
  font-size: 13px;
  opacity: 0.82;
}

.pricing-card ul {
  margin: 20px 0 26px;
  flex: 1;
  list-style: none;
  font-size: 13.5px;
}

.pricing-card li {
  display: flex;
  gap: 10px;
  border-bottom: 1px dashed color-mix(in srgb, currentColor 25%, transparent);
  padding: 7px 0;
}

.pricing-card li::before {
  content: '//';
  color: var(--youc-accent);
  font-weight: 850;
}

.pricing-card.hot li::before {
  color: var(--youc-accent-2);
}

.pricing-card .btn {
  width: 100%;
}

.faq-list {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
  box-shadow: 4px 4px 0 var(--youc-line);
}

.faq-list details {
  border-bottom: 2.5px solid var(--youc-line);
}

.faq-list details:last-child {
  border-bottom: 0;
}

.faq-list summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  list-style: none;
  padding: 20px 22px;
  font-size: 15px;
  font-weight: 850;
}

.faq-list summary::-webkit-details-marker {
  display: none;
}

.faq-list summary::after {
  content: '+';
  color: var(--youc-accent);
  font-size: 24px;
  font-weight: 850;
}

.faq-list details[open] summary::after {
  content: '-';
}

.faq-list p {
  color: var(--youc-muted);
  padding: 0 22px 22px;
  font-size: 14px;
}

.cta-band {
  border: 2.5px solid var(--youc-line);
  background: var(--youc-ink);
  color: var(--youc-bg);
  padding: 64px 40px;
  text-align: center;
}

.cta-band h2 {
  margin-bottom: 14px;
  font-size: 42px;
  font-weight: 850;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.cta-band p {
  margin-bottom: 26px;
  color: #b8b4ab;
  font-size: 15px;
}

.home-footer {
  border-top: 2.5px solid var(--youc-line);
  background: var(--youc-paper);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 30px;
  padding: 50px 0 36px;
}

.footer-col h4 {
  margin-bottom: 14px;
  color: var(--youc-accent);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.footer-col a {
  display: block;
  color: var(--youc-muted);
  padding: 5px 0;
  font-size: 13.5px;
}

.footer-col a:hover {
  color: var(--youc-ink);
  text-decoration: underline;
}

.footer-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  border-top: 2.5px solid var(--youc-line);
  padding: 18px 0;
  color: var(--youc-muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .home-container,
  .home-section {
    padding-right: 16px;
    padding-left: 16px;
  }

  .home-page h1 {
    font-size: 42px;
  }

  .terminal-container {
    width: calc(100% - 8px);
  }

  .terminal-window,
  .feature-card,
  .provider-chip,
  .step-card,
  .pricing-card,
  .compare-table,
  .faq-list {
    box-shadow: 3px 3px 0 var(--youc-line);
  }

  .hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-stats > div:nth-child(2) {
    border-right: 0;
  }

  .hero-stats > div:nth-child(-n + 2) {
    border-bottom: 2.5px solid var(--youc-line);
  }

  .terminal-body {
    font-size: 12px;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .steps-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .compare-row > div {
    padding: 14px 12px;
  }

  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 520px) {
  .hero-stats {
    grid-template-columns: 1fr;
  }

  .hero-stats > div,
  .hero-stats > div:nth-child(2) {
    border-right: 0;
  }

  .hero-stats > div:not(:last-child) {
    border-bottom: 2.5px solid var(--youc-line);
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }

  .cta-band {
    padding: 44px 20px;
  }

  .cta-band h2 {
    font-size: 32px;
  }
}
</style>
