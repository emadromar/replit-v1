import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, X, Sparkles, MessageSquare, Zap, TrendingUp, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { CURRENCY_CODE, PLAN_DETAILS, PRICING_FEATURES } from '../config.js';

// --- CONFIGURATION ---
const plans = Object.values(PLAN_DETAILS).map(plan => ({
  ...plan,
  billed: plan.priceLabel // Map config 'priceLabel' to UI 'billed'
}));

// Helper to inject icons based on feature names (since config.js is pure data)
const injectIcons = (featureList) => {
  return featureList.map(f => {
    let icon = null;
    if (f.name.includes('Instagram') || f.name.includes('AI')) icon = Sparkles;
    if (f.name.includes('Analytics') || f.name.includes('Spy')) icon = TrendingUp;
    if (f.name.includes('Coach') || f.name.includes('Neuromarketing')) icon = MessageSquare;
    if (f.name.includes('Targets') || f.name.includes('Recovery')) icon = Zap;
    return icon ? { ...f, icon } : f;
  });
};

const features = {
  CORE: PRICING_FEATURES.CORE,
  GROWTH_AI: injectIcons(PRICING_FEATURES.GROWTH_AI)
};

const checkIcon = (value, planId) => {
  const isPro = planId === 'pro';

  // Explicit boolean checks
  if (value === true) {
    return <Check className={`w-5 h-5 ${isPro ? 'text-primary-700' : 'text-alert-success'}`} />;
  }
  if (value === false) {
    return <X className="w-5 h-5 text-gray-300" />;
  }
  // String values (e.g., "5/mo", "Unlimited")
  if (value) {
    return <span className={`text-sm font-bold ${isPro ? 'text-primary-700' : 'text-gray-700'}`}>{value}</span>;
  }
  return <X className="w-5 h-5 text-gray-300" />;
};

const FeatureRow = ({ feature, plans }) => {
  const featureText = feature.name;
  const featureDesc = feature.description;
  const Icon = feature.icon || Check;

  return (
    <li className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="col-span-1 pr-4">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Icon className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" />
          {featureText}
        </div>
        {featureDesc && (
          <p className="text-xs text-gray-400 mt-1 ml-6 leading-tight">{featureDesc}</p>
        )}
      </div>
      {plans.map(plan => (
        <div key={plan.id} className="col-span-1 text-center flex items-center justify-center">
          {/* Use plan.id to access the feature value from the config object */}
          {checkIcon(feature[plan.id], plan.id)}
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

                <Link
                  to="/signup"
                  className={`mt-8 w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-sm ${plan.buttonColor}`}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
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
              {features.GROWTH_AI.map((f, i) => <FeatureRow key={i} feature={f} plans={plans} />)}
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
                  <ArrowRight className="w-5 h-5 text-gray-500 transform transition-transform duration-300 group-open:rotate-90" />
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