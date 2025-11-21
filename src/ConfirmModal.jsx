// src/ConfirmModal.jsx
import React from 'react';
import { AlertCircle, X, Loader2 } from 'lucide-react';

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false
}) {

  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 transition-opacity" 
      onClick={onCancel} // Close on backdrop click
    >
      {/* Modal Content */}
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="p-6 flex">
          {/* Icon */}
          <div className="flex-shrink-0 mr-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          
          {/* Text Content */}
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>
          </div>
          
          {/* Close Button (top right) */}
          <button 
            onClick={onCancel} 
            className="absolute top-0 right-0 m-2 p-2 rounded-full text-gray-400 hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Footer with Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse sm:gap-3 gap-2 rounded-b-lg">
          <button 
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : confirmText}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}