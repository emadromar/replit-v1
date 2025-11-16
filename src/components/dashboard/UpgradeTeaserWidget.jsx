// src/components/dashboard/UpgradeTeaserWidget.jsx

import React from 'react';
// --- THIS IS THE FIX ---
// I've added Palette, Sparkles, and Upload from lucide-react
import {
  Lock,
  Wand2,
  Package,
  LayoutDashboard,
  Palette,
  Sparkles,
  Upload,
} from 'lucide-react';
// --- END FIX ---
import { PLAN_DETAILS } from '../../config.js'; 

const FeatureItem = ({ icon, text }) => (
  <li className="flex items-center text-sm text-gray-600">
    {icon}
    <span className="ml-2">{text}</span>
  </li>
);

// Teaser for Free users
const BasicTeaser = ({ onOpenUpgradeModal }) => {
  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900">
        Unlock Your Store's Potential
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Upgrade to the Basic Plan to get professional branding tools.
      </p>
      <ul className="mt-4 space-y-2">
        <FeatureItem
          icon={<Wand2 className="w-4 h-4 text-indigo-600" />}
          text="AI Background Remover"
        />
        <FeatureItem
          icon={<Package className="w-4 h-4 text-indigo-600" />}
          text="Unlimited Products"
        />
        <FeatureItem
          icon={<Palette className="w-4 h-4 text-indigo-600" />} // This line was crashing
          text="Custom Logo & Colors"
        />
      </ul>
      {/* This button is now pushed to the bottom */}
      <button
        onClick={onOpenUpgradeModal}
        className="w-full mt-auto pt-4 text-indigo-700 hover:text-indigo-500 text-sm font-semibold transition-colors text-left"
      >
        Upgrade to Basic (8 JOD)
      </button>
    </>
  );
};

// Teaser for Basic users
const ProTeaser = ({ onOpenUpgradeModal }) => {
  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900">
        Go Pro & Automate Your Growth
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Upgrade to the Pro Plan to unlock powerful AI and scaling tools.
      </p>
      <ul className="mt-4 space-y-2">
        <FeatureItem
          icon={<LayoutDashboard className="w-4 h-4 text-indigo-600" />}
          text="AI Sales Coach"
        />
        <FeatureItem
          icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
          text="AI Product Descriptions"
        />
        <FeatureItem
          icon={<Upload className="w-4 h-4 text-indigo-600" />}
          text="Bulk Product Import"
        />
      </ul>
      {/* This button is now pushed to the bottom */}
      <button
        onClick={onOpenUpgradeModal}
        className="w-full mt-auto pt-4 text-indigo-700 hover:text-indigo-500 text-sm font-semibold transition-colors text-left"
      >
        Upgrade to Pro (25 JOD)
      </button>
    </>
  );
};

// Main component
export const UpgradeTeaserWidget = ({ currentPlanId, onOpenUpgradeModal }) => {
  if (currentPlanId === 'pro') {
    return null; // Don't show this widget if the user is already Pro
  }

  return (
    // --- ALIGNMENT FIX: Added h-full and flex flex-col ---
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      {currentPlanId === 'free' && (
        <BasicTeaser onOpenUpgradeModal={onOpenUpgradeModal} />
      )}
      {currentPlanId === 'basic' && (
        <ProTeaser onOpenUpgradeModal={onOpenUpgradeModal} />
      )}
    </div>
  );
};