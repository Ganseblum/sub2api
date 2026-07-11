export default {
  batchImageGuide: {
    title: '图片批量生成',
    description: '一次提交多条提示词，任务完成后可统一下载图片结果'
  },
  // Home Page
  home: {
    viewOnGithub: '在 GitHub 上查看',
    viewDocs: '查看文档',
    docs: '文档',
    switchToLight: '切换到浅色模式',
    switchToDark: '切换到深色模式',
    dashboard: '控制台',
    login: '登录',
    getStarted: '立即开始',
    goToDashboard: '进入控制台',
    // 新增：面向用户的价值主张
    heroSubtitle: '一个密钥，畅用多个 AI 模型',
    heroDescription: '无需管理多个订阅账号，一站式接入 Claude、GPT、Gemini 等主流 AI 服务',
    tags: {
      subscriptionToApi: '订阅转 API',
      stickySession: '会话保持',
      realtimeBilling: '按量计费'
    },
    // 用户痛点区块
    painPoints: {
      title: '你是否也遇到这些问题？',
      items: {
        expensive: {
          title: '订阅费用高',
          desc: '每个 AI 服务都要单独订阅，每月支出越来越多'
        },
        complex: {
          title: '多账号难管理',
          desc: '不同平台的账号、密钥分散各处，管理起来很麻烦'
        },
        unstable: {
          title: '服务不稳定',
          desc: '单一账号容易触发限制，影响正常使用'
        },
        noControl: {
          title: '用量无法控制',
          desc: '不知道钱花在哪了，也无法限制团队成员的使用'
        }
      }
    },
    // 解决方案区块
    solutions: {
      title: '我们帮你解决',
      subtitle: '简单三步，开始省心使用 AI'
    },
    features: {
      unifiedGateway: '一键接入',
      unifiedGatewayDesc: '获取一个 API 密钥，即可调用所有已接入的 AI 模型，无需分别申请。',
      multiAccount: '稳定可靠',
      multiAccountDesc: '智能调度多个上游账号，自动切换和负载均衡，告别频繁报错。',
      balanceQuota: '用多少付多少',
      balanceQuotaDesc: '按实际使用量计费，支持设置配额上限，团队用量一目了然。'
    },
    // 优势对比
    comparison: {
      title: '为什么选择我们？',
      headers: {
        feature: '对比项',
        official: '官方订阅',
        us: '本平台'
      },
      items: {
        pricing: {
          feature: '付费方式',
          official: '固定月费，用不完也付',
          us: '按量付费，用多少付多少'
        },
        models: {
          feature: '模型选择',
          official: '单一服务商',
          us: '多模型随意切换'
        },
        management: {
          feature: '账号管理',
          official: '每个服务单独管理',
          us: '统一密钥，一站管理'
        },
        stability: {
          feature: '服务稳定性',
          official: '单账号易触发限制',
          us: '多账号池，自动切换'
        },
        control: {
          feature: '用量控制',
          official: '无法限制',
          us: '可设配额、查明细'
        }
      }
    },
    providers: {
      title: '已支持的 AI 模型',
      description: '一个 API，多种选择',
      supported: '已支持',
      soon: '即将推出',
      claude: 'Claude',
      gemini: 'Gemini',
      antigravity: 'Antigravity',
      more: '更多'
    },
    // CTA 区块
    cta: {
      title: '准备好开始了吗？',
      description: '注册即可获得免费试用额度，体验一站式 AI 服务',
      button: '免费注册'
    },
    // v3 Redesign additions
    nav: {
      howItWorks: '流程',
      features: '功能',
      models: '支持模型',
      pricing: '定价',
      faq: 'FAQ'
    },
    hero: {
      kicker: 'AI API 网关 · 订阅额度分发',
      title: '一个密钥，调用',
      titleHighlight: '所有模型',
      description: '不再为 Claude、GPT、Gemini 分别订阅和管理账号。YOUC 把它们统一成标准 OpenAI 格式 API，智能调度、按量计费、5 分钟接入。',
      terminal: {
        comment: '# 替换 BaseURL，统一密钥',
        routeComment: '# 路由 / 均衡 / 计费'
      },
      badge: '成本降低 90%+'
    },
    stats: {
      availability: { value: '99.9%', label: '服务可用性' },
      models: { value: '100+', label: '可用模型' },
      latency: { value: '<800ms', label: '平均延迟' }
    },
    trustStrip: {
      title: '兼容官方 SDK 与主流框架',
      items: 'OpenAI SDK,LangChain,Dify,LlamaIndex,cURL'
    },
    howItWorks: {
      label: '使用流程',
      title: '三步开始调用',
      subtitle: '无需改动现有业务代码，兼容官方 SDK，5 分钟即可接入',
      secondaryCta: '了解如何工作',
      step1: {
        title: '注册账号',
        desc: '创建 YOUC 账号，绑定你的上游订阅，或直接使用平台托管的账号池。'
      },
      step2: {
        title: '获取 API 密钥',
        desc: '在控制台一键生成 API Key，并按团队成员配置额度与使用限额。'
      },
      step3: {
        title: '替换 BaseURL',
        desc: '把请求地址指向 YOUC 网关，保留原有 SDK 调用方式，一行代码即可切换。'
      }
    },
    featuresV3: {
      label: '核心能力',
      title: '为稳定与成本优化而生',
      subtitle: '从接入到运维，覆盖 AI API 调用全流程的关键能力',
      unifiedAccess: {
        title: '统一接入',
        desc: '一把 API 密钥调用所有已接入的 AI 模型，无需为每个厂商单独申请、充值和维护。'
      },
      stableReliable: {
        title: '稳定可靠',
        desc: '智能调度多个上游账号，自动切换与负载均衡，显著降低限流、封号与请求失败。'
      },
      transparentBilling: {
        title: '透明计费',
        desc: '按实际 Token 用量精准计费，无最低消费；团队额度、成本分析一目了然。'
      },
      sessionPersistence: {
        title: '会话保持',
        desc: 'Sticky Session 让同一会话稳定命中同一上游，多轮对话上下文更连贯、结果更稳定。'
      },
      concurrency: {
        title: '并发与限流',
        desc: '按用户、按账号粒度配置并发与速率限制，保护上游、保障团队公平使用。'
      },
      adminPanel: {
        title: '管理后台',
        desc: '可视化监控用量、订单与账号健康；支持 iframe 嵌入，方便与现有系统整合。'
      }
    },
    comparisonV3: {
      label: '方案对比',
      title: '为什么选 YOUC',
      pricing: {
        feature: '付费方式',
        official: '固定月费，用不完也付',
        us: '按量付费，多用多付'
      },
      models: {
        feature: '模型选择',
        official: '单一服务商',
        us: '多厂商任意切换'
      },
      management: {
        feature: '账号管理',
        official: '各自分散管理',
        us: '统一密钥一站管理'
      },
      stability: {
        feature: '稳定性',
        official: '单账号易触发限流',
        us: '多账号调度自动容错'
      },
      visibility: {
        feature: '用量可视',
        official: '分散、难统计',
        us: '实时计量与成本分析'
      }
    },
    modelsV3: {
      label: '支持模型',
      title: '主流厂商，一站接入',
      subtitle: '已支持 OpenAI、Anthropic、Gemini 等主流厂商，更多厂商持续接入中',
      viewAll: '查看完整模型列表',
      status: {
        connected: '已接入',
        soon: '即将'
      },
      openai: {
        name: 'OpenAI'
      },
      claude: {
        name: 'Anthropic'
      },
      gemini: {
        name: 'Gemini'
      },
      more: {
        name: '更多厂商'
      }
    },
    pricing: {
      label: '定价方案',
      title: '灵活起步，按需扩展',
      free: {
        name: '免费版',
        price: '¥0',
        period: '/ 月',
        desc: '个人体验，零门槛起步',
        cta: '免费开始',
        features: {
          0: '1 个 API 密钥',
          1: '基础模型访问',
          2: '社区文档支持',
          3: '用量看板'
        }
      },
      pro: {
        name: '专业版',
        price: '按量',
        period: '付费',
        desc: '团队首选，用多少付多少',
        badge: '推荐',
        cta: '立即开通',
        features: {
          0: '无限 API 密钥',
          1: '全部模型 + 多账号调度',
          2: '会话保持 / 并发限流',
          3: '成员额度与成本分析'
        }
      },
      enterprise: {
        name: '企业版',
        price: '定制',
        period: '方案',
        desc: '私有部署与定制集成',
        cta: '联系我们',
        features: {
          0: '私有化 / 独享资源',
          1: 'SLA 与专属支持',
          2: '外部系统 iframe 集成',
          3: '审计与权限管控'
        }
      }
    },
    faqV3: {
      label: '常见问题',
      title: '有疑问？先看这里',
      q1: {
        question: 'YOUC 是什么？',
        answer: '一个 AI API 网关平台，把 AI 产品的订阅额度统一分发与管理。用户通过平台生成的 API Key 访问上游 AI 服务，平台负责鉴权、计费、负载均衡与请求转发。'
      },
      q2: {
        question: '需要改动现有代码吗？',
        answer: '几乎不需要。兼容官方 SDK，只要把请求的 BaseURL 指向网关、替换为平台密钥即可开始调用。'
      },
      q3: {
        question: '支持哪些模型厂商？',
        answer: '当前已支持 OpenAI GPT、Anthropic Claude、Google Gemini 等主流大模型，更多厂商持续接入中。'
      },
      q4: {
        question: '计费方式是怎样的？',
        answer: '按实际 Token 用量精准计费，多用多付；可为团队成员配置额度与限额，并在后台查看实时成本分析。'
      }
    },
    ctaBanner: {
      title: '准备好接入下一代 AI API 了吗？',
      description: '注册即送体验额度，5 分钟完成接入，支持 OpenAI SDK、LangChain、Dify 等主流框架。',
      primary: '免费注册',
      secondary: '查看文档'
    },
    footer: {
      copyrightSuffix: 'AI API 网关',
      tagline: 'AI API 网关平台，把 AI 订阅额度变成可分发、可计量、可管控的 API 能力。',
      product: {
        title: '产品',
        features: '功能',
        pricing: '定价',
        models: '支持模型',
        dashboard: '控制台'
      },
      resources: {
        title: '资源',
        faq: '问题'
      },
      about: {
        title: '关于',
        terms: '服务条款',
        usagePolicy: '使用政策'
      }
    }
  },

  // Key Usage Query Page
  keyUsage: {
    title: 'API Key 用量查询',
    subtitle: '输入您的 API Key 以查看实时消费金额与使用状态',
    placeholder: 'sk-ant-mirror-xxxxxxxxxxxx',
    query: '查询',
    querying: '查询中...',
    privacyNote: '您的 Key 仅在浏览器本地处理，不会被存储',
    dateRange: '统计范围:',
    dateRangeToday: '今日',
    dateRange7d: '7 天',
    dateRange30d: '30 天',
    dateRange90d: '90 天',
    dateRangeCustom: '自定义',
    apply: '应用',
    used: '已使用',
    detailInfo: '详细信息',
    tokenStats: 'Token 统计',
    dailyDetail: '按日明细',
    modelStats: '模型用量统计',
    // Table headers
    date: '日期',
    model: '模型',
    requests: '请求数',
    inputTokens: '输入 Tokens',
    outputTokens: '输出 Tokens',
    cacheCreationTokens: '缓存创建',
    cacheReadTokens: '缓存读取',
    cacheWriteTokens: '缓存写入',
    totalTokens: '总 Tokens',
    cost: '费用',
    // Status
    quotaMode: 'Key 限额模式',
    walletBalance: '钱包余额',
    // Ring card titles
    totalQuota: '总额度',
    limit5h: '5 小时限额',
    limitDaily: '日限额',
    limit7d: '7 天限额',
    limitWeekly: '周限额',
    limitMonthly: '月限额',
    // Detail rows
    remainingQuota: '剩余额度',
    expiresAt: '过期时间',
    todayExpires: '(今日到期)',
    daysLeft: '({days} 天)',
    usedQuota: '已用额度',
    resetNow: '即将重置',
    subscriptionType: '订阅类型',
    subscriptionExpires: '订阅到期',
    // Usage stat cells
    todayRequests: '今日请求',
    todayInputTokens: '今日输入',
    todayOutputTokens: '今日输出',
    todayTokens: '今日 Tokens',
    todayCacheCreation: '今日缓存创建',
    todayCacheRead: '今日缓存读取',
    todayCost: '今日费用',
    rpmTpm: 'RPM / TPM',
    totalRequests: '累计请求',
    totalInputTokens: '累计输入',
    totalOutputTokens: '累计输出',
    totalTokensLabel: '累计 Tokens',
    totalCacheCreation: '累计缓存创建',
    totalCacheRead: '累计缓存读取',
    totalCost: '累计费用',
    avgDuration: '平均耗时',
    // Messages
    enterApiKey: '请输入 API Key',
    querySuccess: '查询成功',
    queryFailed: '查询失败',
    queryFailedRetry: '查询失败，请稍后重试',
    noDailyUsage: '暂无按日用量数据',
  },

  // Setup Wizard
  setup: {
    title: 'Sub2API 安装向导',
    description: '配置您的 Sub2API 实例',
    database: {
      title: '数据库配置',
      description: '连接到您的 PostgreSQL 数据库',
      host: '主机',
      port: '端口',
      username: '用户名',
      password: '密码',
      databaseName: '数据库名称',
      sslMode: 'SSL 模式',
      passwordPlaceholder: '密码',
      ssl: {
        disable: '禁用',
        require: '要求',
        verifyCa: '验证 CA',
        verifyFull: '完全验证'
      }
    },
    redis: {
      title: 'Redis 配置',
      description: '连接到您的 Redis 服务器',
      host: '主机',
      port: '端口',
      password: '密码（可选）',
      database: '数据库',
      passwordPlaceholder: '密码',
      enableTls: '启用 TLS',
      enableTlsHint: '连接 Redis 时使用 TLS（公共 CA 证书）'
    },
    admin: {
      title: '管理员账户',
      description: '创建您的管理员账户',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      passwordPlaceholder: '至少 8 个字符',
      confirmPasswordPlaceholder: '确认密码',
      passwordMismatch: '密码不匹配'
    },
    ready: {
      title: '准备安装',
      description: '检查您的配置并完成安装',
      database: '数据库',
      redis: 'Redis',
      adminEmail: '管理员邮箱'
    },
    status: {
      testing: '测试中...',
      success: '连接成功',
      testConnection: '测试连接',
      installing: '安装中...',
      completeInstallation: '完成安装',
      completed: '安装完成！',
      redirecting: '正在跳转到登录页面...',
      restarting: '服务正在重启，请稍候...',
      timeout: '服务重启时间超出预期，请手动刷新页面。'
    }
  },

  // Common
}
