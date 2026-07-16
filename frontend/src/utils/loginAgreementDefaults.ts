import type { LoginAgreementDocument } from '@/types'

type LocalText = (zh: string, en: string) => string

const DEFAULT_LOGIN_AGREEMENT_CONTENT: Record<string, string> = {
  terms: `# 服务条款

生效日期：2026-03-31

欢迎使用 Sub2API。本服务条款适用于你访问或使用 Sub2API 网站、控制台、API 网关、模型调用转发、计费、订阅、兑换码和相关服务。使用服务即表示你已阅读、理解并同意本条款以及相关使用政策。

## 1. 服务说明

Sub2API 提供 AI API 聚合、转发、兼容接口、账号管理、用量统计和计费等功能。Sub2API 不是任何上游模型、支付、云服务或第三方平台的官方代理、经销商、代表或合作方，除非另有明确书面说明。

服务可能依赖一个或多个上游服务商。上游服务商可能调整模型、价格、地区、速率限制、账号规则、内容政策或服务可用性。由上游变化导致的拒绝、限流、中断、延迟、错误或价格变化，不视为 Sub2API 对你的违约。

## 2. 账号和安全

你应妥善保管账号、密码、API Key、访问令牌、支付凭证和管理权限。通过你的账号或 API Key 发生的请求、费用、配置变更、违规行为和数据传输，视为由你授权或由你负责。

你不得共享、出租、出借、出售、转让账号或 API Key，不得将服务用于未授权的公开中转、匿名代理、批量注册、账号养号、绕过限制或异常流量活动。发现凭证泄露或异常使用后，应立即停用相关凭证并通知服务方。

## 3. 费用、余额和订阅

服务可能采用预付余额、订阅套餐、兑换码、按量计费、模型倍率或其他计费方式。具体价格、计费单位、有效期和限制以页面显示、订单记录或后台配置为准。

除法律强制要求或服务方明确同意外，已支付费用、已开通订阅、已发放额度、赠送额度和已消耗额度不支持退款、提现、转让或兑换现金。因你的参数错误、客户端重试、并发异常、API Key 泄露或集成错误产生的费用由你承担。

## 4. 用户内容和输出

你对通过服务提交、上传、传输、生成或处理的提示词、文件、图片、音频、视频、代码、输出和其他数据负责，并保证你拥有处理这些内容所需的权利、授权和同意。

AI 输出可能不准确、不完整、不适合特定目的，或包含事实、合规、版权、隐私和安全风险。你应自行审查、验证并承担使用输出的责任。Sub2API 不提供法律、医疗、金融、投资、税务、就业、公共安全或其他专业意见。

## 5. 暂停和终止

如你违反本条款、使用政策、地区要求、上游规则或适用法律，或你的行为可能导致安全、合规、付款、上游、服务稳定性或声誉风险，服务方可限制、暂停或终止账号、API Key、余额、订阅、订单或相关服务，并保留追偿权。

## 6. 条款变更

服务方可根据运营、合规、安全、上游、成本或产品调整需要更新本条款。更新后继续使用服务，即视为接受更新版本。`,
  'usage-policy': `# 使用政策

生效日期：2026-03-31

本使用政策适用于你使用 Sub2API 的网站、控制台、API Key、模型调用、计费、订阅、兑换码和相关服务。你必须同时遵守适用法律、本政策、服务条款、地区要求以及所有上游服务商的使用政策。

## 1. 总体要求

你不得使用服务规避法律、监管要求、上游平台规则、地区限制、身份验证、风险控制、内容安全系统、计费规则、出口管制或制裁要求。

你应确保你的账号、组织、最终用户、付款来源、业务场景和实际用途均符合适用规则。若你的使用场景需要许可、备案、用户同意、隐私合规、内容审核或行业资质，应由你自行完成。

## 2. 禁止违法和有害用途

你不得使用服务从事、协助、促进、自动化或掩盖任何违法、侵权、欺诈、滥用或规避性活动，包括但不限于诈骗、洗钱、盗刷、伪造身份、侵犯知识产权、侵犯隐私、骚扰、威胁、暴力、极端主义、未成年人伤害、恶意网络活动或其他高风险用途。

## 3. 网络安全和系统滥用

除经明确授权的防御性安全研究外，你不得使用服务生成、改进、部署或规避检测恶意软件、钓鱼工具、凭证窃取、漏洞利用、未授权扫描、持久化访问、横向移动、数据外传、绕过安全监控或攻击第三方系统的内容。

你不得对 Sub2API、上游服务商或第三方服务进行压测、爬取、接口重放、绕过速率限制、异常并发、批量注册或资源消耗攻击。

## 4. 隐私、数据和权利

你不得未经授权收集、推断、公开、出售或滥用个人信息、敏感信息、通信记录、定位信息、金融信息、健康信息、生物识别信息或未成年人信息。

你不得上传无权处理的商业秘密、未公开源代码、受保密义务约束的文件、第三方数据库、受监管数据或受出口管制的数据。

## 5. 高风险用途

除非你具备全部必要资格、人工监督、专业审核、用户同意和风险控制能力，否则不得将服务用于医疗、金融、信贷、保险、就业、教育、住房、公共福利、执法、司法、移民、军事、关键基础设施或其他影响个人重大权益的自动化决策。

## 6. 执行措施

如服务方认为你的行为违反本政策，或可能导致法律、监管、付款、上游、网络安全、服务稳定性或声誉风险，可拒绝请求、降低限额、限制模型、暂停充值、冻结余额、停用 API Key、暂停或终止账号，并在必要时保留证据或配合有权主体处理。`,
  'supported-regions': `# 支持的国家和地区

生效日期：2026-03-31

本文件说明 Sub2API 的服务可用地区、限制地区和地区合规要求。由于上游服务商、支付通道、云服务、制裁、出口管制和各地监管要求可能变化，服务方可随时更新、限制或停止任何国家或地区的服务。

## 1. 总原则

Sub2API 仅在同时满足以下条件时提供服务：你的所在地、组织所在地、账单地址、付款来源、IP 地址、设备环境、最终用户所在地和实际用途符合适用法律、上游服务商政策、支付通道规则、制裁和出口管制要求。

某个页面可访问、账号可注册、订单可创建或支付可完成，不代表该国家或地区一定受支持，也不代表你可以将服务提供给当地最终用户。

## 2. 上游服务商要求

不同通道可能依赖不同上游服务商。你必须同时满足对应上游服务商的支持国家和地区要求。上游政策严于本文件的，以更严格规则为准。

| 上游或功能 | 地区判断规则 |
| --- | --- |
| OpenAI 相关通道 | 以 OpenAI 官方 API 支持国家和地区、使用政策、服务条款和账号规则为准。 |
| Anthropic / Claude 相关通道 | 以 Anthropic 官方支持国家和地区、使用政策和服务条款为准。 |
| Google / Gemini 相关通道 | 以 Google AI Studio、Gemini API 可用地区、附加条款和禁止使用政策为准。 |
| 其他模型、支付或云服务 | 以对应服务商最新条款、地区列表、制裁、出口管制、行业限制和账号规则为准。 |

## 3. 默认不支持情形

除非服务方明确允许，以下情形不受支持：上游服务商禁止或暂停的地区；受制裁、禁运、出口管制或交易限制覆盖的地区、主体或最终用途；需要服务方取得当地许可、备案、牌照或本地化义务而尚未取得的地区；高欺诈、高拒付、高滥用、高监管风险或支付通道不稳定的地区。

## 4. 地区识别与证明

为判断地区合规，服务方可综合使用注册资料、登录 IP、调用 IP、设备信息、User-Agent、时区、语言、ASN、代理或 VPN 特征、账单地址、付款账户、支付通道、手机号码、邮箱域名、组织资料、业务网站、最终用户分布以及上游或支付机构提供的信息。

如果无法确认你符合地区要求，或合理怀疑你规避地区限制，服务方可拒绝服务、限制调用、要求补充证明、冻结余额、暂停订阅、关闭账号或拒绝退款。`,
  'service-specific-terms': `# 服务特定条款

生效日期：2026-03-31

本服务特定条款适用于 Sub2API 的 AI API 网关、模型调用转发、兼容接口、API Key、通道路由、支付、订阅、余额、兑换码、支持服务及相关功能。本文件是服务条款的组成部分。

## 1. API 网关和兼容接口

Sub2API 可提供与部分上游 API 格式兼容的接口、模型别名、请求转换、响应转换、路由、重试、限流、缓存、统计和计费功能。兼容接口仅用于便于开发者集成，不表示 Sub2API 是任何上游服务商的官方服务、官方代理、授权经销商或官方镜像。

模型名称、上下文长度、输出格式、工具调用、图片、音频、流式响应、计费单位和错误码可能与上游官方接口不同。服务方可基于可用性、成本、风控、速率、错误率、上游限制或运营需要调整路由、模型映射、倍率、上下文限制、请求参数、重试策略和输出格式。

## 2. API Key 和访问控制

你应自行管理 API Key 的创建、保存、轮换、权限、额度、有效期、IP 限制、分组和删除。API Key 仅显示一次或仅在有限场景显示时，应立即妥善保存。

通过你的 API Key 发生的请求、费用、违规、数据传输和法律后果均由你承担。你不得将 API Key 放入前端代码、公开仓库、客户端日志、可下载配置文件、截图、教程、公开文档或其他可能泄露的位置。

## 3. 计费和用量

用量统计可能基于请求数、Token、字符、图片、音频时长、模型倍率、服务层级、上游返回、预估用量、实际结算用量或页面显示的其他计费单位。由于模型转换、重试、流式中断、上游估算、缓存、错误响应和统计延迟，页面显示用量与上游账单或本地估算可能存在差异。

请求一经发送即可能产生费用，即使输出被取消、连接中断、客户端报错、内容被拒绝、结果不符合预期或上游返回错误。

## 4. 转售和第三方服务

未经服务方明确允许，你不得将服务作为公开 API 转发、模型转售、额度分发、共享订阅、付费调用、SaaS 后端、代理服务、白牌服务或其他面向不特定第三方的基础设施。

如你将服务集成到自己的产品中，应向最终用户提供不低于本使用政策和上游政策严格程度的条款，并建立身份识别、地区控制、内容安全、投诉处理、日志留存、滥用处置和数据保护机制。

## 5. 服务可用性和维护

服务方可进行维护、升级、迁移、限流、熔断、降级、备份、恢复、配置调整和安全处置。服务方不保证服务持续可用，也不保证数据永久保存。你应自行建立备份、重试、降级、熔断、费用上限、密钥轮换、异常告警和业务连续性方案。`,
}

const DEFAULT_LOGIN_AGREEMENT_CONTENT_EN: Record<string, string> = {
  terms: `# Terms of Service

Effective date: 2026-03-31

Welcome to Sub2API. These Terms of Service apply to your access to and use of the Sub2API website, console, API gateway, model forwarding, billing, subscriptions, redemption codes, and related services. By using the service, you confirm that you have read, understood, and agreed to these terms and the related usage policies.

## 1. Service Description

Sub2API provides AI API aggregation, forwarding, compatibility endpoints, account management, usage statistics, and billing features. Unless expressly stated in writing, Sub2API is not an official agent, reseller, representative, or partner of any upstream model provider, payment provider, cloud service, or third-party platform.

The service may depend on one or more upstream providers. Upstream providers may change models, pricing, supported regions, rate limits, account rules, content policies, or service availability. Refusals, throttling, outages, delays, errors, or price changes caused by upstream changes are not considered a breach by Sub2API.

## 2. Account and Security

You are responsible for protecting your account, password, API keys, access tokens, payment credentials, and administrative permissions. Requests, fees, configuration changes, violations, and data transfers made through your account or API keys are deemed authorized by you or your responsibility.

You may not share, rent, lend, sell, transfer, or expose your account or API keys. You may not use the service for unauthorized public relays, anonymous proxies, bulk registration, account farming, restriction circumvention, or abnormal traffic activity. If credentials are leaked or misused, you should disable them immediately and notify the service operator.

## 3. Fees, Balance, and Subscriptions

The service may use prepaid balances, subscription plans, redemption codes, pay-as-you-go billing, model multipliers, or other billing methods. Prices, billing units, validity periods, and limits are governed by the page display, order records, or administrative configuration.

Unless required by law or expressly agreed by the service operator, paid fees, activated subscriptions, issued credits, promotional credits, and consumed credits are not refundable, withdrawable, transferable, or redeemable for cash. Fees caused by incorrect parameters, client retries, abnormal concurrency, leaked API keys, or integration errors are your responsibility.

## 4. User Content and Outputs

You are responsible for prompts, files, images, audio, video, code, outputs, and other data that you submit, upload, transmit, generate, or process through the service. You represent that you have the rights, permissions, and consents necessary to process that content.

AI outputs may be inaccurate, incomplete, unsuitable for a particular purpose, or create factual, compliance, copyright, privacy, or security risks. You are responsible for reviewing, verifying, and using outputs. Sub2API does not provide legal, medical, financial, investment, tax, employment, public safety, or other professional advice.

## 5. Suspension and Termination

If you violate these terms, the usage policy, regional requirements, upstream rules, or applicable law, or if your conduct may create security, compliance, payment, upstream, service stability, or reputation risks, the service operator may restrict, suspend, or terminate your account, API keys, balance, subscriptions, orders, or related services.

## 6. Changes to Terms

The service operator may update these terms for operational, compliance, security, upstream, cost, or product reasons. Continued use of the service after an update means you accept the updated version.`,
  'usage-policy': `# Usage Policy

Effective date: 2026-03-31

This Usage Policy applies to your use of the Sub2API website, console, API keys, model calls, billing, subscriptions, redemption codes, and related services. You must comply with applicable law, this policy, the Terms of Service, regional requirements, and all upstream provider usage policies.

## 1. General Requirements

You may not use the service to circumvent laws, regulations, upstream platform rules, regional restrictions, identity checks, risk controls, content safety systems, billing rules, export controls, or sanctions requirements.

You must ensure that your account, organization, end users, payment source, business scenario, and actual use comply with applicable rules. If your use case requires licenses, filings, user consent, privacy compliance, content moderation, or industry qualifications, you are responsible for obtaining them.

## 2. Illegal and Harmful Uses

You may not use the service to conduct, assist, facilitate, automate, or conceal unlawful, infringing, fraudulent, abusive, or evasive activity, including scams, money laundering, payment fraud, identity forgery, intellectual property infringement, privacy violations, harassment, threats, violence, extremism, harm to minors, malicious cyber activity, or other high-risk uses.

## 3. Cybersecurity and System Abuse

Except for clearly authorized defensive security research, you may not use the service to generate, improve, deploy, or evade detection of malware, phishing tools, credential theft, exploit code, unauthorized scanning, persistent access, lateral movement, data exfiltration, security monitoring bypasses, or attacks against third-party systems.

You may not stress test, scrape, replay interfaces, bypass rate limits, create abnormal concurrency, bulk register, or conduct resource exhaustion attacks against Sub2API, upstream providers, or third-party services.

## 4. Privacy, Data, and Rights

You may not collect, infer, disclose, sell, or misuse personal information, sensitive information, communications records, location data, financial information, health information, biometric information, or information about minors without authorization.

You may not upload trade secrets, unpublished source code, confidential documents, third-party databases, regulated data, or export-controlled data unless you have the right to process them.

## 5. High-Risk Uses

Unless you have all required qualifications, human oversight, professional review, user consent, and risk controls, you may not use the service for automated decisions in medical, financial, credit, insurance, employment, education, housing, public benefits, law enforcement, judicial, immigration, military, critical infrastructure, or other contexts that materially affect individual rights.

## 6. Enforcement

If the service operator believes your conduct violates this policy or may create legal, regulatory, payment, upstream, cybersecurity, service stability, or reputation risks, it may refuse requests, reduce limits, restrict models, suspend top-ups, freeze balances, disable API keys, suspend or terminate accounts, and preserve evidence or cooperate with authorized parties when necessary.`,
  'supported-regions': `# Supported Countries and Regions

Effective date: 2026-03-31

This document describes service availability, restricted regions, and regional compliance requirements for Sub2API. Because upstream providers, payment channels, cloud services, sanctions, export controls, and local regulations may change, the service operator may update, restrict, or discontinue service in any country or region at any time.

## 1. General Principle

Sub2API provides service only when your location, organization location, billing address, payment source, IP address, device environment, end-user location, and actual use comply with applicable law, upstream provider policies, payment channel rules, sanctions, and export control requirements.

The fact that a page is accessible, an account can be registered, an order can be created, or a payment can be completed does not mean that a country or region is supported or that you may provide the service to end users there.

## 2. Upstream Provider Requirements

Different channels may depend on different upstream providers. You must also satisfy the supported-country and regional requirements of the relevant upstream provider. If an upstream policy is stricter than this document, the stricter rule applies.

| Upstream or Feature | Regional Rule |
| --- | --- |
| OpenAI-related channels | Subject to OpenAI's official API supported countries and regions, usage policies, terms, and account rules. |
| Anthropic / Claude-related channels | Subject to Anthropic's official supported countries and regions, usage policies, and terms. |
| Google / Gemini-related channels | Subject to Google AI Studio, Gemini API availability, additional terms, and prohibited use policies. |
| Other models, payments, or cloud services | Subject to the latest terms, regional lists, sanctions, export controls, industry restrictions, and account rules of the relevant provider. |

## 3. Unsupported Circumstances

Unless expressly allowed by the service operator, unsupported circumstances include regions prohibited or suspended by upstream providers; regions, persons, entities, or end uses covered by sanctions, embargoes, export controls, or transaction restrictions; regions where the service operator would need local licenses, filings, approvals, or localization obligations that have not been obtained; and regions with high fraud, chargeback, abuse, regulatory, or payment-channel risk.

## 4. Regional Identification and Proof

To evaluate regional compliance, the service operator may consider registration data, login IP, API request IP, device information, User-Agent, time zone, language, ASN, proxy or VPN indicators, billing address, payment account, payment channel, phone number, email domain, organization information, business website, end-user distribution, and information from upstream or payment institutions.

If your regional eligibility cannot be confirmed, or if the service operator reasonably suspects regional circumvention, it may refuse service, restrict calls, request additional proof, freeze balances, suspend subscriptions, close accounts, or refuse refunds.`,
  'service-specific-terms': `# Service-Specific Terms

Effective date: 2026-03-31

These Service-Specific Terms apply to the Sub2API AI API gateway, model forwarding, compatibility endpoints, API keys, channel routing, payments, subscriptions, balances, redemption codes, support services, and related features. This document forms part of the Terms of Service.

## 1. API Gateway and Compatibility Endpoints

Sub2API may provide interfaces compatible with certain upstream API formats, model aliases, request conversion, response conversion, routing, retries, rate limiting, caching, statistics, and billing. Compatibility endpoints are provided to make developer integration easier and do not mean that Sub2API is an official service, official agent, authorized reseller, or official mirror of any upstream provider.

Model names, context lengths, output formats, tool calls, images, audio, streaming responses, billing units, and error codes may differ from official upstream interfaces. The service operator may adjust routing, model mappings, multipliers, context limits, request parameters, retry policies, and output formats based on availability, cost, risk controls, rate limits, error rates, upstream restrictions, or operational needs.

## 2. API Keys and Access Control

You are responsible for creating, storing, rotating, permissioning, limiting, expiring, IP-restricting, grouping, and deleting API keys. If an API key is displayed only once or only in limited contexts, you should save it securely immediately.

Requests, fees, violations, data transfers, and legal consequences caused through your API keys are your responsibility. You may not place API keys in frontend code, public repositories, client logs, downloadable configuration files, screenshots, tutorials, public documents, or any other location where they may be exposed.

## 3. Billing and Usage

Usage may be calculated based on request count, tokens, characters, images, audio duration, model multipliers, service tiers, upstream responses, estimated usage, actual settlement usage, or other units shown on the page. Because of model conversion, retries, streaming interruptions, upstream estimation, caching, error responses, and reporting delays, displayed usage may differ from upstream bills or local estimates.

A request may incur fees once sent, even if the output is cancelled, the connection is interrupted, the client reports an error, the content is refused, the result is unsatisfactory, or the upstream provider returns an error.

## 4. Resale and Third-Party Services

Unless expressly allowed by the service operator, you may not use the service as a public API relay, model resale, quota distribution, shared subscription, paid call service, SaaS backend, proxy service, white-label service, or other infrastructure for unspecified third parties.

If you integrate the service into your own product, you should provide end users with terms at least as strict as this Usage Policy and upstream policies, and you should maintain identity checks, regional controls, content safety, complaint handling, log retention, abuse response, and data protection mechanisms.

## 5. Availability and Maintenance

The service operator may perform maintenance, upgrades, migrations, rate limiting, circuit breaking, degradation, backup, recovery, configuration changes, and security actions. The service operator does not guarantee continuous availability or permanent data retention. You should maintain your own backups, retries, degradation paths, circuit breakers, spending limits, key rotation, anomaly alerts, and business continuity plans.`,
}

const DEFAULT_LOGIN_AGREEMENT_TITLES = [
  { id: 'terms', zh: '服务条款', en: 'Terms of Service' },
  { id: 'usage-policy', zh: '使用政策', en: 'Usage Policy' },
  { id: 'supported-regions', zh: '支持的国家和地区', en: 'Supported Countries and Regions' },
  { id: 'service-specific-terms', zh: '服务特定条款', en: 'Service-Specific Terms' },
]

function normalizeDocumentId(id?: string): string {
  return String(id || '').trim().toLowerCase()
}

export function getDefaultLoginAgreementContent(id?: string, localText?: LocalText): string {
  const normalizedId = normalizeDocumentId(id)
  const zh = DEFAULT_LOGIN_AGREEMENT_CONTENT[normalizedId] || ''
  const en = DEFAULT_LOGIN_AGREEMENT_CONTENT_EN[normalizedId] || zh
  return localText ? localText(zh, en) : zh
}

export function buildDefaultLoginAgreementDocuments(localText?: LocalText): LoginAgreementDocument[] {
  const title = localText ?? ((zh: string) => zh)
  return DEFAULT_LOGIN_AGREEMENT_TITLES.map((doc) => ({
    id: doc.id,
    title: title(doc.zh, doc.en),
    content_md: getDefaultLoginAgreementContent(doc.id, localText),
  }))
}

export function hydrateLoginAgreementDocuments(
  documents: LoginAgreementDocument[],
  localText?: LocalText
): LoginAgreementDocument[] {
  if (!Array.isArray(documents) || documents.length === 0) {
    return buildDefaultLoginAgreementDocuments(localText)
  }
  return documents.map((doc) => {
    const fallbackContent = getDefaultLoginAgreementContent(doc.id, localText)
    return {
      ...doc,
      content_md: String(doc.content_md || '').trim() || fallbackContent,
    }
  })
}
