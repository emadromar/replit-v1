// src/components/products/ProductList.jsx

import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { Edit, Trash2, Share2, Package, Search } from 'lucide-react';
import { ProductImage } from '../../ProductImage.jsx';
import { ConfirmModal } from '../../ConfirmModal.jsx';
import { CURRENCY_CODE } from '../../config.js';
import { ProductGridSkeleton } from '../shared/Skeleton.jsx'; // FIX: Import Skeleton

export function ProductList({
  products, storeId, showError, showSuccess, onEdit, db, onMarket,
  currentPlanId, searchTerm, onSearchChange, inventoryTitle, productSort, onSortChange,
  isLoading // FIX: Accept Loading Prop
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete || !db) return;
    
    setIsDeleting(true);
    try {
      const productRef = doc(db, 'stores', storeId, 'products', productToDelete.id);
      await deleteDoc(productRef);
      showSuccess(`Product "${productToDelete.name}" deleted.`);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      showError(`Deletion failed: ${error.message}`);
      console.error('Delete product error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="card p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
          <h2 className="text-xl font-semibold text-gray-900">
            {inventoryTitle || 'Inventory'}{' '}
            <span className="text-gray-400 font-normal">({products.length})</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {currentPlanId !== 'free' && (
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm w-full"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            )}
            {currentPlanId === 'pro' && (
              <div className="w-full sm:w-48">
                <select
                  value={productSort}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="createdAt_desc">Sort: Newest First</option>
                  <option value="name_asc">Sort: Name (A-Z)</option>
                  <option value="price_asc">Sort: Price (Low-High)</option>
                  <option value="price_desc">Sort: Price (High-Low)</option>
                  <option value="stock_asc">Sort: Stock (Low-High)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          {/* FIX: Render Skeleton if loading */}
          {isLoading ? (
             <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
               <Package className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No products found</h3>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm ? 'Try adjusting your search.' : "Click 'Add New Product' to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="card card-hover overflow-hidden flex flex-col"
                >
                  <ProductImage src={product.imageUrl} alt={product.name}
                    className="w-full h-44 object-cover bg-gray-100"
                  />
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="font-semibold text-gray-800 truncate" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mt-1">{`${CURRENCY_CODE} ${product.price?.toFixed(2) || '0.00'}`}</p>
                    <p className={`text-sm font-medium mt-1 ${
                      product.stock <= 5 && product.stock > 0 ? 'text-alert-warning' : product.stock === 0 ? 'text-alert-error' : 'text-gray-600'
                    }`}>
                      {product.stock} in stock
                    </p>
                    
                    <div className="pt-4 mt-auto flex gap-2">
                      <button onClick={() => onEdit(product)}
                        className="btn-secondary flex-1"
                        title="Edit">
                        <Edit className="w-4 h-4 mr-1.5" /> Edit
                      </button>
                      
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onMarket(product);
                        }}
                        className="btn-primary-outline flex-1"
                        title="Market with AI"
                      >
                        <Share2 className="w-4 h-4 mr-1.5" /> Market
                      </button>

                      <button onClick={() => handleDeleteClick(product)}
                        className="btn-secondary-danger flex-1"
                        title="Delete">
                        <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}