// src/components/dashboard/widgets/StoreLinkCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, ExternalLink, Globe } from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext.jsx';

export const StoreLinkCard = ({ storeUrl }) => {
  const [copied, setCopied] = useState(false);
  const { showSuccess } = useNotifications();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl).then(() => {
      setCopied(true);
      showSuccess("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div 
      className="card p-5" // Reduced padding slightly
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 flex items-center">
          <Globe className="w-4 h-4 mr-2 text-gray-500"/> Public Store Link
        </h2>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            readOnly
            value={storeUrl}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600 focus:outline-none truncate"
          />
        </div>
        
        <button
          onClick={copyToClipboard}
          className={`p-2 rounded-lg transition-colors ${
            copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Copy Link"
        >
          {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
        
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
          title="Visit Store"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </motion.div>
  );
};