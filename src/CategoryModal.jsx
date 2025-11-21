// src/CategoryModal.jsx
import React, { useState } from 'react';
import { X, Loader2, Tag } from 'lucide-react';

export function CategoryModal({ isOpen, onClose, onSubmit }) {
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  // This will be replaced with real submit logic in a future step
  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading || !categoryName) return;
    
    setLoading(true);
    // This onSubmit prop will eventually save to Firebase.
    // For now, it just simulates a save.
    onSubmit(categoryName).finally(() => {
      setLoading(false);
      setCategoryName('');
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4 transition-opacity" 
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add New Category</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
              Category Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g., Summer Collection"
                required
              />
            </div>
          </div>

          {/* Footer with Submit Button */}
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button 
              type="submit" 
              disabled={loading || !categoryName}
              className="w-full flex justify-center items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}