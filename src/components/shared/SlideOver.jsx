// src/components/shared/SlideOver.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SlideOver({ isOpen, onClose, children, maxWidth = 'max-w-2xl' }) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. BACKDROP (z-overlay = 60) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-overlay"
          />

          {/* 2. PANEL (z-drawer = 70) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-y-0 right-0 w-full ${maxWidth} bg-white shadow-2xl z-drawer flex flex-col`}
          >
            {/* Render the form inside. The form handles its own internal scrolling. */}
            <div className="flex-1 h-full overflow-hidden">
                {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}