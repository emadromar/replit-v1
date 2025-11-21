// src/PricingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, X, Sparkles, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { CURRENCY_CODE } from './config.js';
// --- CONFIGURATION ---
const features = {
  CORE: [
    { name: 'Product Listings', Free: '5', Basic: '50', Pro: 'Unlimited' },
    { name: 'Storefront Access', Free: 'Yes', Basic: 'Yes', Pro: 'Yes' },
    { name: 'Order Management', Free: 'Yes', Basic: 'Yes', Pro: 'Yes' },
  ],
  SALES_GROWTH: [
    { name: 'Customer Reviews on Store', Basic: true, Pro: true },
    { name: 'AI Instagram Captions', Basic: true, Pro: true, icon: Sparkles },
    { name: 'Product Categories & Brands', Basic: true, Pro: true },
    { name: 'Sales Targets & Alerts', Basic: true, Pro: true, icon: Zap },
    { name: 'AI Product Description Generator', Pro: true, icon: Sparkles },
    { name: 'Advanced Sales Analytics', Pro: true, icon: TrendingUp },
    { name: 'AI Sales Coach', Pro: true, icon: MessageSquare },
    { name: 'Custom Store Link (e.g., /my-shop)', Pro: true },
    { name: 'Bulk Product Import (CSV)', Pro: true },
  ],
};

const plans = [
  { 
    id: 'free', 
    name: 'Free', 
    price: '0', 
    billed: 'Always Free', 
    description: 'The simplest way to start your e-commerce journey.', 
    badge: null, 
    // Gray button for Free
    buttonColor: 'bg-gray-100 text-gray-900 hover:bg-gray-200' 
  },
  { 
    id: 'basic', 
    name: 'Basic', 
    price: '5', 
    billed: 'per month', 
    description: 'Unlock core growth tools and remove limits.', 
    badge: 'Most Popular', 
    // Purple button for Basic
    buttonColor: 'bg-primary-700 text-white hover:bg-primary-800' 
  },
  { 
    id: 'pro', 
    name: 'Pro', 
    price: '15', 
    billed: 'per month', 
    description: 'Full AI power, automation, and advanced analytics for scaling.', 
    badge: 'Recommended', 
    // White button for Pro (high contrast)
    buttonColor: 'bg-white text-primary-700 hover:bg-gray-50' 
  },
];

const checkIcon = (isAvailable, planId) => {
  const isPro = planId === 'pro';
  
  if (isAvailable === true) {
    return <Check className={`w-5 h-5 ${isPro ? 'text-primary-700' : 'text-alert-success'}`} />;
  }
  if (isAvailable) {
    return <span className={`text-sm font-bold ${isPro ? 'text-primary-700' : 'text-gray-700'}`}>{isAvailable}</span>;
  }
  return <X className="w-5 h-5 text-gray-300" />;
};

const FeatureRow = ({ feature, plans }) => {
  const featureText = feature.name;
  const Icon = feature.icon || Check;

  return (
    <li className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="col-span-1 text-sm font-medium text-gray-700 flex items-center pr-4">
        <Icon className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" />
        {featureText}
      </div>
      {plans.map(plan => (
        <div key={plan.id} className="col-span-1 text-center flex items-center justify-center">
          {checkIcon(feature[plan.name], plan.id)}
        </div>
      ))}
    </li>
  );
};

export function PricingPage() {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-page text-gray-900 mb-4"
          >
            Simple, transparent pricing
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your ambition. Start free, upgrade when you're ready to scale.
          </p>
        </div>
      </header>

      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 lg:px-8">
        <div className="card overflow-visible">
          <div className="grid grid-cols-4 border-b border-gray-200">
            <div className="col-span-1"></div> 

            {plans.map(plan => (
              <div 
                key={plan.id} 
                className={`col-span-1 p-6 text-center border-l border-gray-100 relative overflow-visible flex flex-col ${plan.id === 'pro' ? 'bg-primary-700 text-white shadow-lg' : 'bg-white text-gray-900'}`}
              >
                {plan.badge && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 py-1 px-4 text-xs font-bold rounded-full bg-alert-warning text-white shadow-md uppercase whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-section font-extrabold mb-1 mt-4">{plan.name}</h3>
                <div className="text-3xl font-bold mb-1">
                  {plan.price === '0' ? 'Free' : `${CURRENCY_CODE} ${plan.price}`}
                </div>
                <p className={`text-sm ${plan.id === 'pro' ? 'text-primary-200' : 'text-gray-500'}`}>{plan.billed}</p>
                <p className={`mt-2 text-sm flex-grow ${plan.id === 'pro' ? 'text-primary-100' : 'text-gray-600'}`}>{plan.description}</p>
                
                {/* FIX: UNIFIED BUTTON STYLES */}
                <Link 
                  to="/signup" 
                  className={`mt-8 w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-sm ${plan.buttonColor}`}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2"/>
                </Link>
              </div>
            ))}
          </div>

          <div className="p-6 md:p-8 bg-gray-50">
            <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Core Essentials</h4>
            <ul className="divide-y divide-gray-200">
              {features.CORE.map((f, i) => <FeatureRow key={i} feature={f} plans={plans} />)}
            </ul>
          </div>

          <div className="p-6 md:p-8 bg-white">
            <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Growth & Automation</h4>
            <ul className="divide-y divide-gray-200">
              {features.SALES_GROWTH.map((f, i) => <FeatureRow key={i} feature={f} plans={plans} />)}
            </ul>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-section text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { question: "Is the Free plan truly free?", answer: "Yes, the Free plan is permanent and does not require a credit card. It's designed to get your store online quickly, though it includes a limit of 5 products." },
              { question: "Can I upgrade or downgrade anytime?", answer: "Absolutely. You can change your plan at any time directly from your dashboard. Upgrades are immediate, and downgrades take effect at the end of your current billing cycle." },
              { question: "How does the AI work?", answer: "Our AI (powered by Google Gemini) automatically generates engaging product descriptions, marketing captions, and sales insights based on your product's name and category. This saves you hours of writing time." },
              { question: "What counts as a 'product' limit?", answer: "A product limit refers to the number of active products you can have visible in your inventory at any given time. Deleted products do not count toward the limit." },
            ].map((item, index) => (
              <details 
                key={index} 
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 open:bg-primary-50 open:border-primary-200"
              >
                <summary className="flex items-center justify-between font-semibold text-gray-900 cursor-pointer text-base">
                  {item.question}
                  <ArrowRight className="w-5 h-5 text-gray-500 transform transition-transform duration-300 group-open:rotate-90"/>
                </summary>
                <p className="mt-4 text-gray-600 text-sm leading-relaxed border-t pt-4 border-gray-100">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}