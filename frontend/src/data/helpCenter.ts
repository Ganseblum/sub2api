import type { HelpSection } from "@/views/user/HelpCenterView.vue"

const BASE_URL = "https://ai.youc.online"
const API_V1 = `${BASE_URL}/v1`

const ccSwitchMd = `
CC Switch 提供图形化界面，可以一键配置和切换 Claude Code、Codex、Gemini CLI、OpenCode、OpenClaw 的 API 连接。

## 打开 CC Switch

访问 [ccswitch.lovable.app ↗](https://ccswitch.lovable.app) 即可使用。顶部标签栏可以切换不同的工具。

## 添加 YOUC 配置

1. 点击右上角「+」添加新配置
2. 填写供应商信息：

| 字段 | 填写内容 |
|------|---------|
| 供应商名称 | 自定义，如 \`youc_claude\` |
| API Key | 你的 Key（在控制台 API Keys 页面获取） |
| 请求地址 | \`${BASE_URL}\` |

3. 点击「保存」

## 配置模型映射

向下滚动可以配置模型映射，将 Claude Code 的模型别名映射到你想用的模型：

| 字段 | 说明 |
|------|------|
| 主模型 | 工具默认使用的模型 |
| 推理模型 (Thinking) | 用于深度推理的模型 |
| Haiku 默认模型 | \`/model haiku\` 时使用的模型 |
| Sonnet 默认模型 | \`/model sonnet\` 时使用的模型 |
| Opus 默认模型 | \`/model opus\` 时使用的模型 |

勾选「写入通用配置」可以将配置应用到所有工具。

## 切换 Provider

在主界面中，选中你要使用的配置即可切换。支持自动故障转移 —— 当一个 Provider 不可用时自动切换到下一个。

## 从控制台导入

在控制台 API Keys 页面，点击「复制连接信息」，直接粘贴到 CC Switch 中即可完成配置。

## 支持的工具

| 工具 | 支持 |
|------|------|
| Claude Code | 支持 |
| Codex | 支持 |
| Gemini CLI | 支持 |
| OpenCode | 支持 |
| OpenClaw | 支持 |
| Cherry Studio | 不支持 CC Switch，请查看 Cherry Studio 配置页面手动配置 |

官方网站：[ccswitch.lovable.app](https://ccswitch.lovable.app) · GitHub：[github.com/farion1231/cc-switch](https://github.com/farion1231/cc-switch)
`

const claudeCodeMd = `
Claude Code 是 Anthropic 出品的 AI 编码代理，可以在终端中读取代码、编辑文件、运行命令。

## 安装

\`\`\`bash
curl -fsSL https://claude.ai/install.sh | bash
\`\`\`

## 使用 CC Switch 配置（推荐）

打开 CC Switch，选择顶部 Claude 标签，点击「+」添加配置：

| 字段 | 填写内容 |
|------|---------|
| 供应商名称 | 自定义，如 \`youc_claude\` |
| API Key | 你的 Key |
| 请求地址 | \`${BASE_URL}\`（注意不带 /v1） |

## 切换模型

除了 Claude 原生模型，YOUC 还接入了 GPT、Kimi、DeepSeek 等第三方模型。在 CC Switch 打开「编辑供应商 → 模型映射」，把 Claude 的别名指向你想用的模型，保存即可生效，无需改 JSON。

| 字段 | 作用 |
|------|------|
| 主模型 | Claude Code 默认调用的模型 |
| 推理模型 (Thinking) | 开启深度思考 / Reasoning 时使用的模型 |
| Haiku 默认模型 | \`haiku\` 别名对应的目标模型 |
| Sonnet 默认模型 | \`sonnet\` 别名对应的目标模型 |
| Opus 默认模型 | \`opus\` 别名对应的目标模型 |

如果供应商原生就是 Claude 模型，这几项可留空 —— 仅在需要把别名指向其他模型时填写。

## 关闭归属 Header

Claude Code 默认在每次请求里注入动态的归属 header（包含会话 ID 等），会彻底击穿上游 prompt cache —— 缓存命中率暴跌、费用上涨、响应变慢。不论用 Claude 官方模型还是第三方模型，都建议关闭。

在 CC Switch「编辑供应商 → 配置 JSON」的 \`env\` 里加一行：

\`\`\`json
"CLAUDE_CODE_ATTRIBUTION_HEADER": "0"
\`\`\`

## 手动配置

编辑 \`~/.claude/settings.json\`：

\`\`\`json
{
  "env": {
    "ANTHROPIC_BASE_URL": "${BASE_URL}",
    "ANTHROPIC_AUTH_TOKEN": "sk-你的KEY",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0"
  }
}
\`\`\`

或通过环境变量：

\`\`\`bash
export ANTHROPIC_BASE_URL="${BASE_URL}"
export ANTHROPIC_AUTH_TOKEN="sk-你的KEY"
export CLAUDE_CODE_ATTRIBUTION_HEADER=0
\`\`\`

## 配置上下文压缩

Claude Code 默认在上下文窗口使用约 83% 时自动压缩。如果你使用 1M 上下文窗口，可以通过 \`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE\` 调整压缩触发时机。例如希望在 180k tokens 时触发（180k / 1000k = 18%），在 \`~/.claude/settings.json\` 的 \`env\` 中添加：

\`\`\`json
{
  "env": {
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "18"
  }
}
\`\`\`

| 值 | 1M 窗口下触发时机 | 适合场景 |
|----|-----------------|---------|
| 18 | ~180k tokens | 频繁保持干净上下文 |
| 50 | ~500k tokens | 平衡性能和上下文保留 |
| 83 | ~830k tokens（默认） | 最大化上下文利用 |

只能将阈值设置为低于 83% 的值。设置高于 83% 的值会被静默忽略。

官方文档：[code.claude.com/docs](https://code.claude.com/docs)
`

const codexMd = `
Codex 是 OpenAI 出品的 AI 编码代理，在终端中运行。

## 安装

\`\`\`bash
npm install -g @openai/codex
\`\`\`

## 使用 CC Switch 配置（推荐）

打开 CC Switch，选择顶部 Codex 标签，点击「+」添加配置：

| 字段 | 填写内容 |
|------|---------|
| 供应商名称 | 自定义，如 \`youc_codex\` |
| API Key | 你的 Key |
| 请求地址 | \`${API_V1}\` |

## 手动配置

编辑 \`~/.codex/config.toml\`：

\`\`\`toml
model = "claude-sonnet-4-20250514"
model_provider = "youc"

[model_providers.youc]
name = "YOUC"
base_url = "${API_V1}"
env_key = "YOUC_API_KEY"
wire_api = "responses"
\`\`\`

设置环境变量：

\`\`\`bash
export YOUC_API_KEY=sk-你的KEY
\`\`\`

## 切换模型

修改 \`config.toml\` 中的 \`model\` 字段，或启动时指定：

\`\`\`bash
codex --model gpt-4o
\`\`\`

也可以在 CC Switch 中切换模型。

官方文档：[developers.openai.com/codex](https://developers.openai.com/codex)
`

const geminiCliMd = `
Gemini CLI 是 Google 出品的开源 AI 编码代理，在终端中运行。

## 安装

\`\`\`bash
npm install -g @google/gemini-cli
# 或通过 Homebrew
brew install gemini-cli
\`\`\`

## 使用 CC Switch 配置（推荐）

打开 CC Switch，选择顶部 Gemini 标签，点击「+」添加配置：

| 字段 | 填写内容 |
|------|---------|
| 供应商名称 | 自定义，如 \`youc_gemini\` |
| API Key | 你的 Key |
| 请求地址 | \`${BASE_URL}\`（注意不带 /v1） |

## 手动配置

设置环境变量：

\`\`\`bash
export GOOGLE_GEMINI_BASE_URL=${BASE_URL}
export GEMINI_API_KEY=sk-你的KEY
\`\`\`

建议写入 \`~/.zshrc\` 或 \`~/.bashrc\`：

\`\`\`bash
echo 'export GOOGLE_GEMINI_BASE_URL=${BASE_URL}' >> ~/.zshrc
echo 'export GEMINI_API_KEY=sk-你的KEY' >> ~/.zshrc
\`\`\`

## 切换模型

\`\`\`bash
gemini --model pro
gemini --model flash
\`\`\`

或在会话中使用 \`/model\` 命令切换。也可以在 CC Switch 中切换。

官方文档：[github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
`

const opencodeMd = `
OpenCode 是一个开源的 AI 编码代理，支持 75+ 模型提供商。

## 安装

\`\`\`bash
curl -fsSL https://opencode.ai/install | bash
# 或
npm install -g opencode-ai@latest
# 或
brew install anomalyco/tap/opencode
\`\`\`

## 使用 CC Switch 配置（推荐）

打开 CC Switch，选择顶部 OpenCode 标签，点击「+」添加配置：

| 字段 | 填写内容 |
|------|---------|
| 供应商名称 | \`youc_opencode\` |
| API Key | 你的 Key |
| 请求地址 | \`${API_V1}\` |

还可以配置模型映射，选择不同的模型。

## 手动配置

创建 \`opencode.json\`：

\`\`\`jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "claude-sonnet-4-20250514",
  "provider": {
    "youc": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "YOUC",
      "options": {
        "baseURL": "${API_V1}",
        "apiKey": "{env:YOUC_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000 }
        },
        "gpt-4o": {
          "name": "GPT-4o",
          "limit": { "context": 128000 }
        }
      }
    }
  }
}
\`\`\`

设置环境变量：

\`\`\`bash
export YOUC_API_KEY=sk-你的KEY
\`\`\`

## 切换模型

修改 \`opencode.json\` 中的 \`model\` 字段切换模型。在配置文件的 \`models\` 中添加你需要的模型即可使用，也可以在 CC Switch 中切换。

官方网站：[opencode.ai](https://opencode.ai)
`

const openclawMd = `
OpenClaw 是一个开源个人 AI 助手，支持 WhatsApp、Telegram、Slack、Discord 等 24+ 消息平台。

## 安装

OpenClaw 的全局安装链路仍可能不稳定，建议先以官方文档为准确认最新安装方式。若官方仍推荐 npm 全局安装，再执行：

\`\`\`bash
npm install -g openclaw@latest
\`\`\`

## 使用 CC Switch 配置（推荐）

打开 CC Switch，选择顶部 OpenClaw 标签，点击「+」添加配置：

| 字段 | 填写内容 |
|------|---------|
| 供应商名称 | \`youc_openclaw\` |
| API Key | 你的 Key |
| 请求地址 | \`${API_V1}\` |

## 手动配置

在 OpenClaw 配置中添加 YOUC：

\`\`\`json5
{
  "models": {
    "providers": {
      "youc": {
        "baseUrl": "${API_V1}",
        "apiKey": "sk-你的KEY",
        "api": "openai",
        "models": [
          { "id": "claude-sonnet-4-20250514", "contextWindow": 200000 },
          { "id": "gpt-4o", "contextWindow": 128000 }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": { "primary": "youc/claude-sonnet-4-20250514" }
    }
  }
}
\`\`\`

## 切换模型

修改配置中的 \`model.primary\` 字段，或在 CC Switch 中切换。

官方文档：[docs.openclaw.ai](https://docs.openclaw.ai)
`

const cherryStudioMd = `
Cherry Studio 是一个开源的跨平台桌面 AI 聊天客户端，支持 Windows、macOS 和 Linux。

## 安装

前往 [cherry-ai.com](https://cherry-ai.com) 下载对应平台的安装包，或从 [GitHub Releases](https://github.com/CherryHQ/cherry-studio/releases) 下载。

## 配置 YOUC

1. 打开 Cherry Studio，点击左下角「设置」
2. 进入「模型提供商」页面
3. 点击「添加自定义提供商」

填写以下信息：

| 字段 | 填写内容 |
|------|---------|
| 提供商名称 | \`youc\` |
| API Key | \`sk-你的KEY\` |
| API 地址 | \`${BASE_URL}/\` |

4. 添加你需要的模型名称，例如 \`claude-sonnet-4-20250514\`、\`gpt-4o\`
5. 保存后，在聊天界面的模型下拉框中选择即可

官方网站：[cherry-ai.com](https://cherry-ai.com)
`

export function buildCatalog(
	t: (key: string) => string,
	tm: (
		key: string,
	) => { name: string; desc: string }[] | { pct: string; trigger: string; suitable: string }[] | unknown,
): HelpSection[] {
	const dashboardFeatures = tm("helpCenter.articles.dashboard.featuresList") as { name: string; desc: string }[]
	const dashboardFeaturesTable = [
		`## ${t("helpCenter.articles.dashboard.features")}`,
		"",
		"| 功能 | 说明 |",
		"|------|------|",
		...dashboardFeatures.map((f) => `| **${f.name}** | ${f.desc} |`),
		"",
	].join("\n")

	const billingParams = tm("helpCenter.articles.billing.paramsList") as { name: string; desc: string }[]
	const billingParamsTable = [
		`## ${t("helpCenter.articles.billing.parameters")}`,
		"",
		`| ${t("helpCenter.articles.billing.paramName")} | ${t("helpCenter.articles.billing.paramDesc")} |`,
		"|------|------|",
		...billingParams.map((p) => `| **${p.name}** | ${p.desc} |`),
		"",
	].join("\n")

	const autocompactRows = tm("helpCenter.articles.claudeCode.autocompactRows") as {
		pct: string
		trigger: string
		suitable: string
	}[]
	const autocompactTable = [
		`| ${t("helpCenter.articles.claudeCode.autocompactPercentage")} | ${t("helpCenter.articles.claudeCode.autocompactTrigger")} | ${t("helpCenter.articles.claudeCode.autocompactSuitable")} |`,
		"|------|------|------|",
		...autocompactRows.map((r) => `| \`${r.pct}\` | ${r.trigger} | ${r.suitable} |`),
		"",
	].join("\n")

	void autocompactTable

	return [
		{
			key: "intro",
			title: t("helpCenter.sections.intro"),
			items: [
				{
					id: "intro",
					title: t("helpCenter.articles.intro.title"),
					sectionKey: "intro",
					sectionTitle: t("helpCenter.sections.intro"),
					updatedAt: "2026-07-06",
					contentMd: `
YOUC（\`${BASE_URL}\`）是一个统一的 AI 模型 API 中转平台。一个 API Key，统一接口，访问 Claude、GPT、Gemini 等主流大模型。

## 主要功能区域

${dashboardFeaturesTable}

## 控制台右侧快捷入口

- **售后群组** — 联系售后支持
- **使用教程** — 查看本文档
- **监控站点** — 实时查看各渠道状态

## 模型与定价

在定价页面可以按供应商筛选模型，查看每个模型的输入/输出价格，以及按分组查看可用倍率。左侧可以按供应商（Anthropic、Google、OpenAI 等）和分组筛选，右侧展示每个模型的具体价格。

## 创建 API Key

创建 API Key 时，按要调用的模型选择分组：日常 OpenAI 模型选低倍率分组，GPT Pro / Codex 相关模型选对应分组，Claude 模型选 Claude 对应分组。详见「模型与分组」。

## 服务监控

通过状态监控页面，实时查看各渠道的运行状况和可用性。

## API 信息

| 项目 | 值 |
|------|-----|
| API 地址 | \`${API_V1}\` |
| 认证方式 | \`Authorization: Bearer sk-你的KEY\` |
| 兼容格式 | OpenAI Chat Completions / Responses API |

## 下一步

- [快速开始](#quickstart) — 注册账号，获取 API Key
- [模型与分组](#models-and-groups) — 选择分组，了解定价
- [CC Switch](#cc-switch) — 一键配置所有 AI 工具
- [充值与计费](#billing) — 计费方式与充值
          `,
				},
			],
		},
		{
			key: "quickStart",
			title: t("helpCenter.sections.quickStart"),
			items: [
				{
					id: "quickstart",
					title: t("helpCenter.articles.quickStart.title"),
					sectionKey: "quickStart",
					sectionTitle: t("helpCenter.sections.quickStart"),
					updatedAt: "2026-07-06",
					contentMd: `
注册账号、获取 API Key，5 分钟上手。

## 第 1 步：注册账号

前往首页注册你的账号并登录。

## 第 2 步：创建 API Key

1. 进入控制台，点击「API Keys」页面
2. 点击「创建 Key」
3. 填写 Key 名称
4. 选择分组（决定价格倍率，详见「模型与分组」）
5. 点击「创建」，复制生成的 API Key

> 💡 **提示**：每个 Key 有自己的使用上限，即使账户余额充足，Key 额度用完了也会报错。需要时在控制台编辑 Key，增加额度或开启无限额度。

## 第 3 步：选择你的工具

根据你使用的工具，查看对应的配置指南：

**编码代理**

- [Claude Code](#claude-code) — Anthropic 的 AI 编码代理
- [Codex](#codex) — OpenAI 的 AI 编码代理
- [Gemini CLI](#gemini-cli) — Google 的 AI 编码代理
- [OpenCode](#opencode) — 开源 AI 编码代理
- [OpenClaw](#openclaw) — 开源个人 AI 助手

**聊天客户端**

- [Cherry Studio](#cherry-studio) — 跨平台桌面 AI 聊天客户端
          `,
				},
			],
		},
		{
			key: "platformUsage",
			title: t("helpCenter.sections.platformUsage"),
			items: [
				{
					id: "models-and-groups",
					title: t("helpCenter.articles.modelsAndGroups.title"),
					sectionKey: "platformUsage",
					sectionTitle: t("helpCenter.sections.platformUsage"),
					updatedAt: "2026-07-06",
					contentMd: `
了解 YOUC 的模型分组和定价倍率。

## 什么是分组

YOUC 通过分组来组织不同的模型渠道。每个分组对应不同的上游 API 来源，价格倍率也不同。创建 API Key 时，你需要选择一个分组。分组决定了你调用 API 时的价格和可用渠道。

## 怎么选分组

- **使用 Claude 模型**：选 Claude 对应分组，支持 Claude Haiku、Opus、Sonnet、Fable 系列模型。
- **使用 GPT**：选对应分组，支持 GPT 相关模型。

## 倍率是什么意思

倍率是在模型官方定价基础上的价格系数。倍率越低，越便宜。

**实际费用 = 模型官方价格 × 分组倍率**

举个例子，假设某模型官方价格为 10 元 / M tokens：

| 分组 | 倍率 | 实际费用 |
|------|------|---------|
| GPT 分组 | 0.2x | 2 元 |
| Claude 分组 A | 0.3x | 3 元 |
| Claude 分组 B | 0.6x | 6 元 |

同一个分组内，不同模型的官方价格不同，所以最终费用也不同。详见「充值与计费」。

## 如何切换分组

分组是绑定在 Key 上的。要切换分组，创建一个新 Key 并选择不同的分组即可。
          `,
				},
				{
					id: "billing",
					title: t("helpCenter.articles.billing.title"),
					sectionKey: "platformUsage",
					sectionTitle: t("helpCenter.sections.platformUsage"),
					updatedAt: "2026-07-06",
					contentMd: `
了解 YOUC 的计费方式和充值方法。

## 计费方式

YOUC 按实际 token 用量计费，费用计算公式：

\`\`\`
费用 = 分组倍率 × (输入 tokens × 输入单价 + 输出 tokens × 输出单价 + 缓存读取 tokens × 缓存读取单价 + 缓存创建 tokens × 缓存创建单价)
\`\`\`

- **分组倍率**：你的 Key 所在分组的倍率（见「模型与分组」）
- **输入单价**：模型每输入 token 的价格
- **输出单价**：模型每输出 token 的价格
- **缓存读取单价**：支持缓存计费的模型按缓存命中读取计费
- **缓存创建单价**：支持缓存写入的模型按缓存创建计费

在定价页面可以查看具体的模型价格。

${billingParamsTable}

## 充值

在控制台的「钱包」页面充值：

1. 登录后进入「钱包」页面
2. 输入充值金额
3. 选择支付方式完成充值

也可以通过兑换码充值 —— 在钱包页面输入兑换码即可到账。

## 查看用量

在控制台可以查看：

- **仪表盘**：总体用量趋势、模型分布、请求次数
- **使用记录**：每一次 API 调用的详细记录（模型、token 数、费用）
          `,
				},
			],
		},
		{
			key: "tools",
			title: t("helpCenter.sections.tools"),
			items: [
				{
					id: "cc-switch",
					title: t("helpCenter.articles.ccSwitch.title"),
					sectionKey: "tools",
					sectionTitle: t("helpCenter.sections.tools"),
					recommended: true,
					updatedAt: "2026-07-06",
					contentMd: ccSwitchMd,
				},
				{
					id: "claude-code",
					title: t("helpCenter.articles.claudeCode.title"),
					sectionKey: "tools",
					sectionTitle: t("helpCenter.sections.tools"),
					updatedAt: "2026-07-06",
					contentMd: claudeCodeMd,
				},
				{
					id: "codex",
					title: t("helpCenter.articles.codex.title"),
					sectionKey: "tools",
					sectionTitle: t("helpCenter.sections.tools"),
					updatedAt: "2026-07-06",
					contentMd: codexMd,
				},
				{
					id: "gemini-cli",
					title: t("helpCenter.articles.geminiCli.title"),
					sectionKey: "tools",
					sectionTitle: t("helpCenter.sections.tools"),
					updatedAt: "2026-07-06",
					contentMd: geminiCliMd,
				},
				{
					id: "opencode",
					title: t("helpCenter.articles.opencode.title"),
					sectionKey: "tools",
					sectionTitle: t("helpCenter.sections.tools"),
					updatedAt: "2026-07-06",
					contentMd: opencodeMd,
				},
				{
					id: "openclaw",
					title: t("helpCenter.articles.openclaw.title"),
					sectionKey: "tools",
					sectionTitle: t("helpCenter.sections.tools"),
					updatedAt: "2026-07-06",
					contentMd: openclawMd,
				},
				{
					id: "cherry-studio",
					title: t("helpCenter.articles.cherryStudio.title"),
					sectionKey: "tools",
					sectionTitle: t("helpCenter.sections.tools"),
					updatedAt: "2026-07-06",
					contentMd: cherryStudioMd,
				},
			],
		},
	]
}
