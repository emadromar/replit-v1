// src/components/products/ProductList.jsx

import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { Edit, Trash2, Package, Search, AlertTriangle, SlidersHorizontal, Plus, X } from 'lucide-react';
import { ProductImage } from '../../ProductImage.jsx';
import { ConfirmModal } from '../../ConfirmModal.jsx';
import { CURRENCY_CODE } from '../../config.js';
import { ProductGridSkeleton } from '../shared/Skeleton.jsx';

// --- Mobile Product Card ---
const MobileProductCard = ({ product, onEdit, onDelete }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-center">
    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-100">
      <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      {product.stock === 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-[10px] font-bold text-white tracking-wider">SOLD</span></div>}
    </div>

    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h4>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-sm font-bold text-gray-900">{CURRENCY_CODE} {product.price}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.stock <= 5 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-100 text-gray-600'}`}>
          {product.stock} left
        </span>
      </div>
    </div>

    <div className="flex gap-1">
      <button onClick={() => onEdit(product)} className="p-2 text-gray-500 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
      <button onClick={() => onDelete(product)} className="p-2 text-gray-400 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
    </div>
  </div>
);

export function ProductList({
  products, storeId, showError, showSuccess, onEdit, db,
  currentPlanId, searchTerm, onSearchChange, inventoryTitle, productSort, onSortChange,
  isLoading, totalProductsCount, onAddProduct, storeUrl, selectedCategory, onClearFilters
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
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="card h-full flex flex-col p-0 overflow-hidden bg-gray-50 md:bg-white border-0 md:border">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-500" />
              {inventoryTitle} <span className="ml-2 text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {/* Smart badge showing filtered count */}
                {products.length === totalProductsCount
                  ? totalProductsCount
                  : `${products.length} of ${totalProductsCount}`
                }
              </span>
            </h2>

            <div className="flex gap-2 w-full md:w-auto">
              {currentPlanId !== 'free' && (
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm w-full"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              )}
              {currentPlanId === 'pro' && (
                <select value={productSort} onChange={(e) => onSortChange(e.target.value)} className="input py-2 text-sm w-auto">
                  <option value="createdAt_desc">Newest</option>
                  <option value="price_desc">Price: High</option>
                  <option value="stock_asc">Low Stock</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 md:bg-white">
          {isLoading ? (
            <div className="p-6"><ProductGridSkeleton /></div>
          ) : products.length === 0 ? (
            searchTerm || (selectedCategory && selectedCategory !== 'all') ? (
              // Filtered empty state
              <div className="flex flex-col items-center justify-center h-96 text-center p-6 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <SlidersHorizontal className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products match your filters</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Try adjusting your search or category filter to see more results. You have {totalProductsCount} total {totalProductsCount === 1 ? 'product' : 'products'}.
                </p>
                <button onClick={onClearFilters} className="btn-secondary px-6 py-2.5 flex items-center gap-2">
                  <X className="w-4 h-4" /> Clear All Filters
                </button>
              </div>
            ) : (
              // True empty state
              <div className="flex flex-col items-center justify-center h-96 text-center p-6 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Package className="w-10 h-10 text-primary-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Your store is ready!</h3>

                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Add your first product to start selling. Products you add here will appear in your online store for customers to purchase.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button onClick={onAddProduct} className="btn-primary px-6 py-2.5 w-full sm:w-auto justify-center">
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Product
                  </button>
                  <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary px-6 py-2.5 w-full sm:w-auto justify-center text-center">
                    Preview Store
                  </a>
                </div>

                <p className="text-xs text-gray-400 mt-6">
                  Need help? <a href="https://webjor.com/guide" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Read our product guide</a>
                </p>
              </div>
            )
          ) : (
            <>
              {/* MOBILE: List Cards */}
              <div className="md:hidden space-y-4 p-4">
                {products.map(p => <MobileProductCard key={p.id} product={p} onEdit={onEdit} onDelete={handleDeleteClick} />)}
              </div>

              {/* DESKTOP: Detailed Table */}
              <div className="hidden md:block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                              <ProductImage src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{product.category || 'Uncategorized'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {CURRENCY_CODE} {product.price?.toFixed(2)}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {product.stock <= 5 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <AlertTriangle className="w-3 h-3 mr-1" /> {product.stock} Left
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">{product.stock} in stock</span>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                          {/* Always visible Edit + hover Delete */}
                          <div className="flex justify-end gap-2">
                            <button onClick={() => onEdit(product)} className="text-gray-500 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-all" title="Edit Product">
                              <Edit className="w-4 h-4" />
                            </button>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleDeleteClick(product)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stronger delete confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Permanently Delete Product?"
        message={
          <div className="space-y-2">
            <p className="font-medium text-gray-900">"{productToDelete?.name}"</p>
            <p className="text-sm text-gray-600">
              This will remove the product from your store and all related data. This action cannot be undone.
            </p>
            {productToDelete?.stock > 0 && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Warning: {productToDelete.stock} units in stock will be lost
              </p>
            )}
          </div>
        }
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        confirmText="Delete Product"
        isLoading={isDeleting}
      />
    </>
  );
}