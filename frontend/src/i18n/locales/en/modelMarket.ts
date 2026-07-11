export default {
  title: "Model Market",
  description: "Current GPT, Claude and Gemini models available to you, with base prices and group-adjusted pricing",
  searchPlaceholder: "Search models, platforms, or groups...",
  empty: "No matching models",
  loadError: "Failed to load model market",
  groupCount: "{count} groups",
  noGroup: "No available group",
  stats: {
    models: "Visible Models",
    modelsHint: "Only GPT / Claude / Gemini models available to you",
    lowestRate: "Lowest Rate",
    lowestRateHint: "From your accessible groups",
    lowestInput: "Lowest Input",
    lowestInputHint: "Adjusted by the lowest rate / 1M tokens",
    groups: "Groups",
    groupsHint: "Default and user-specific rates"
  },
  filters: {
    platform: "Platform",
    allPlatforms: "All Platforms",
    claude: "Claude",
    billingMode: "Billing Mode",
    allBillingModes: "All Billing Modes",
    tier: "Model Tier",
    allTiers: "All Tiers",
    group: "Group",
    allGroups: "All Groups",
    sort: "Sort",
    tokenOnly: "Token models only"
  },
  sort: {
    newest: "Newest First",
    platformName: "Platform / Name",
    lowestInput: "Lowest Input",
    lowestOutput: "Lowest Output",
    lowestRate: "Lowest Rate"
  },
  view: {
    cards: "Cards",
    table: "Table"
  },
  billing: {
    token: "Per Token",
    image: "Image",
    perRequest: "Per Request"
  },
  table: {
    model: "Model",
    platform: "Platform",
    mode: "Mode",
    context: "Context",
    basePrice: "Base Price",
    lowestRate: "Lowest Effective Rate",
    lowestActualPrice: "Lowest Actual Price",
    groups: "Groups"
  },
  price: {
    input: "Input",
    output: "Output",
    cacheWrite: "Cache Write",
    cacheWrite1h: "Cache Write 1h",
    cacheRead: "Cache Read",
    cacheReadShort: "Cache R",
    perRequest: "Per Request",
    imageOutput: "Image Output",
    rate: "Rate"
  },
  capabilities: {
    reasoning: "Reasoning",
    vision: "Vision",
    tools: "Tool Choice",
    webSearch: "Web Search",
    promptCache: "Prompt Cache",
    code: "Code",
    pdf: "PDF",
    computerUse: "Computer Use",
    serviceTier: "Service Tier"
  },
  tiers: {
    flagship: "Flagship",
    pro: "Pro",
    mini: "Mini",
    nano: "Nano",
    opus: "Opus",
    sonnet: "Sonnet",
    haiku: "Haiku"
  },
  source: {
    fallback: "Fallback"
  },
  card: {
    lowestActual: "Lowest Actual"
  },
  actions: {
    viewDetail: "View Details",
    copyModel: "Copy Model ID",
    copied: "Model ID copied",
    copyFailed: "Copy failed"
  },
  detail: {
    description: "Description",
    descriptionText: "{family} model on {platform}. Pricing is calculated from accessible groups, using your user-specific rate first and the group default rate otherwise.",
    channels: "Channels",
    lowestRate: "Lowest Rate",
    priceUnit: "Price Unit",
    maxInput: "Max Input",
    maxOutput: "Max Output",
    basePrice: "Base Price",
    groupPricing: "Group Pricing View",
    group: "Group",
    channel: "Channel",
    defaultRate: "Default Rate",
    userRate: "User Rate",
    effectiveRate: "Effective Rate",
    finalPrice: "Final Price"
  }
}
