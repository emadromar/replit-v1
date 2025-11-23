// src/components/shared/SmartSaveButton.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, Check, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SmartSaveButton = ({ 
  isLoading, 
  isSuccess, 
  disabled, 
  onClick, 
  defaultText = "Save Changes",
  loadingText = "Saving...",
  successText = "Saved!",
  className = ""
}) => {
  const [internalSuccess, setInternalSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setInternalSuccess(true);
      const timer = setTimeout(() => setInternalSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={isLoading || disabled || internalSuccess}
      className={`relative overflow-hidden transition-all duration-300 ease-out flex items-center justify-center
        ${internalSuccess 
          ? 'bg-green-600 border-green-600 text-white hover:bg-green-600' 
          : 'btn-primary'
        } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center"
          >
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {loadingText}
          </motion.span>
        ) : internalSuccess ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center font-bold"
          >
            <Check className="w-5 h-5 mr-2" />
            {successText}
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center"
          >
            {!disabled && <Save className="w-5 h-5 mr-2 opacity-80" />}
            {defaultText}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};