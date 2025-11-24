// src/pages/MarketingPage.jsx

import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Percent, Instagram, Mail, Megaphone, Zap, Sparkles, ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import { DiscountCodesManager } from '../components/dashboard/marketing/DiscountCodesManager.jsx';
import { AiCaptionGenerator } from '../components/dashboard/marketing/AiCaptionGenerator.jsx';
import { ProductAnalyzerSection } from '../components/dashboard/marketing/ProductAnalyzerSection.jsx';
import { AbandonedCartRecovery } from '../components/dashboard/marketing/AbandonedCartRecovery.jsx';

export function MarketingPage() {
  const [showBannerDetails, setShowBannerDetails] = useState(false);

  const tools = [
    {
      name: 'Product Analyzer',
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      component: <ProductAnalyzerSection />
    },
    { name: 'Discount Codes', icon: Percent, color: 'text-green-500', bgColor: 'bg-green-50', component: <DiscountCodesManager /> },
    { name: 'Social AI', icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-50', component: <AiCaptionGenerator /> },
    { name: 'Cart Recovery', icon: Mail, color: 'text-blue-500', bgColor: 'bg-blue-50', component: <AbandonedCartRecovery /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Banner */}
      <button
        onClick={() => setShowBannerDetails(!showBannerDetails)}
        className="w-full text-left relative mb-10 p-8 md:p-10 rounded-3xl bg-gradient-to-r from-[#6020A0] via-[#7B2CBF] to-[#9D4EDD] text-white overflow-hidden shadow-2xl shadow-purple-200 transition-transform active:scale-[0.99] focus:outline-none group"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 opacity-10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight flex items-center gap-3">
                Marketing Hub
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-purple-100 text-lg max-w-2xl leading-relaxed font-medium">
                Your all-in-one command center for growth. Click to learn more.
              </p>
            </div>
            <div className={`p-2 rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-300 ${showBannerDetails ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-6 h-6 text-white" />
            </div>
          </div>

          <AnimatePresence>
            {showBannerDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-50">
                  <li className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="p-2 bg-white/20 rounded-lg"><Zap className="w-5 h-5 text-yellow-300" /></div>
                    <span className="font-medium">Fix Sales Leaks</span>
                  </li>
                  <li className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="p-2 bg-white/20 rounded-lg"><Percent className="w-5 h-5 text-green-300" /></div>
                    <span className="font-medium">Run Flash Sales</span>
                  </li>
                  <li className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="p-2 bg-white/20 rounded-lg"><Instagram className="w-5 h-5 text-pink-300" /></div>
                    <span className="font-medium">Viral Content AI</span>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>

      <Tab.Group>
        {/* Mobile scroll indicator */}
        <div className="relative">
          <Tab.List className="flex overflow-x-auto pb-4 mb-8 scrollbar-hide gap-3">
            {tools.map((tool) => (
              <Tab
                key={tool.name}
                className={({ selected }) =>
                  `group relative flex items-center px-6 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap outline-none focus:ring-0 ${selected
                    ? 'text-white shadow-lg shadow-gray-900/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white bg-transparent border border-transparent hover:border-gray-200'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    {selected && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gray-900 rounded-2xl"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2.5">
                      <tool.icon className={`w-4 h-4 ${selected ? 'text-primary-400' : tool.color}`} />
                      {tool.name}
                    </span>
                  </>
                )}
              </Tab>
            ))}
          </Tab.List>
          {/* Mobile scroll fade indicator */}
          <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent pointer-events-none md:hidden" />
        </div>

        <Tab.Panels>
          <AnimatePresence mode="wait">
            {tools.map((tool, idx) => (
              <Tab.Panel
                key={idx}
                className="focus:outline-none"
                as={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tool.component}
              </Tab.Panel>
            ))}
          </AnimatePresence>
        </Tab.Panels>
      </Tab.Group>

      {/* Enhanced Roadmap Section */}
      <div className="mt-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-500" />
            Coming Soon
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Campaigns Card */}
          <div className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50"></div>

            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Campaigns</h3>
              <p className="text-gray-500 leading-relaxed">
                Automated email sequences that recover abandoned carts and welcome new customers.
              </p>
            </div>
          </div>

          {/* Ad Creatives Card */}
          <div className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50"></div>

            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Megaphone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ad Creatives</h3>
              <p className="text-gray-500 leading-relaxed">
                Generate high-converting ad copy and visuals for Facebook and Instagram ads in seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
