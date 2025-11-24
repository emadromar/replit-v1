// src/config.js

// --- 1. GLOBAL CURRENCY CONFIG ---
export const CURRENCY_CODE = 'JOD';

export const PLAN_DETAILS = {
  free: {
    id: 'free',
    name: 'Free',
    price: '0',
    priceLabel: 'Always Free',
    description: 'The simplest way to start your e-commerce journey.',
    badge: null,
    buttonColor: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    features: [
      'Public Storefront (Watermarked)',
      'Order Management',
      'Secure Checkout',
      'No Transaction Fees',
    ],
    limits: {
      products: 3,
      orders: 3, // per month
      aiCaptions: 3,
      aiBgRemovals: 0,
    },
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: '19',
    priceLabel: '/ month',
    description: 'Unlock core growth tools and remove limits.',
    badge: 'Most Popular',
    buttonColor: 'bg-primary-700 text-white hover:bg-primary-800',
    features: [
      'No Transaction Fees',
      'Custom Domain Support',
      '10 Product Limit',
      'AI Instagram Captions (10/mo)',
      'Social Proof Reviews',
      'Bulk Product Import',
    ],
    limits: {
      products: 10,
      orders: Infinity,
      aiCaptions: 10,
      aiBgRemovals: 10,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: '49',
    priceLabel: '/ month',
    description: 'Full AI power, automation, and advanced analytics for scaling.',
    badge: 'Recommended',
    buttonColor: 'bg-white text-primary-700 hover:bg-gray-50',
    features: [
      'Unlimited Products',
      'Unlimited AI Captions & Descriptions',
      'Neuromarketing Triggers',
      'Abandoned Cart Recovery',
      'Competitor Price Monitor',
      'Advanced Analytics',
    ],
    limits: {
      products: Infinity,
      orders: Infinity,
      aiCaptions: Infinity,
      aiBgRemovals: Infinity,
    },
  },
};

// Feature distribution for the Pricing Page comparison table
export const PRICING_FEATURES = {
  CORE: [
    {
      name: 'Product Listings',
      description: 'Active products you can sell at once.',
      free: '3', basic: '10', pro: 'Unlimited'
    },
    {
      name: 'Storefront Access',
      description: 'Your own public website for customers.',
      free: 'Watermarked', basic: 'Clean', pro: 'Clean'
    },
    {
      name: 'Transaction Fees',
      description: 'We take 0% commission on your sales.',
      free: '0%', basic: '0%', pro: '0%'
    },
    {
      name: 'Order Management',
      description: 'Dashboard to track and fulfill orders.',
      free: true, basic: true, pro: true
    },
  ],
  GROWTH_AI: [
    {
      name: 'Bulk Product Import',
      description: 'Upload multiple products via CSV.',
      free: false, basic: true, pro: true
    },
    {
      name: 'Customer Reviews',
      description: 'Collect and display social proof.',
      free: false, basic: true, pro: true
    },
    {
      name: 'AI Instagram Captions',
      description: 'Auto-generate viral social media posts.',
      free: '3 / mo', basic: '10 / mo', pro: 'Unlimited'
    },
    {
      name: 'Custom Domain',
      description: 'Connect your own .com domain.',
      free: false, basic: true, pro: true
    },
    {
      name: 'AI Product Descriptions',
      description: 'Write professional descriptions in seconds.',
      free: false, basic: false, pro: true
    },
    {
      name: 'Abandoned Cart Recovery',
      description: 'Auto-email customers who left without buying.',
      free: false, basic: false, pro: true
    },
    {
      name: 'Competitor Price Monitor',
      description: 'Track other stores\' pricing automatically.',
      free: false, basic: false, pro: true
    },
    {
      name: 'Neuromarketing Triggers',
      description: 'Psychological sales boosters (Urgency, Scarcity).',
      free: false, basic: false, pro: true
    },
    {
      name: 'Advanced Analytics',
      description: 'Deep insights into visitor behavior.',
      free: false, basic: false, pro: true
    },
  ],
};