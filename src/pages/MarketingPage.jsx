// src/pages/MarketingPage.jsx

import React from 'react';
import { Tab } from '@headlessui/react';
import { Percent, Instagram, Mail, Megaphone, Lock } from 'lucide-react';
// FIX: Updated paths
import { DiscountCodesManager } from '../components/dashboard/marketing/DiscountCodesManager.jsx';
import { AiCaptionGenerator } from '../components/dashboard/marketing/AiCaptionGenerator.jsx';

export function MarketingPage() {
  const tools = [
    { name: 'Discount Codes', icon: Percent, component: <DiscountCodesManager /> },
    { name: 'Social AI', icon: Instagram, component: <AiCaptionGenerator /> },
    { name: 'Email Campaigns', icon: Mail, locked: true },
    { name: 'Ad Creatives', icon: Megaphone, locked: true },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Marketing Hub</h1>
        <p className="text-gray-500 mt-1">Tools to grow your audience and boost sales.</p>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tools.map((tool, idx) => (
            <Tab
              key={idx}
              disabled={tool.locked}
              className={({ selected }) =>
                `flex items-center px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap outline-none focus:ring-0 ${
                  selected 
                    ? 'bg-gray-900 text-white shadow-lg scale-105' 
                    : tool.locked 
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-70' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`
              }
            >
              {tool.locked ? <Lock className="w-4 h-4 mr-2 opacity-50" /> : <tool.icon className="w-4 h-4 mr-2" />}
              {tool.name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {tools.map((tool, idx) => (
            <Tab.Panel key={idx} className="focus:outline-none">
                {tool.locked ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                        <tool.icon className="w-12 h-12 mb-2 opacity-20" />
                        <span className="font-medium">Coming Soon</span>
                    </div>
                ) : (
                    tool.component
                )}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}