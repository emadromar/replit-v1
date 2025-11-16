// src/config.js

export const PLAN_DETAILS = {
  free: {
    name: 'Free',
    price: '0 JOD',
    priceMonthly: 0,
    features: [
      'Public Storefront',
      'Order Management',
      'Customer Checkout',
      '"Powered by" Badge',
    ],
    limits: {
      products: 3, // --- The "Hard Pain" 3-product limit ---
      categories: 0, // --- The "Utility Frustration" limit ---
      aiBgRemovals: 0,
    },
  },
  basic: {
    name: 'Basic',
    price: '5 JOD / month',
    priceMonthly: 5,
    features: [
      'All Free features, plus:',
      'No "Powered by" Badge',
      'Upload Your Logo',
      'Custom Theme Color',
      'Product Categories & Brands', // --- The CURE for the frustration ---
      'Sales Target Tracking',
      'AI Background Remover',
      // --- The "Converter" Psychology Tools ---
      'AI Instagram Captions',
      'Instant Social Proof (ISPE)',
      'AI Confidence Reviewer',
      '"Why this Price?" Button',
      '"Zeigarnik" Checkout Progress Bar',
    ],
    limits: {
      products: 20, // --- The "Growing Pain" 20-product limit ---
      categories: Infinity,
      aiBgRemovals: 50,
      discountCodes: 0, // --- The NEW Pro pain ---
    },
  },
  pro: {
    name: 'Pro',
    price: '15 JOD / month',
    priceMonthly: 15,
    features: [
      'All Basic features, plus:',
      'AI Product Descriptions',
      'Bulk Product Import',
      'Advanced Sales Analytics',
      'Instant WhatsApp/Telegram Alerts',
      'Custom Store Path',
      // --- The "Revenue Engine" Marketing Suite ---
      'Discount Codes & Vouchers', // --- The CURE ---
      'Influencer Marketing Tools',
      'BOGO & Free Shipping Logic',
      // --- The "Automator" & "Magical" Features ---
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