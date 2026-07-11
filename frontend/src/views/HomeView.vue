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
    class="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950"
  >
    <!-- Background Decorations -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-500/15 blur-3xl"
      ></div>
      <div
        class="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-primary-300/10 blur-3xl"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary-400/10 blur-3xl"
      ></div>
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"
      ></div>
    </div>

    <!-- Header -->
    <header
      class="fixed left-0 right-0 top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl dark:border-dark-800/80 dark:bg-dark-950/80"
    >
      <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2.5">
          <div
            class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
          >
            <img
              v-if="siteLogo"
              :src="siteLogo"
              alt="Logo"
              class="h-full w-full object-contain"
            />
            <Icon v-else name="bolt" size="md" class="text-white" :stroke-width="2.5" />
          </div>
          <span class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            {{ siteName }}
          </span>
        </router-link>

        <!-- Nav Links -->
        <nav class="hidden items-center gap-8 md:flex">
          <button
            v-for="link in navLinks"
            :key="link.id"
            class="nav-link text-sm font-medium text-gray-600 dark:text-dark-300"
            @click="scrollToSection(link.id)"
          >
            {{ link.label }}
          </button>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <LocaleSwitcher />

          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-white md:block"
            :title="t('home.viewDocs')"
          >
            <Icon name="book" size="md" />
          </a>

          <button
            @click="toggleTheme"
            class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-white"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          >
            <Icon v-if="isDark" name="sun" size="md" />
            <Icon v-else name="moon" size="md" />
          </button>

          <router-link
            v-if="isAuthenticated"
            :to="dashboardPath"
            class="btn btn-primary btn-sm"
          >
            {{ t('home.dashboard') }}
          </router-link>
          <template v-else>
            <router-link
              to="/login"
              class="hidden text-sm font-semibold text-gray-600 transition-colors hover:text-primary-600 dark:text-dark-300 dark:hover:text-primary-400 md:block"
            >
              {{ t('home.login') }}
            </router-link>
            <router-link to="/register" class="btn btn-primary btn-sm">
              {{ t('home.getStarted') }}
            </router-link>
          </template>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-1 pt-24">
      <!-- Hero -->
      <section class="relative overflow-hidden px-6 pb-20 pt-10">
        <div class="mx-auto max-w-7xl">
          <div class="grid items-center gap-16 lg:grid-cols-2">
            <!-- Left: Text -->
            <div class="max-w-xl">
              <div
                class="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-700 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-300"
              >
                <span class="relative flex h-2 w-2">
                  <span
                    class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex h-2 w-2 rounded-full bg-primary-500"
                  ></span>
                </span>
                {{ t('home.hero.kicker') }}
              </div>

              <h1
                class="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
              >
                {{ t('home.hero.title') }}
                <span class="text-gradient">{{ t('home.hero.titleHighlight') }}</span>
              </h1>

              <p class="mt-6 text-lg leading-relaxed text-gray-600 dark:text-dark-300">
                {{ t('home.hero.description') }}
              </p>

              <div class="mt-8 flex flex-wrap items-center gap-4">
                <router-link
                  :to="isAuthenticated ? dashboardPath : '/register'"
                  class="btn btn-primary px-7 py-3.5 text-base"
                >
                  {{ isAuthenticated ? t('home.goToDashboard') : t('home.pricing.free.cta') }}
                </router-link>
                <button
                  class="btn btn-secondary px-7 py-3.5 text-base"
                  @click="scrollToSection('how')"
                >
                  {{ t('home.howItWorks.secondaryCta') }}
                </button>
              </div>

              <div class="mt-10 flex flex-wrap items-center gap-8">
                <div v-for="stat in stats" :key="stat.labelKey">
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ stat.value }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-dark-400">
                    {{ t(stat.labelKey) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Terminal -->
            <div class="relative animate-float">
              <div class="terminal-window">
                <div class="terminal-header">
                  <div class="flex gap-1.5">
                    <div class="h-3 w-3 rounded-full bg-red-400"></div>
                    <div class="h-3 w-3 rounded-full bg-amber-400"></div>
                    <div class="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  <span class="ml-3 text-xs text-slate-400">api/v1/chat/completions</span>
                </div>
                <div class="terminal-body">
                  <div class="comment">{{ t('home.hero.terminal.comment') }}</div>
                  <div>
                    <span class="prompt">$</span> <span class="cmd">curl</span>
                    /v1/chat/completions \
                  </div>
                  <div class="pl-4">
                    <span class="cmd">-H</span>
                    <span class="str">"Authorization: Bearer sk-***"</span> \
                  </div>
                  <div class="pl-4">
                    <span class="cmd">-H</span>
                    <span class="str">"Content-Type: application/json"</span> \
                  </div>
                  <div class="pl-4"><span class="cmd">-d</span> '{</div>
                  <div class="pl-8 text-slate-300">
                    "model": "claude-3-5-sonnet",
                  </div>
                  <div class="pl-8 text-slate-300">
                    "messages": [{"role": "user", "content": "Hello"}]
                  </div>
                  <div class="pl-4">}'</div>
                  <div class="comment mt-2">{{ t('home.hero.terminal.routeComment') }}</div>
                  <div class="mt-1 rounded-lg border border-white/5 bg-white/5 p-3">
                    <div class="success">200 OK</div>
                    <div class="mt-1 text-slate-300">
                      { "choices": [...], "usage": { "total_tokens": 1240 } }
                    </div>
                    <div class="mt-1 text-xs text-slate-500">1,240 tokens · ¥0.018</div>
                  </div>
                </div>
              </div>

              <!-- Floating badge -->
              <div
                class="absolute -right-4 top-8 hidden rounded-xl border border-gray-100 bg-white p-3 shadow-lg dark:border-dark-700 dark:bg-dark-800 sm:block"
                style="animation-delay: 1s"
              >
                <div
                  class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-dark-200"
                >
                  <Icon name="trendingUp" size="md" class="text-primary-500" :stroke-width="2" />
                  {{ t('home.hero.badge') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Strip -->
      <section
        class="border-y border-gray-200 bg-gray-50/50 py-8 dark:border-dark-800 dark:bg-dark-900/50"
      >
        <div class="mx-auto max-w-7xl px-6">
          <p
            class="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-500"
          >
            {{ t('home.trustStrip.title') }}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-8">
            <div
              v-for="(item, idx) in trustItems"
              :key="item"
              class="flex items-center gap-2 text-lg font-bold text-gray-700 dark:text-dark-200"
            >
              <span :class="trustDotColors[idx]" class="h-2.5 w-2.5 rounded-full"></span>
              {{ item }}
            </div>
          </div>
        </div>
      </section>

      <!-- How it Works -->
      <section id="how" class="px-6 py-24">
        <div class="mx-auto max-w-7xl">
          <div class="mb-14 text-center">
            <div class="section-label justify-center">
              {{ t('home.howItWorks.label') }}
            </div>
            <h2
              class="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
            >
              {{ t('home.howItWorks.title') }}
            </h2>
            <p class="mx-auto mt-3 max-w-2xl text-gray-500 dark:text-dark-400">
              {{ t('home.howItWorks.subtitle') }}
            </p>
          </div>

          <div class="relative">
            <div
              class="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-dark-700 lg:block"
            ></div>
            <div class="grid gap-8 lg:grid-cols-3">
              <div
                v-for="step in howItWorksSteps"
                :key="step.number"
                class="card card-hover relative rounded-2xl p-8"
              >
                <div
                  class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-xl font-bold text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                >
                  {{ step.number }}
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ t(step.titleKey) }}
                </h3>
                <p class="mt-3 leading-relaxed text-gray-500 dark:text-dark-400">
                  {{ t(step.descKey) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section
        id="features"
        class="bg-gray-50/50 px-6 py-24 dark:bg-dark-900/50"
      >
        <div class="mx-auto max-w-7xl">
          <div class="mb-14 text-center">
            <div class="section-label justify-center">
              {{ t('home.featuresV3.label') }}
            </div>
            <h2
              class="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
            >
              {{ t('home.featuresV3.title') }}
            </h2>
            <p class="mx-auto mt-3 max-w-2xl text-gray-500 dark:text-dark-400">
              {{ t('home.featuresV3.subtitle') }}
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="feature in featureCards"
              :key="feature.titleKey"
              class="card card-hover rounded-2xl p-7"
            >
              <div
                :class="feature.iconBg"
                class="mb-4 flex h-11 w-11 items-center justify-center rounded-lg text-white"
              >
                <Icon :name="(feature.icon as any)" size="lg" :stroke-width="2" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ t(feature.titleKey) }}
              </h3>
              <p class="mt-2 text-sm leading-relaxed text-gray-500 dark:text-dark-400">
                {{ t(feature.descKey) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Comparison -->
      <section class="px-6 py-24">
        <div class="mx-auto max-w-5xl">
          <div class="mb-14 text-center">
            <div class="section-label justify-center">
              {{ t('home.comparisonV3.label') }}
            </div>
            <h2
              class="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
            >
              {{ t('home.comparisonV3.title') }}
            </h2>
          </div>

          <div
            class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card dark:border-dark-700 dark:bg-dark-800"
          >
            <div
              class="grid grid-cols-3 gap-4 border-b border-gray-100 bg-gray-50/70 p-4 text-sm font-semibold text-gray-500 dark:border-dark-800 dark:bg-dark-900/50 dark:text-dark-400"
            >
              <div>{{ t('home.comparison.headers.feature') }}</div>
              <div>{{ t('home.comparison.headers.official') }}</div>
              <div class="text-primary-600 dark:text-primary-400">
                {{ siteName }}
              </div>
            </div>
            <div
              v-for="(row, index) in comparisonRows"
              :key="row.featureKey"
              :class="index !== comparisonRows.length - 1 ? 'border-b border-gray-100 dark:border-dark-800' : ''"
              class="grid grid-cols-3 gap-4 p-4 text-sm"
            >
              <div class="font-medium text-gray-900 dark:text-white">
                {{ t(row.featureKey) }}
              </div>
              <div class="text-gray-500 dark:text-dark-400">
                {{ t(row.officialKey) }}
              </div>
              <div class="font-medium text-primary-700 dark:text-primary-400">
                {{ t(row.usKey) }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Supported Models -->
      <section
        id="models"
        class="bg-gray-50/50 px-6 py-24 dark:bg-dark-900/50"
      >
        <div class="mx-auto max-w-7xl">
          <div class="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div class="section-label">{{ t('home.modelsV3.label') }}</div>
              <h2
                class="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
              >
                {{ t('home.modelsV3.title') }}
              </h2>
              <p class="mt-3 max-w-xl text-gray-500 dark:text-dark-400">
                {{ t('home.modelsV3.subtitle') }}
              </p>
            </div>
            <a
              v-if="docUrl"
              :href="docUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {{ t('home.modelsV3.viewAll') }} →
            </a>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="model in modelCards"
              :key="model.nameKey"
              class="card card-hover flex items-center gap-4 rounded-xl p-5"
            >
              <div
                :class="model.avatarBg"
                class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg font-bold text-white"
              >
                {{ model.initial }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-bold text-gray-900 dark:text-white">
                  {{ t(model.nameKey) }}
                </div>
              </div>
              <span
                :class="model.statusClass"
                class="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold"
              >
                {{ t(model.statusKey) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing -->
      <section id="pricing" class="px-6 py-24">
        <div class="mx-auto max-w-6xl">
          <div class="mb-14 text-center">
            <div class="section-label justify-center">
              {{ t('home.pricing.label') }}
            </div>
            <h2
              class="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
            >
              {{ t('home.pricing.title') }}
            </h2>
          </div>

          <div class="grid gap-6 lg:grid-cols-3">
            <!-- Free -->
            <div class="card card-hover rounded-2xl p-8">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ t('home.pricing.free.name') }}
              </h3>
              <div class="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">
                {{ t('home.pricing.free.price') }}
                <span class="text-base font-medium text-gray-500 dark:text-dark-400">
                  {{ t('home.pricing.free.period') }}
                </span>
              </div>
              <p class="mt-2 text-sm text-gray-500 dark:text-dark-400">
                {{ t('home.pricing.free.desc') }}
              </p>
              <ul class="mt-6 space-y-3 text-sm text-gray-700 dark:text-dark-200">
                <li
                  v-for="feat in pricingFreeFeatures"
                  :key="feat"
                  class="flex items-center gap-2"
                >
                  <Icon name="check" size="sm" class="text-primary-500" :stroke-width="2" />
                  {{ t(feat) }}
                </li>
              </ul>
              <router-link
                to="/register"
                class="btn btn-secondary mt-8 w-full"
              >
                {{ t('home.pricing.free.cta') }}
              </router-link>
            </div>

            <!-- Pro -->
            <div
              class="relative card card-hover rounded-2xl border-primary-200 bg-gradient-to-b from-primary-50/50 to-white p-8 shadow-glow dark:border-primary-800 dark:from-primary-900/10 dark:to-dark-800"
            >
              <div
                class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white"
              >
                {{ t('home.pricing.pro.badge') }}
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ t('home.pricing.pro.name') }}
              </h3>
              <div class="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">
                {{ t('home.pricing.pro.price') }}
                <span class="text-base font-medium text-gray-500 dark:text-dark-400">
                  {{ t('home.pricing.pro.period') }}
                </span>
              </div>
              <p class="mt-2 text-sm text-gray-500 dark:text-dark-400">
                {{ t('home.pricing.pro.desc') }}
              </p>
              <ul class="mt-6 space-y-3 text-sm text-gray-700 dark:text-dark-200">
                <li
                  v-for="feat in pricingProFeatures"
                  :key="feat"
                  class="flex items-center gap-2"
                >
                  <Icon name="check" size="sm" class="text-primary-500" :stroke-width="2" />
                  {{ t(feat) }}
                </li>
              </ul>
              <router-link
                to="/register"
                class="btn btn-primary mt-8 w-full"
              >
                {{ t('home.pricing.pro.cta') }}
              </router-link>
            </div>

            <!-- Enterprise -->
            <div class="card card-hover rounded-2xl p-8">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ t('home.pricing.enterprise.name') }}
              </h3>
              <div class="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">
                {{ t('home.pricing.enterprise.price') }}
                <span class="text-base font-medium text-gray-500 dark:text-dark-400">
                  {{ t('home.pricing.enterprise.period') }}
                </span>
              </div>
              <p class="mt-2 text-sm text-gray-500 dark:text-dark-400">
                {{ t('home.pricing.enterprise.desc') }}
              </p>
              <ul class="mt-6 space-y-3 text-sm text-gray-700 dark:text-dark-200">
                <li
                  v-for="feat in pricingEnterpriseFeatures"
                  :key="feat"
                  class="flex items-center gap-2"
                >
                  <Icon name="check" size="sm" class="text-primary-500" :stroke-width="2" />
                  {{ t(feat) }}
                </li>
              </ul>
              <a
                v-if="docUrl"
                :href="docUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-secondary mt-8 w-full"
              >
                {{ t('home.pricing.enterprise.cta') }}
              </a>
              <router-link v-else to="/register" class="btn btn-secondary mt-8 w-full">
                {{ t('home.pricing.enterprise.cta') }}
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section
        id="faq"
        class="bg-gray-50/50 px-6 py-24 dark:bg-dark-900/50"
      >
        <div class="mx-auto max-w-3xl">
          <div class="mb-14 text-center">
            <div class="section-label justify-center">
              {{ t('home.faqV3.label') }}
            </div>
            <h2
              class="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
            >
              {{ t('home.faqV3.title') }}
            </h2>
          </div>

          <div class="space-y-4">
            <details
              v-for="(item, idx) in faqItems"
              :key="idx"
              :open="idx === 0"
              class="card rounded-xl p-5 open:border-primary-200 open:shadow-card-hover dark:open:border-primary-800"
            >
              <summary
                class="flex cursor-pointer items-center justify-between font-semibold text-gray-900 dark:text-white"
              >
                {{ t(item.questionKey) }}
                <Icon name="chevronDown" size="md" class="text-gray-400 dark:text-dark-500" />
              </summary>
              <p class="mt-3 text-sm leading-relaxed text-gray-500 dark:text-dark-400">
                {{ t(item.answerKey) }}
              </p>
            </details>
          </div>
        </div>
      </section>

      <!-- CTA Banner -->
      <section class="px-6 py-24">
        <div class="mx-auto max-w-5xl">
          <div
            class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-500 p-12 text-center text-white shadow-glow"
          >
            <div
              class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            ></div>
            <div
              class="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            ></div>
            <h2 class="relative text-3xl font-bold sm:text-4xl">
              {{ t('home.ctaBanner.title') }}
            </h2>
            <p class="relative mx-auto mt-4 max-w-xl text-primary-50">
              {{ t('home.ctaBanner.description') }}
            </p>
            <div class="relative mt-8 flex flex-wrap justify-center gap-4">
              <router-link
                to="/register"
                class="rounded-xl bg-white px-8 py-3.5 font-bold text-primary-600 shadow-lg transition hover:bg-primary-50"
              >
                {{ t('home.ctaBanner.primary') }}
              </router-link>
              <a
                v-if="docUrl"
                :href="docUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-xl border border-white/40 bg-white/10 px-8 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                {{ t('home.ctaBanner.secondary') }}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer
      class="relative z-10 border-t border-gray-200 bg-white py-14 dark:border-dark-800 dark:bg-dark-950"
    >
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid gap-10 md:grid-cols-4">
          <div class="md:col-span-1">
            <router-link to="/" class="flex items-center gap-2.5">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white"
              >
                <img
                  v-if="siteLogo"
                  :src="siteLogo"
                  alt="Logo"
                  class="h-full w-full object-contain"
                />
                <Icon v-else name="bolt" size="md" class="text-white" :stroke-width="2.5" />
              </div>
              <span class="text-lg font-bold text-gray-900 dark:text-white">
                {{ siteName }}
              </span>
            </router-link>
            <p class="mt-4 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-dark-400">
              {{ t('home.footer.tagline') }}
            </p>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 dark:text-white">
              {{ t('home.footer.product.title') }}
            </h4>
            <ul class="mt-4 space-y-2 text-sm text-gray-500 dark:text-dark-400">
              <li>
                <button
                  class="hover:text-primary-600 dark:hover:text-primary-400"
                  @click="scrollToSection('features')"
                >
                  {{ t('home.footer.product.features') }}
                </button>
              </li>
              <li>
                <button
                  class="hover:text-primary-600 dark:hover:text-primary-400"
                  @click="scrollToSection('pricing')"
                >
                  {{ t('home.footer.product.pricing') }}
                </button>
              </li>
              <li>
                <button
                  class="hover:text-primary-600 dark:hover:text-primary-400"
                  @click="scrollToSection('models')"
                >
                  {{ t('home.footer.product.models') }}
                </button>
              </li>
              <li>
                <router-link
                  :to="isAuthenticated ? dashboardPath : '/login'"
                  class="hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {{ t('home.footer.product.dashboard') }}
                </router-link>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 dark:text-white">
              {{ t('home.footer.resources.title') }}
            </h4>
            <ul class="mt-4 space-y-2 text-sm text-gray-500 dark:text-dark-400">
              <li>
                <button
                  class="hover:text-primary-600 dark:hover:text-primary-400"
                  @click="scrollToSection('faq')"
                >
                  {{ t('home.footer.resources.faq') }}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-gray-900 dark:text-white">
              {{ t('home.footer.about.title') }}
            </h4>
            <ul class="mt-4 space-y-2 text-sm text-gray-500 dark:text-dark-400">
              <li>
                <a
                  :href="githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-primary-600 dark:hover:text-primary-400"
                >
                  GitHub
                </a>
              </li>
              <li>
                <router-link
                  to="/legal/terms"
                  class="hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {{ t('home.footer.about.terms') }}
                </router-link>
              </li>
              <li>
                <router-link
                  to="/legal/usage-policy"
                  class="hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {{ t('home.footer.about.usagePolicy') }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>

        <div
          class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-sm text-gray-500 dark:border-dark-800 dark:text-dark-400 md:flex-row"
        >
          <p>&copy; {{ currentYear }} {{ siteName }} - {{ t('home.footer.copyrightSuffix') }}</p>
          <div class="flex gap-6">
            <a
              :href="githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-primary-600 dark:hover:text-primary-400"
            >
              GitHub
            </a>
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
import { sanitizeUrl } from '@/utils/url'

const { t } = useI18n()

const authStore = useAuthStore()
const appStore = useAppStore()

// Site settings - directly from appStore (already initialized from injected config)
const siteName = computed(() => normalizeBrandName(appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API'))
const siteLogo = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const docUrl = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl || ''))
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

// Current year for footer
const currentYear = computed(() => new Date().getFullYear())

// Navigation
const navLinks = computed(() => [
  { id: 'how', label: t('home.nav.howItWorks') },
  { id: 'features', label: t('home.nav.features') },
  { id: 'models', label: t('home.nav.models') },
  { id: 'pricing', label: t('home.nav.pricing') },
  { id: 'faq', label: t('home.nav.faq') }
])

function scrollToSection(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  const headerOffset = 80
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

// Stats
const stats = computed(() => [
  { value: t('home.stats.availability.value'), labelKey: 'home.stats.availability.label' },
  { value: t('home.stats.models.value'), labelKey: 'home.stats.models.label' },
  { value: t('home.stats.latency.value'), labelKey: 'home.stats.latency.label' }
])

// Trust strip
const trustItems = computed(() => t('home.trustStrip.items').split(','))
const trustDotColors = [
  'bg-emerald-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-slate-500'
]

// How it works
const howItWorksSteps = computed(() => [
  { number: '01', titleKey: 'home.howItWorks.step1.title', descKey: 'home.howItWorks.step1.desc' },
  { number: '02', titleKey: 'home.howItWorks.step2.title', descKey: 'home.howItWorks.step2.desc' },
  { number: '03', titleKey: 'home.howItWorks.step3.title', descKey: 'home.howItWorks.step3.desc' }
])

// Features
const featureCards = computed(() => [
  { icon: 'server', iconBg: 'bg-blue-600', titleKey: 'home.featuresV3.unifiedAccess.title', descKey: 'home.featuresV3.unifiedAccess.desc' },
  { icon: 'shield', iconBg: 'bg-primary-500', titleKey: 'home.featuresV3.stableReliable.title', descKey: 'home.featuresV3.stableReliable.desc' },
  { icon: 'dollar', iconBg: 'bg-pink-600', titleKey: 'home.featuresV3.transparentBilling.title', descKey: 'home.featuresV3.transparentBilling.desc' },
  { icon: 'link', iconBg: 'bg-violet-600', titleKey: 'home.featuresV3.sessionPersistence.title', descKey: 'home.featuresV3.sessionPersistence.desc' },
  { icon: 'bolt', iconBg: 'bg-amber-500', titleKey: 'home.featuresV3.concurrency.title', descKey: 'home.featuresV3.concurrency.desc' },
  { icon: 'cog', iconBg: 'bg-slate-700', titleKey: 'home.featuresV3.adminPanel.title', descKey: 'home.featuresV3.adminPanel.desc' }
])

// Comparison
const comparisonRows = computed(() => [
  { featureKey: 'home.comparisonV3.pricing.feature', officialKey: 'home.comparisonV3.pricing.official', usKey: 'home.comparisonV3.pricing.us' },
  { featureKey: 'home.comparisonV3.models.feature', officialKey: 'home.comparisonV3.models.official', usKey: 'home.comparisonV3.models.us' },
  { featureKey: 'home.comparisonV3.management.feature', officialKey: 'home.comparisonV3.management.official', usKey: 'home.comparisonV3.management.us' },
  { featureKey: 'home.comparisonV3.stability.feature', officialKey: 'home.comparisonV3.stability.official', usKey: 'home.comparisonV3.stability.us' },
  { featureKey: 'home.comparisonV3.visibility.feature', officialKey: 'home.comparisonV3.visibility.official', usKey: 'home.comparisonV3.visibility.us' }
])

// Models
const modelCards = computed(() => [
  { initial: 'O', avatarBg: 'bg-emerald-600', nameKey: 'home.modelsV3.openai.name', statusKey: 'home.modelsV3.status.connected', statusClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { initial: 'A', avatarBg: 'bg-orange-600', nameKey: 'home.modelsV3.claude.name', statusKey: 'home.modelsV3.status.connected', statusClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { initial: 'G', avatarBg: 'bg-blue-600', nameKey: 'home.modelsV3.gemini.name', statusKey: 'home.modelsV3.status.connected', statusClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { initial: '+', avatarBg: 'bg-slate-600', nameKey: 'home.modelsV3.more.name', statusKey: 'home.modelsV3.status.soon', statusClass: 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-dark-300' }
])

// Pricing features
const pricingFreeFeatures = computed(() => [
  'home.pricing.free.features.0',
  'home.pricing.free.features.1',
  'home.pricing.free.features.2',
  'home.pricing.free.features.3'
])
const pricingProFeatures = computed(() => [
  'home.pricing.pro.features.0',
  'home.pricing.pro.features.1',
  'home.pricing.pro.features.2',
  'home.pricing.pro.features.3'
])
const pricingEnterpriseFeatures = computed(() => [
  'home.pricing.enterprise.features.0',
  'home.pricing.enterprise.features.1',
  'home.pricing.enterprise.features.2',
  'home.pricing.enterprise.features.3'
])

// FAQ
const faqItems = computed(() => [
  { questionKey: 'home.faqV3.q1.question', answerKey: 'home.faqV3.q1.answer' },
  { questionKey: 'home.faqV3.q2.question', answerKey: 'home.faqV3.q2.answer' },
  { questionKey: 'home.faqV3.q3.question', answerKey: 'home.faqV3.q3.answer' },
  { questionKey: 'home.faqV3.q4.question', answerKey: 'home.faqV3.q4.answer' }
])

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
/* Navigation underline */
.nav-link {
  position: relative;
  transition: color 0.2s;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: theme('colors.primary.500');
  border-radius: 2px;
  transition: width 0.25s ease;
}
.nav-link:hover::after {
  width: 100%;
}

/* Section label */
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: theme('colors.primary.600');
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.section-label::before {
  content: '';
  width: 24px;
  height: 2px;
  background: theme('colors.primary.500');
  border-radius: 2px;
}
.section-label.justify-center::before {
  display: inline-block;
}

/* Terminal window */
.terminal-window {
  background: theme('colors.dark.900');
  border-radius: 1rem;
  overflow: hidden;
  box-shadow:
    0 25px 60px -15px rgba(15, 23, 42, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.06);
}
.terminal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.terminal-body {
  padding: 1.25rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  line-height: 1.7;
  color: theme('colors.gray.200');
}
.terminal-body .prompt {
  color: theme('colors.primary.400');
  font-weight: 600;
}
.terminal-body .cmd {
  color: theme('colors.sky.400');
}
.terminal-body .str {
  color: theme('colors.cyan.200');
}
.terminal-body .comment {
  color: theme('colors.gray.500');
}
.terminal-body .success {
  color: theme('colors.green.400');
}

/* Float animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Hide default details marker */
details > summary {
  list-style: none;
}
details > summary::-webkit-details-marker {
  display: none;
}
details[open] summary svg {
  transform: rotate(180deg);
}
details summary svg {
  transition: transform 0.2s ease;
}

/* Dark mode adjustments for terminal */
:global(.dark) .terminal-window {
  box-shadow:
    0 25px 60px -15px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(20, 184, 166, 0.15),
    0 0 40px rgba(20, 184, 166, 0.08);
}
</style>
