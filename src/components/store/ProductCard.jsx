// src/components/store/ProductCard.jsx

import React, { useMemo } from 'react';
import { Plus, ShoppingCart, AlertCircle, Star } from 'lucide-react';
import { ProductImage } from '../../ProductImage.jsx';
import { CURRENCY_CODE } from '../../config.js'; // <--- IMPORT THIS

export function ProductCard({ product, onAddToCart, onNotify, onOpenProductDetails, themeColor, isPro }) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const showUrgencyTag = isPro && (product.viewsToday > 20 || isLowStock);
  const urgencyText = isLowStock 
    ? `Only ${product.stock} left!` 
    : 'Selling Fast Today';

  const averageRating = useMemo(() => {
    if (!product.reviews || product.reviews.length === 0) return 0;
    const total = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round(total / product.reviews.length);
  }, [product.reviews]);

  const reviewCount = product.reviews?.length || 0;

  return (
    <div 
      className="card card-hover group flex flex-col h-full overflow-hidden relative"
      onClick={() => onOpenProductDetails(product)}
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <ProductImage 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
        />
        
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isOutOfStock && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-900/90 text-white backdrop-blur-sm shadow-sm">
              Sold Out
            </span>
          )}
          {!isOutOfStock && showUrgencyTag && (
             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm animate-pulse">
               {urgencyText}
             </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-700 transition-colors">
            {product.name}
          </h3>
          
          {reviewCount > 0 ? (
            <div className="flex items-center mb-2" title={`${averageRating} stars`}>
               <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < averageRating ? 'fill-current' : 'text-gray-200 fill-current'}`} />
                  ))}
               </div>
               <span className="ml-1.5 text-xs text-gray-500">({reviewCount})</span>
            </div>
          ) : (
             <div className="h-5 mb-2"></div>
          )}

          <div className="flex items-baseline gap-2">
            {/* --- FIX: Use CURRENCY_CODE here --- */}
            <span className="text-lg font-bold text-gray-900" style={{ color: themeColor }}>
              {CURRENCY_CODE} {product.price.toFixed(2)}
            </span>
            {product.salePrice > 0 && (
               <span className="text-sm text-gray-400 line-through decoration-gray-400">
                 {CURRENCY_CODE} {product.salePrice.toFixed(2)}
               </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
            {isOutOfStock ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onNotify(product); }}
                  className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                   <AlertCircle className="w-4 h-4 mr-2" />
                   Notify Me
                </button>
            ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                  className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-all active:scale-95 shadow-sm hover:shadow-md"
                  style={{ backgroundColor: themeColor }}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add to Cart
                </button>
            )}
        </div>
      </div>
    </div>
  );
}