// src/CategorySidebar.jsx
import React from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';

export function CategorySidebar({ categories, selectedCategory, onSelectCategory, onShowNewCategoryModal, onDeleteCategory }) {
  
  // 'all' is our default, not from the database
  const allProductsCategory = {
    id: 'all',
    name: 'All Products',
  };

  // We combine our "All Products" button with the list from the database
  const displayCategories = [allProductsCategory, ...categories];

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h3 className="text-lg font-bold text-gray-900">Categories</h3>
        <button 
          onClick={onShowNewCategoryModal}
          className="flex items-center px-3 py-1.5 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 text-sm font-medium transition"
        >
          <Plus className="w-4 h-4 mr-1" /> New
        </button>
      </div>
      
      <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
        {displayCategories.map((category) => (
          <div key={category.id} className="flex items-center group">
            {/* Main Category Button */}
            <button
              onClick={() => onSelectCategory(category.id)}
              className={`flex-1 text-left flex items-center p-2 rounded-lg transition-colors ${
                category.id === selectedCategory
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Tag className="w-4 h-4 mr-2.5" />
              <span className="truncate">{category.name}</span>
            </button>
            
            {/* Show delete button for all categories EXCEPT 'all' */}
            {category.id !== 'all' && (
              <button
                onClick={() => onDeleteCategory(category.id, category.name)}
                className="p-1.5 ml-1 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                title={`Delete ${category.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}