// src/components/dashboard/ProductForm.jsx

import React, { useState, useEffect } from 'react';
import {
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import {
  Loader2, Sparkles, Lock, X, Tag, FileText, List, Star
} from 'lucide-react';
import { Tab } from '@headlessui/react';

// Contexts & Config
import { Input } from '../../Forminput.jsx';
import { LockedFeatureCard } from '../shared/LockedFeatureCard.jsx'; 
import { PLAN_DETAILS, CURRENCY_CODE } from '../../config.js';
import { ProductAnalyzer } from './ProductAnalyzer.jsx';

// --- NEW SUB-COMPONENTS ---
import { ImageUploader } from './product/ImageUploader.jsx';
import { ReviewManager } from './product/ReviewManager.jsx';

export function ProductForm({
  store, sendSystemNotification, showError, showSuccess, product, onDone,
  db, storage, functions, canAddMoreProducts, productLimit, categories, brands, onOpenUpgradeModal,
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleStartDate, setSaleStartDate] = useState('');
  const [saleEndDate, setSaleEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [allowFileUpload, setAllowFileUpload] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  // Loading States
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [bgRemoveLoading, setBgRemoveLoading] = useState(false);

  const isEditing = !!product;
  const currentPlanId = store?.planId || 'free';
  const isFreePlan = currentPlanId === 'free';
  const isBasicPlan = currentPlanId === 'basic';
  const isProPlan = currentPlanId === 'pro';

  const aiLimits = {
    bgRemove: PLAN_DETAILS[currentPlanId]?.limits?.aiBgRemovals || 0,
    bgRemoveUsed: 0, 
  };
  const canUseBgRemove = aiLimits.bgRemove > aiLimits.bgRemoveUsed;

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(String(product.price ?? ''));
      setStock(String(product.stock ?? ''));
      setCategory(product.category || '');
      setBrand(product.brand || '');
      setDescription(product.description || '');
      setCostPrice(String(product.costPrice ?? ''));
      setSalePrice(String(product.salePrice ?? ''));
      setSaleStartDate(product.saleStartDate || '');
      setSaleEndDate(product.saleEndDate || '');
      setAllowFileUpload(product.allowFileUpload || false);
      setImageUrl(product.imageUrl || '');
      setImageFile(null);
      setReviews(product.reviews || []);
    } else {
      // Reset form
      setName(''); setPrice(''); setStock(''); setCategory(''); setBrand(''); setDescription('');
      setCostPrice(''); setSalePrice(''); setSaleStartDate(''); setSaleEndDate('');
      setAllowFileUpload(false); setImageUrl(''); setImageFile(null); setReviews([]);
    }
  }, [product]);

  // --- AI Handlers ---
  const handleGenerateDescription = async () => {
    if (!isProPlan) {
      showError('Upgrade to Pro to use the AI Description Generator.');
      onOpenUpgradeModal();
      return;
    }
    if (!functions) { showError('AI service is not available.'); return; }
    if (!name) { showError('Please enter a Product Name first.'); return; }
    
    setAiLoading(true);
    try {
      const generateDesc = httpsCallable(functions, 'generateProductDescription');
      const result = await generateDesc({ productName: name });
      if (result.data.description) {
        setDescription(result.data.description);
        showSuccess('Description generated!');
      } else {
        throw new Error(result.data.error || 'AI could not generate a description.');
      }
    } catch (error) {
      console.error('AI Description Error:', error);
      showError(`AI Error: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (isFreePlan) {
      showError('Upgrade to Basic or Pro to use AI Background Remover.');
      onOpenUpgradeModal();
      return;
    }
    if (!canUseBgRemove) {
      showError('You have used all your AI Background Removals for this month.');
      onOpenUpgradeModal();
      return;
    }
    setBgRemoveLoading(true);
    try {
      // NOTE: This is a demo placeholder. Real integration would go here.
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccess('Background removed! (This is a demo)');
    } catch (error) {
      showError(`Error: ${error.message}`);
    } finally {
      setBgRemoveLoading(false);
    }
  };

  // --- Review Handlers ---
  const handleAddReview = (newReview) => {
    setReviews([newReview, ...reviews]);
    showSuccess("Review added! Don't forget to save.");
  };

  const handleEditReview = (editedReview) => {
    setReviews(reviews.map(r => r.id === editedReview.id ? editedReview : r));
    showSuccess("Review updated! Don't forget to save.");
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setReviews(reviews.filter(r => r.id !== reviewId));
      showSuccess("Review removed! Don't forget to save.");
    }
  };

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing && !canAddMoreProducts) {
      showError(`Product limit (${productLimit}) reached. Please upgrade.`);
      onOpenUpgradeModal();
      return;
    }
    setLoading(true);
    if (!db || !storage) {
      showError('Database or Storage service is not ready.');
      setLoading(false);
      return;
    }
    try {
      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock, 10);
      const parsedCostPrice = parseFloat(costPrice) || 0;
      const parsedSalePrice = parseFloat(salePrice) || 0;
      
      let finalImageUrl = imageUrl || null;
      
      // Handle File Upload
      if (imageFile) {
        const timestamp = Date.now();
        const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const newFileName = `${store.id}-${timestamp}-${safeFileName}`;
        const storageRef = ref(storage, `product_images/${store.id}/${newFileName}`);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }
      
      const productData = {
        name,
        price: parsedPrice,
        stock: parsedStock,
        costPrice: parsedCostPrice,
        description: description,
        salePrice: parsedSalePrice,
        saleStartDate: (isBasicPlan || isProPlan) ? saleStartDate || null : null,
        saleEndDate: (isBasicPlan || isProPlan) ? saleEndDate || null : null,
        allowFileUpload: allowFileUpload,
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp(),
        category: (isBasicPlan || isProPlan) ? category.trim() : '',
        brand: (isBasicPlan || isProPlan) ? brand.trim() : '',
        reviews: reviews,
      };
      
      if (isEditing && product?.id) {
        const productRef = doc(db, 'stores', store.id, 'products', product.id);
        await updateDoc(productRef, productData);
      } else {
        const collectionRef = collection(db, 'stores', store.id, 'products');
        await addDoc(collectionRef, {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }
      
      // Stock Notifications
      if ((isBasicPlan || isProPlan) && parsedStock > 0 && parsedStock <= 5) {
        sendSystemNotification(store.id, store.email, currentPlanId, 'stock', `Inventory Warning: Product **${name}** is low on stock (${parsedStock} remaining).`);
      } else if ((isBasicPlan || isProPlan) && parsedStock === 0) {
        sendSystemNotification(store.id, store.email, currentPlanId, 'stock_critical', `CRITICAL ALERT: Product **${name}** is now out of stock (0 remaining)!`);
      }
      
      showSuccess(isEditing ? 'Product updated!' : 'Product added!');
      onDone();
    } catch (error) {
      showError(error.message);
      console.error('Product submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabConfig = [
    { id: 'general', name: 'General', icon: FileText },
    { id: 'details', name: 'Details', icon: List },
    { id: 'reviews', name: 'Reviews', icon: Star },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button type="button" onClick={onDone} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {!isEditing && !canAddMoreProducts && (
        <div className="p-4 m-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-sm font-medium text-yellow-800">
            {`Product limit (${productLimit}) reached. Upgrade to add more.`}
          </p>
          <button type="button" onClick={onOpenUpgradeModal} className="mt-2 text-sm font-semibold text-primary-700 hover:underline">
            Upgrade Your Plan
          </button>
        </div>
      )}
      
      <div className="overflow-y-auto flex-1">
        <Tab.Group>
          <Tab.List className="px-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            {tabConfig.map((tab) => (
              <Tab key={tab.id} className={({ selected }) => `flex items-center text-sm font-semibold px-4 py-3 mr-2 border-b-2 transition-all ${selected ? 'text-primary-700 border-primary-700 bg-primary-50' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'} focus:outline-none`}>
                <tab.icon className={`w-4 h-4 mr-2 ${tab.id === 'reviews' && 'text-yellow-500'}`} />
                {tab.name}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {/* --- GENERAL PANEL --- */}
            <Tab.Panel className="p-6 space-y-6">
              <Input label="Product Name" value={name} onChange={setName} required maxLength={100} id="product-name" placeholder="e.g., Summer T-Shirt" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label={`Price (${CURRENCY_CODE})`} type="number" step="0.01" min="0" value={price} onChange={setPrice} required id="product-price" placeholder="0.00" />
                <Input label="Stock Quantity" type="number" step="1" min="0" value={stock} onChange={setStock} required id="product-stock" placeholder="0" />
              </div>
              
              {/* AI Description */}
              <div className="bg-white border border-gray-200 rounded-xl p-1">
                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-t-lg border-b border-gray-100">
                    <label htmlFor="product-description" className="block text-sm font-semibold text-gray-700">Product Description</label>
                    {isProPlan ? (
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={aiLoading || !name}
                        className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        {aiLoading ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                        {aiLoading ? "Generating..." : "Auto-Write with AI"}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center"><Lock className="w-3 h-3 mr-1" /> AI writing locked (Pro)</span>
                    )}
                  </div>
                  <textarea 
                    id="product-description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={aiLoading ? 6 : 4}
                    className="block w-full px-4 py-3 text-body border-0 focus:ring-0 rounded-b-xl resize-y placeholder-gray-300"
                    placeholder="Describe your product here..." 
                    readOnly={aiLoading}
                  />
              </div>
            </Tab.Panel>
            
            {/* --- DETAILS PANEL --- */}
            <Tab.Panel className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label="Cost Price (Optional)" type="number" step="0.01" min="0" value={costPrice} onChange={setCostPrice} id="product-cost-price" placeholder="e.g., 5.00" />
                <Input label="Sale Price (Optional)" type="number" step="0.01" min="0" value={salePrice} onChange={setSalePrice} id="product-sale-price" placeholder="e.g., 8.00" />
              </div>

              {/* Organization Section */}
              {(isBasicPlan || isProPlan) ? (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-5">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center">
                     <Tag className="w-4 h-4 mr-2 text-gray-500"/> Sales & Organization
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input label="Sale Start Date" type="date" value={saleStartDate} onChange={setSaleStartDate} id="sale-start-date" />
                    <Input label="Sale End Date" type="date" value={saleEndDate} onChange={setSaleEndDate} id="sale-end-date" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                      <select id="product-category" value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                        <option value="">No category</option>
                        {categories.map((cat) => ( <option key={cat.id} value={cat.name}>{cat.name}</option> ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="product-brand" className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
                      <select id="product-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="input">
                        <option value="">No brand</option>
                        {brands.map((b) => ( <option key={b.id} value={b.name}>{b.name}</option> ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <LockedFeatureCard
                  title="Product Organization"
                  description="Group products by category and brand to help customers filter. Upgrade to Basic to unlock."
                  icon={Tag}
                  planName="Basic"
                  onUpgrade={onOpenUpgradeModal}
                />
              )}

              {/* EXTRACTED IMAGE UPLOADER */}
              <ImageUploader 
                imageFile={imageFile}
                imageUrl={imageUrl}
                onFileChange={(e) => setImageFile(e.target.files[0])}
                onRemoveBackground={handleRemoveBackground}
                bgRemoveLoading={bgRemoveLoading}
                canUseBgRemove={canUseBgRemove}
                isLocked={isFreePlan}
                onUpgrade={onOpenUpgradeModal}
              />

              <div className="flex items-center pt-4 border-t border-gray-100">
                <input
                  type="checkbox"
                  id="allow-file-upload"
                  checked={allowFileUpload}
                  onChange={(e) => setAllowFileUpload(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="allow-file-upload" className="ml-3 block text-sm text-gray-700">
                  Allow customer file uploads (For custom orders)
                </label>
              </div>
            </Tab.Panel>

            {/* --- REVIEWS PANEL --- */}
            <Tab.Panel className="p-6">
              {/* EXTRACTED REVIEW MANAGER */}
              <ReviewManager 
                reviews={reviews}
                onAdd={handleAddReview}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

       {product?.id && ( 
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <ProductAnalyzer 
                  product={product} 
                  store={store} 
                  onOpenUpgradeModal={onOpenUpgradeModal} 
                  services={{ functions, db, storage }} 
                  showError={showError}
              />
          </div>
      )}       

      {/* Footer Buttons */}
      <div className="p-6 border-t border-gray-200 bg-white flex gap-4">
        {isEditing && (
          <button type="button" onClick={onDone} className="btn-secondary flex-1">Cancel</button>
        )}
        <button type="submit" disabled={loading || (!isEditing && !canAddMoreProducts)} className="btn-primary flex-1">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditing ? 'Save Changes' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}