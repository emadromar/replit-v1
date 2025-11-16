// src/components/dashboard/AiMarketingModal.jsx

import React, { useState } from 'react';
import { X, Loader2, Sparkles, Copy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// This is the little "Copy" button component
// This is the little "Copy" button component
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    const textToCopy = `\u202B${text}\u202C`;
    // This function now handles both secure (HTTPS) and insecure (HTTP) contexts
    if (navigator.clipboard) {
      // Modern, secure way
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    } else {
      // Fallback for insecure contexts (like http://)
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px"; // Move it off-screen
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="btn-secondary btn-sm p-2"
      title="Copy to clipboard"
    >
      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};

// This is the main modal component
export function AiMarketingModal({ 
  isOpen, 
  onClose, 
  productName, 
  storeName, 
  onGenerate, // This is the function to call the AI
  isLoading,  // This is the loading state from ProductsPage
  error,      // This is the error state from ProductsPage
  captions    // This is the array of captions from ProductsPage
}) {

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-600" />
            AI Instagram Captions
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          <p className="text-sm text-gray-600">
            We've generated 3 catchy, bilingual captions for your product: <strong>{productName}</strong>.
            Just copy your favorite, paste it into Instagram, and add your store link!
          </p>

          <AnimatePresence mode="wait">
            {isLoading ? (
              // --- LOADING STATE ---
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg"
              >
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-gray-600 font-medium mt-4">Generating new captions...</p>
              </motion.div>
            ) : error ? (
              // --- ERROR STATE ---
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 rounded-lg p-4"
              >
                <p className="text-center">{error}</p>
                <button onClick={onGenerate} className="btn-primary mt-4">Try Again</button>
              </motion.div>
            ) : (
              // --- SUCCESS STATE ---
              <motion.div 
                key="captions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {captions.length > 0 ? captions.map((caption, index) => (
                  <div key={index} className="p-4 border bg-white rounded-lg shadow-sm">
                    <div className="flex justify-between items-start gap-4">
<p className="text-gray-700 whitespace-pre-wrap flex-1" style={{ direction: 'rtl', textAlign: 'right' }}>{caption}</p>                      <CopyButton text={caption} />
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 font-medium">No captions generated yet.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading}
            className="btn-primary-outline flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isLoading ? "Generating..." : "Generate 3 More"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// We need to add CheckCircle icon for the copy button
const CheckCircle = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);