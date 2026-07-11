export default {
    title: "帮助中心",
    catalog: "目录",
    searchPlaceholder: "搜索帮助...",
    lastUpdated: "最后更新",
    previous: "上一篇",
    next: "下一篇",
    feedbackQuestion: "这篇文档对你有帮助吗？",
    helpful: "有帮助",
    notHelpful: "没帮助",
    tip: "提示",
    note: "注意",
    recommended: "推荐",
    sections: {
      intro: "介绍",
      quickStart: "快速开始",
      platformUsage: "平台使用",
      faq: "常见问题",
      contact: "联系我们",
      tools: "配置工具",
      ccSwitch: "CC Switch",
      claudeCode: "Claude Code",
      geminiCli: "Gemini CLI",
      opencode: "OpenCode",
      openclaw: "OpenClaw",
      cherryStudio: "Cherry Studio"
    },
    articles: {
      contact: {
        title: "联系我们"
      },
      intro: {
        title: "介绍"
      },
      quickStart: {
        title: "快速开始"
      },
      modelsAndGroups: {
        title: "模型与分组"
      },
      billing: {
        title: "充值与计费",
        paramName: "参数",
        paramDesc: "说明",
        paramsList: [
          {
            name: "分组倍率",
            desc: "你的 Key 所在分组的倍率"
          },
          {
            name: "输入单价",
            desc: "模型每输入 token 的价格"
          },
          {
            name: "输出单价",
            desc: "模型每输出 token 的价格"
          }
        ]
      },
      gptImage2: {
        title: "gpt-image-2"
      },
      dashboard: {
        title: "控制台概览",
        features: "主要功能区域",
        featureName: "功能",
        featureDesc: "说明",
        featuresList: [
          {
            name: "仪表盘",
            desc: "总体用量趋势、模型分布、请求次数"
          },
          {
            name: "API Keys",
            desc: "创建和管理你的 API Key"
          },
          {
            name: "使用记录",
            desc: "每一次 API 调用的详细记录（模型、token 数、费用）"
          },
          {
            name: "钱包",
            desc: "充值、查看余额和账单"
          }
        ]
      },
      faq: {
        title: "FAQ"
      },
      ccSwitch: {
        title: "CC Switch"
      },
      claudeCode: {
        title: "Claude Code",
        autocompactPercentage: "百分比",
        autocompactTrigger: "触发时机",
        autocompactSuitable: "适合场景",
        autocompactRows: [
          {
            pct: "18",
            trigger: "约 180k tokens 触发",
            suitable: "适合频繁保持干净上下文"
          },
          {
            pct: "50",
            trigger: "约 500k tokens 触发",
            suitable: "平衡性能和上下文保留"
          },
          {
            pct: "83",
            trigger: "默认，最大化上下文利用",
            suitable: "需要尽可能保留长上下文"
          }
        ]
      },
      codex: {
        title: "Codex"
      },
      geminiCli: {
        title: "Gemini CLI"
      },
      opencode: {
        title: "OpenCode"
      },
      openclaw: {
        title: "OpenClaw"
      },
      cherryStudio: {
        title: "Cherry Studio"
      }
    }
  }
