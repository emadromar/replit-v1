// src/components/dashboard/UpgradeTeaserWidget.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, TrendingUp, Zap, MessageSquare, ArrowRight, 
  ShieldAlert, Lock, Users, Timer 
} from 'lucide-react';

export function UpgradeTeaserWidget({ currentPlanId, onOpenUpgradeModal }) {
  if (currentPlanId === 'pro') return null;

  const isFree = currentPlanId === 'free';

  // --- CONFIGURATION BASED ON PLAN ---
  const content = isFree ? {
    // FREE -> BASIC (The "Fix" Pitch)
    badge: "Critical Missing Features",
    badgeColor: "bg-red-500/20 text-red-100 border-red-500/30",
    title: "Why visitors aren't buying yet",
    description: "Your store is missing key 'Trust Signals'. 90% of shoppers leave because they don't see social proof or urgency.",
    buttonText: "Upgrade to Fix Leaks",
    features: [
      { icon: Users, text: "Enable 'Live Shopper' Popups" },
      { icon: Timer, text: "Add 'Low Stock' Urgency Tags" },
      { icon: MessageSquare, text: "Unlock Customer Reviews" },
      { icon: Lock, text: "Remove 'Powered By' Badge" }
    ]
  } : {
    // BASIC -> PRO (The "Growth" Pitch)
    badge: "Automate Your Growth",
    badgeColor: "bg-white/20 text-white border-white/10",
    title: "Ready to scale your business?",
    description: "You have the basics. Now let AI handle the hard work and unlock unlimited potential.",
    buttonText: "Unlock Pro Features",
    features: [
      { icon: Sparkles, text: "AI Product Descriptions" },
      { icon: TrendingUp, text: "Advanced Sales Analytics" },
      { icon: Zap, text: "Discount Codes & Coupons" },
      { icon: MessageSquare, text: "AI Sales Coach" }
    ]
  };

  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900 text-white shadow-xl"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Abstract Background Pattern */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Text Content */}
          <div className="flex-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border mb-4 ${content.badgeColor}`}>
              {isFree ? <ShieldAlert className="w-3 h-3 mr-1.5" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
              {content.badge}
            </span>
            <h3 className="text-2xl font-bold mb-2 leading-tight">
              {content.title}
            </h3>
            <p className="text-primary-100 text-sm max-w-lg leading-relaxed mb-6">
              {content.description}
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-primary-50">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <feature.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button (Right side on desktop) */}
          <div className="w-full md:w-auto flex-shrink-0">
             <button 
              onClick={onOpenUpgradeModal}
              className="w-full flex items-center justify-center px-6 py-4 bg-white text-primary-900 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg group whitespace-nowrap"
            >
              {content.buttonText}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-center text-primary-200 mt-3">
              {isFree ? "Starting at 5 ${CURRENCY_CODE}/month" : "Starting at 15 ${CURRENCY_CODE}/month"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}