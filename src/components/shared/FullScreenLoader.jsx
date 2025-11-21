// src/components/shared/FullScreenLoader.jsx

import React from 'react';
import { Loader2 } from 'lucide-react';

export function FullScreenLoader({ message, themeColor = '#4f46e5' }) {
  const spinnerStyle = { color: themeColor };
  const textStyle = { color: themeColor };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Loader2 className="w-12 h-12 animate-spin" style={spinnerStyle} />
      {message && <span className="mt-4 text-xl font-semibold" style={textStyle}>{message}</span>}
    </div>
  );
}