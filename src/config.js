// src/config.js

// --- 1. GLOBAL CURRENCY CONFIG ---
export const CURRENCY_CODE = 'USD'; 

export const PLAN_DETAILS = {
  free: {
    name: 'Free',
    price: `0 ${CURRENCY_CODE}`,
    priceMonthly: 0,
    features: [
      'Public Storefront',
      'Order Management',
      'Customer Checkout',
      '"Powered by" Badge',
    ],
    limits: {
      products: 3,
      categories: 0,
      aiBgRemovals: 0,
    },
  },
  basic: {
    name: 'Basic',
    price: `25 ${CURRENCY_CODE} / month`, // Adjusted for SAR approx
    priceMonthly: 25,
    features: [
      'All Free features, plus:',
      'No "Powered by" Badge',
      'Upload Your Logo',
      'Custom Theme Color',
      'Product Categories & Brands',
      'Sales Target Tracking',
      'AI Background Remover',
      'AI Instagram Captions',
      'Instant Social Proof (ISPE)',
      'AI Confidence Reviewer',
      '"Why this Price?" Button',
      '"Zeigarnik" Checkout Progress Bar',
    ],
    limits: {
      products: 20,
      categories: Infinity,
      aiBgRemovals: 50,
      discountCodes: 0,
    },
  },
  pro: {
    name: 'Pro',
    price: `75 ${CURRENCY_CODE} / month`, // Adjusted for SAR approx
    priceMonthly: 75,
    features: [
      'All Basic features, plus:',
      'AI Product Descriptions',
      'Bulk Product Import',
      'Advanced Sales Analytics',
      'Instant WhatsApp/Telegram Alerts',
      'Custom Store Path',
      'Discount Codes & Vouchers',
      'Influencer Marketing Tools',
      'BOGO & Free Shipping Logic',
      'NCL: AI Psychological Bundles',
      'NCL: One-Click Upsells',
      'NCL: "The Mirror Effect"',
      'Night Mode Selling',
      'Social-Trust (WhatsApp) Communities',
      'Auto-Appreciation Notes',
    ],
    limits: {
      products: Infinity,
      categories: Infinity,
      aiBgRemovals: 200,
      discountCodes: Infinity,
    },
  },
};