export default {
    title: "Help Center",
    catalog: "Catalog",
    searchPlaceholder: "Search help...",
    lastUpdated: "Last updated",
    previous: "Previous",
    next: "Next",
    feedbackQuestion: "Was this document helpful?",
    helpful: "Helpful",
    notHelpful: "Not helpful",
    tip: "Tip",
    note: "Note",
    recommended: "Recommended",
    sections: {
      intro: "Introduction",
      quickStart: "Quick Start",
      platformUsage: "Platform Usage",
      faq: "FAQ",
      tools: "Configuration Tools",
      ccSwitch: "CC Switch",
      claudeCode: "Claude Code",
      codex: "Codex",
      geminiCli: "Gemini CLI",
      opencode: "OpenCode",
      openclaw: "OpenClaw",
      cherryStudio: "Cherry Studio"
    },
    articles: {
      intro: {
        title: "Introduction"
      },
      quickStart: {
        title: "Quick Start"
      },
      modelsAndGroups: {
        title: "Models & Groups"
      },
      billing: {
        title: "Recharge & Billing",
        paramName: "Parameter",
        paramDesc: "Description",
        paramsList: [
          {
            name: "Group Multiplier",
            desc: "The multiplier of the group your key belongs to"
          },
          {
            name: "Input Price",
            desc: "Price per input token for the model"
          },
          {
            name: "Output Price",
            desc: "Price per output token for the model"
          },
          {
            name: "Cache Read Price",
            desc: "Price per cache read token for models that support cache billing"
          },
          {
            name: "Cache Creation Price",
            desc: "Price per cache creation token for models that support cache write"
          }
        ]
      },
      gptImage2: {
        title: "gpt-image-2"
      },
      dashboard: {
        title: "Dashboard Overview",
        features: "Main Features",
        featureName: "Feature",
        featureDesc: "Description",
        featuresList: [
          {
            name: "Dashboard",
            desc: "Overall usage trends, model distribution, request counts"
          },
          {
            name: "API Keys",
            desc: "Create and manage your API keys"
          },
          {
            name: "Usage Logs",
            desc: "Detailed records of every API call (model, tokens, cost)"
          },
          {
            name: "Wallet",
            desc: "Recharge, view balance and billing history"
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
        autocompactPercentage: "Percentage",
        autocompactTrigger: "Trigger Point",
        autocompactSuitable: "Suitable For",
        autocompactRows: [
          {
            pct: "18",
            trigger: "Triggers around 180k tokens",
            suitable: "Frequently keep context clean"
          },
          {
            pct: "50",
            trigger: "Triggers around 500k tokens",
            suitable: "Balance performance and context retention"
          },
          {
            pct: "83",
            trigger: "Default, maximize context usage",
            suitable: "Need to preserve long context as much as possible"
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
