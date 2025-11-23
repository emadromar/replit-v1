// src/components/shared/ErrorState.jsx
import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export function ErrorState({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-6 max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load orders</h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {message || 'An error occurred while loading your orders. Please try again.'}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="btn-primary px-6 py-2.5 flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Retry
                </button>
            )}
        </div>
    );
}
