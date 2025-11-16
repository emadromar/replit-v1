// src/components/shared/LockedFeatureTeaser.jsx

import React from 'react';
import { Lock } from 'lucide-react';

// This is the component we are moving
export const LockedFeatureTeaser = ({ title, planName, onUpgrade, className = "" }) => (
  <div className={`p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <span className="text-xs font-semibold text-gray-500 px-2 py-0.5 bg-gray-200 rounded-full flex items-center">
        <Lock className="w-3 h-3 mr-1" /> {planName} Plan
      </span>
    </div>
    <button
      type="button"
      onClick={onUpgrade}
      className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
    >
      {`Upgrade to ${planName} to enable`}
    </button>
  </div>
);