export default {
  title: "模型市场",
  description: "当前可用的 GPT、Claude 和 Gemini 模型，包含基础价格和分组调整后的价格",
  searchPlaceholder: "搜索模型、平台或分组...",
  empty: "没有匹配的模型",
  loadError: "加载模型市场失败",
  groupCount: "{count} 个分组",
  noGroup: "无可用分组",
  stats: {
    models: "可见模型",
    modelsHint: "仅显示你可用的 GPT / Claude / Gemini 模型",
    lowestRate: "最低倍率",
    lowestRateHint: "来自你可访问的分组",
    lowestInput: "最低输入价格",
    lowestInputHint: "按最低倍率调整后的 / 1M Token",
    groups: "分组",
    groupsHint: "默认及用户专属倍率"
  },
  filters: {
    platform: "平台",
    allPlatforms: "全部平台",
    claude: "Claude",
    billingMode: "计费模式",
    allBillingModes: "全部计费模式",
    tier: "模型档位",
    allTiers: "全部档位",
    group: "分组",
    allGroups: "全部分组",
    sort: "排序",
    tokenOnly: "仅 Token 模型"
  },
  sort: {
    newest: "最新优先",
    platformName: "平台 / 名称",
    lowestInput: "最低输入价格",
    lowestOutput: "最低输出价格",
    lowestRate: "最低倍率"
  },
  view: {
    cards: "卡片",
    table: "表格"
  },
  billing: {
    token: "按 Token",
    image: "图片",
    perRequest: "按请求"
  },
  table: {
    model: "模型",
    platform: "平台",
    mode: "模式",
    context: "上下文",
    basePrice: "基础价格",
    lowestRate: "最低有效倍率",
    lowestActualPrice: "最低实际价格",
    groups: "分组"
  },
  price: {
    input: "输入",
    output: "输出",
    cacheWrite: "缓存写入",
    cacheWrite1h: "缓存写入 1h",
    cacheRead: "缓存读取",
    cacheReadShort: "缓存读",
    perRequest: "按请求",
    imageOutput: "图片输出",
    rate: "倍率"
  },
  capabilities: {
    reasoning: "推理",
    vision: "视觉",
    tools: "工具选择",
    webSearch: "联网搜索",
    promptCache: "提示缓存",
    code: "代码",
    pdf: "PDF",
    computerUse: "计算机使用",
    serviceTier: "服务档位"
  },
  tiers: {
    flagship: "旗舰",
    pro: "Pro",
    mini: "Mini",
    nano: "Nano",
    opus: "Opus",
    sonnet: "Sonnet",
    haiku: "Haiku"
  },
  source: {
    fallback: "兜底"
  },
  card: {
    lowestActual: "最低实际"
  },
  actions: {
    viewDetail: "查看详情",
    copyModel: "复制模型 ID",
    copied: "模型 ID 已复制",
    copyFailed: "复制失败"
  },
  detail: {
    description: "描述",
    descriptionText: "{family} 模型，支持 {platform}。价格根据可访问的分组计算，优先使用你的用户专属倍率，否则使用分组默认倍率。",
    channels: "渠道",
    lowestRate: "最低倍率",
    priceUnit: "价格单位",
    maxInput: "最大输入",
    maxOutput: "最大输出",
    basePrice: "基础价格",
    groupPricing: "分组定价视图",
    group: "分组",
    channel: "渠道",
    defaultRate: "默认倍率",
    userRate: "用户倍率",
    effectiveRate: "有效倍率",
    finalPrice: "最终价格"
  }
}
