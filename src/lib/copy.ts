export const copy = {
  // Brand
  product: "Ask Dahlia",
  tagline: "Clause Retrieval & RAG Agent",
  company: "Dahling Consulting, LLC",
  copyright: "© Dahling Consulting, LLC · All rights reserved",

  // Auth
  loginHelper: "Invite-only. Ask Dahlia for access before sign-in.",
  secondaryCTA: "Ask Dahlia for access",

  // Legal
  caveat: "For informational purposes only — not legal advice.",

  // Homepage
  home: {
    h1: "The definitive intelligence layer for sophisticated legal operations",
    h2: "Your legal command center for AI-age contracts. Search clauses, assess risk, draft with citations — all in one cinematic workspace.",
    ctaPrimary: "Open Chat",
    ctaSecondary: "Upload documents",
    pillars: ["Authoritative", "Actionable", "Auditable"],
    badge: "Intelligent Contract Architecture & Retrieval Engine",
    subtitle: "Harness cognitive computing to orchestrate clause retrieval, risk quantification, and citation-enriched drafting within a unified command center."
  },

  // Features
  features: {
    semanticDiscovery: {
      title: "Semantic Clause Discovery",
      description: "Navigate vast document repositories with precision using contextual AI that understands legal nuance and precedent"
    },
    augmentedIntelligence: {
      title: "Augmented Intelligence Engine",
      description: "Retrieval-augmented generation delivers authoritative insights grounded in your institutional knowledge base"
    },
    riskAnalytics: {
      title: "Quantitative Risk Analytics",
      description: "Sophisticated probability matrices evaluate clause implications across multiple dimensions of exposure"
    },
    documentAssembly: {
      title: "Generative Document Assembly",
      description: "Craft bespoke agreements with integrated citations and tone calibration for any negotiation posture"
    },
    regulatoryIntel: {
      title: "Regulatory Intelligence Suite",
      description: "Continuous surveillance of evolving compliance landscapes with real-time SEC integration"
    },
    naturalLanguage: {
      title: "Natural Language Interface",
      description: "Conversational AI with sophisticated STT/TTS capabilities for seamless verbal interaction"
    }
  },

  // Quick Actions
  quickActions: {
    documentIngestion: "Document Ingestion",
    intelligenceConsole: "Intelligence Console",
    secSurveillance: "SEC Surveillance",
    executiveDashboard: "Executive Dashboard"
  },

  // Chat
  chat: {
    placeholder: "Ask me about contract clauses, risk assessment, or regulatory compliance...",
    thinking: "Dahlia is analyzing...",
    newSession: "New conversation",
    sources: "Sources",
    actions: "Actions",
    voiceRecord: "Voice input",
    voiceRead: "Read aloud",
    exportChat: "Export conversation"
  },

  // Documents
  documents: {
    title: "My Documents",
    upload: "Upload documents",
    processing: "Processing documents...",
    types: {
      draft: "Draft",
      analysis: "Analysis",
      email: "Email",
      export: "Export"
    }
  },

  // Email Draft
  email: {
    title: "Draft Email",
    tone: {
      formal: "Formal",
      neutral: "Neutral",
      warm: "Warm",
      persuasive: "Persuasive"
    },
    recipients: "Recipients",
    subject: "Subject",
    preview: "Preview",
    export: "Export",
    save: "Save to Documents"
  },

  // SEC
  sec: {
    title: "SEC EDGAR Search",
    searchPlaceholder: "Enter ticker symbol or CIK...",
    formTypes: ["10-K", "10-Q", "8-K", "DEF 14A", "S-1"],
    addToCorpus: "Add to corpus",
    viewFiling: "View filing"
  },

  // Risk Assessment
  risk: {
    title: "Risk Assessment Matrix",
    probability: "Probability",
    impact: "Impact",
    levels: {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical"
    },
    recommendedClauses: "Recommended Clauses",
    negotiationPosture: {
      primary: "Primary",
      secondary: "Secondary",
      fallback: "Fallback"
    }
  },

  // Admin
  admin: {
    usage: {
      title: "Usage Analytics",
      totalTokens: "Total Tokens",
      totalCost: "Total Cost",
      activeUsers: "Active Users",
      dailyAverage: "Daily Average"
    },
    approvals: {
      title: "Access Requests",
      approve: "Approve",
      deny: "Deny",
      pending: "Pending",
      approved: "Approved",
      denied: "Denied"
    }
  },

  // Settings
  settings: {
    appearance: "Appearance",
    providers: "Providers & Keys",
    quotas: "Usage Quotas",
    privacy: "Privacy & Security",
    heroVariant: "Background Theme",
    overlayIntensity: "Overlay Intensity",
    bloomStrength: "Bloom Strength",
    motionEnabled: "Motion Effects"
  },

  // Errors
  errors: {
    quotaExceeded: "You've reached your daily usage limit. Your access will reset at",
    requestMoreAccess: "Request more access",
    sessionExpired: "Session expired. Please sign in again.",
    networkError: "Network error. Please check your connection.",
    processingError: "Error processing request. Please try again.",
    insufficientInfo: "Insufficient information to provide a complete answer."
  },

  // Success messages
  success: {
    documentUploaded: "Document uploaded successfully",
    documentSaved: "Document saved to library",
    emailDrafted: "Email draft created",
    exported: "Exported successfully",
    settingsSaved: "Settings saved",
    accessRequested: "Access request submitted"
  }
} as const;

export type Copy = typeof copy;
