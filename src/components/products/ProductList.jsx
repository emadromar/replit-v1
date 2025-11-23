// src/components/products/ProductList.jsx

import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { Edit, Trash2, Share2, Package, Search, MoreVertical, AlertTriangle } from 'lucide-react';
import { ProductImage } from '../../ProductImage.jsx';
import { ConfirmModal } from '../../ConfirmModal.jsx';
import { CURRENCY_CODE } from '../../config.js';
import { ProductGridSkeleton } from '../shared/Skeleton.jsx';

// --- Mobile Product Card ---
const MobileProductCard = ({ product, onEdit, onMarket, onDelete }) => (
  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex gap-3 items-center">
    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
      <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      {product.stock === 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-[10px] font-bold text-white">SOLD</span></div>}
    </div>
    
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h4>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm font-bold text-primary-700">{CURRENCY_CODE} {product.price}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${product.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
          {product.stock} left
        </span>
      </div>
    </div>

    <div className="flex gap-1">
      <button onClick={() => onMarket(product)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Share2 className="w-4 h-4" /></button>
      <button onClick={() => onEdit(product)} className="p-2 text-gray-600 bg-gray-100 rounded-lg"><Edit className="w-4 h-4" /></button>
      <button onClick={() => onDelete(product)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
    </div>
  </div>
);

export function ProductList({
  products, storeId, showError, showSuccess, onEdit, db, onMarket,
  currentPlanId, searchTerm, onSearchChange, inventoryTitle, productSort, onSortChange,
  isLoading 
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
              <Package className="w-5 h-5 mr-2 text-gray-500"/> 
              {inventoryTitle} <span className="ml-2 text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{products.length}</span>
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
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Package className="w-8 h-8 text-gray-300" /></div>
              <h3 className="text-base font-semibold text-gray-900">Inventory Empty</h3>
              <p className="text-sm text-gray-500 mt-1">{searchTerm ? 'No matching products.' : "Add your first product to start selling."}</p>
            </div>
          ) : (
            <>
              {/* MOBILE: List Cards */}
              <div className="md:hidden space-y-3 p-4">
                {products.map(p => <MobileProductCard key={p.id} product={p} onEdit={onEdit} onMarket={onMarket} onDelete={handleDeleteClick} />)}
              </div>

              {/* DESKTOP: Detailed Table */}
              <div className="hidden md:block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg overflow-hidden">
                              <ProductImage src={product.imageUrl} alt="" className="h-10 w-10 object-cover" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.category || 'Uncategorized'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {CURRENCY_CODE} {product.price?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.stock <= 5 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" /> {product.stock} Left
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">{product.stock} in stock</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onMarket(product)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded" title="AI Market"><Share2 className="w-4 h-4" /></button>
                            <button onClick={() => onEdit(product)} className="text-gray-600 hover:bg-gray-100 p-1.5 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteClick(product)} className="text-red-600 hover:bg-red-50 p-1.5 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"?`}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}