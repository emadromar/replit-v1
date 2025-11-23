// src/components/shared/LockedButton.jsx
import React from 'react';
import { Lock } from 'lucide-react';

export function LockedButton({ feature, planName, onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`btn-secondary-sm border-dashed border-2 border-primary-300 bg-primary-50/30 hover:bg-primary-50 transition-colors group relative ${className}`}
        >
            <Lock className="w-3 h-3 mr-1.5 text-primary-600" />
            {feature}
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-bold">
                {planName}
            </span>
        </button>
    );
}
