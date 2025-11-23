// src/pages/ProductsPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, onSnapshot, query, orderBy,
  doc, deleteDoc, getDocs, where, addDoc, serverTimestamp
} from 'firebase/firestore';
import { Plus, Loader2, Upload, Lock, Tag } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { useOutletContext } from 'react-router-dom';

// Contexts & Components
import { ConfirmModal } from '../ConfirmModal.jsx';
import { CategorySidebar } from '../CategorySidebar.jsx';
import { CategoryModal } from '../CategoryModal.jsx';
import { ProductImport } from '../ProductImport.jsx';
import { PLAN_DETAILS } from '../config.js';
import { ProductForm } from '../components/dashboard/ProductForm.jsx';
import { LockedFeatureCard } from '../components/shared/LockedFeatureCard.jsx';
import { ProductList } from '../components/products/ProductList.jsx';
import { SlideOver } from '../components/shared/SlideOver.jsx';

export function ProductsPage() {
  const {
    user, store, services, showError, showSuccess,
    sendSystemNotification, onOpenUpgradeModal
  } = useOutletContext();

  const { db, storage, functions } = services;

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false); // Controls the Drawer
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSort, setProductSort] = useState('createdAt_desc');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [brands, setBrands] = useState([]);

  // --- Actions ---
  const handleCreateCategory = async (categoryName) => {
    if (!store || !db) { showError('Database not connected.'); return Promise.reject(); }
    const storeId = store.id;
    const categoriesRef = collection(db, 'stores', storeId, 'categories');
    const lowerCaseName = categoryName.toLowerCase();
    const q = query(categoriesRef, where('name_lowercase', '==', lowerCaseName));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        showError(`A category named "${categoryName}" already exists.`);
        return Promise.reject();
      }
      await addDoc(categoriesRef, { name: categoryName, name_lowercase: lowerCaseName, createdAt: serverTimestamp() });
      showSuccess(`Category "${categoryName}" created!`);
      setIsCategoryModalOpen(false);
    } catch (error) { showError('Failed to create category.'); return Promise.reject(); }
  };

  const handleDeleteCategory = (categoryId, categoryName) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete || !store || !db) { showError('Error: No category selected for deletion.'); return; }
    try {
      const { id, name } = categoryToDelete;
      const categoryRef = doc(db, 'stores', store.id, 'categories', id);
      await deleteDoc(categoryRef);
      showSuccess(`Category "${name}" deleted.`);
      if (selectedCategory === id) { setSelectedCategory('all'); }
    } catch (error) {
      showError('Failed to delete category.');
    } finally { setIsConfirmModalOpen(false); setCategoryToDelete(null); }
  };

  // --- Effects ---
  useEffect(() => {
    if (!user) return;
    const storeId = user.uid;
    const productsRef = collection(db, 'stores', storeId, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));

    setProductsLoading(true);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setProductsLoading(false);
    }, (error) => {
      showError('Failed to load products.');
      setProductsLoading(false);
    });
    return () => unsubscribe();
  }, [store, db, showError]);

  useEffect(() => {
    if (!user) return;
    const storeId = user.uid;
    const categoriesRef = collection(db, 'stores', storeId, 'categories');
    const q = query(categoriesRef, orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => { showError('Failed to load categories.'); });
    return () => unsubscribe();
  }, [store, db, showError]);

  useEffect(() => {
    if (!user) return;
    const storeId = user.uid;
    const brandsRef = collection(db, 'stores', storeId, 'brands');
    const q = query(brandsRef, orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBrands(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => { showError('Failed to load brands.'); });
    return () => unsubscribe();
  }, [store, db, showError]);

  // --- Derived State ---
  const filteredProducts = useMemo(() => {
    let tempProducts = [...products];
    if (selectedCategory !== 'all') {
      const categoryDoc = categories.find((cat) => cat.id === selectedCategory);
      if (categoryDoc) {
        tempProducts = tempProducts.filter(p => (p.category || '').toLowerCase() === (categoryDoc.name || '').toLowerCase());
      }
    }
    if (productSearchTerm) {
      tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()));
    }
    if (store?.planId === 'pro') {
      switch (productSort) {
        case 'name_asc': tempProducts.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'price_asc': tempProducts.sort((a, b) => a.price - b.price); break;
        case 'price_desc': tempProducts.sort((a, b) => b.price - a.price); break;
        case 'stock_asc': tempProducts.sort((a, b) => a.stock - b.stock); break;
        default: break;
      }
    }
    return tempProducts;
  }, [products, selectedCategory, categories, productSearchTerm, productSort, store?.planId]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };
  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };
  const handleDone = () => {
    setEditingProduct(null);
    setShowForm(false);
  };
  const handleSelectCategory = (id) => {
    setSelectedCategory(id);
  };

  if (!store || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  const currentPlanId = store?.planId || 'free';
  const isBasicPlan = currentPlanId === 'basic';
  const isProPlan = currentPlanId === 'pro';

  const currentPlanDetails = PLAN_DETAILS[currentPlanId];
  const productLimit = currentPlanDetails?.limits?.products ?? 0;
  const canAddMoreProducts = products.length < productLimit;
  const inventoryTitle = currentPlanId === 'free' ? `Your ${productLimit} Products` : 'Product Inventory';
  const subscriptionEndDate = store?.subscriptionEnds?.toDate();
  const isSubscriptionActive = subscriptionEndDate ? subscriptionEndDate > new Date() : currentPlanId === 'free';
  const canUseBulkImport = currentPlanId === 'pro' && isSubscriptionActive;
  const canUseCategories = isBasicPlan || isProPlan;

  return (
    <div className="max-w-screen-2xl mx-auto p-4 md:p-8">

      {/* Mobile Horizontal Scroll for Categories */}
      {canUseCategories && (
        <div className="lg:hidden mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex space-x-2">
            <button
              onClick={() => handleSelectCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shadow-sm ${selectedCategory === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shadow-sm ${selectedCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium whitespace-nowrap border border-primary-100 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> New
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add Product Button */}
          <button
            onClick={handleAddNew}
            disabled={!canAddMoreProducts}
            className="btn-primary w-full hidden md:flex"
            title={!canAddMoreProducts ? `Product limit reached (${productLimit})` : "Add a new product"}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Product
          </button>

          {/* Category Sidebar */}
          <div className="hidden lg:block">
            {canUseCategories ? (
              <div className="card p-4">
                <CategorySidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  onShowNewCategoryModal={() => setIsCategoryModalOpen(true)}
                  onDeleteCategory={handleDeleteCategory}
                />
              </div>
            ) : (
              <LockedFeatureCard
                title="Organize Your Store"
                description="Group your products into categories and brands."
                icon={Tag}
                planName="Basic"
                onUpgrade={onOpenUpgradeModal}
              />
            )}
          </div>

          {/* Bulk Import */}
          <div className="hidden lg:block">
            {canUseBulkImport ? (
              <ProductImport storeId={user.uid} db={db} showError={showError} showSuccess={showSuccess} />
            ) : (
              <div className="card p-6 space-y-3">
                <h2 className="text-lg font-semibold flex items-center text-gray-800">
                  <Upload className="w-5 h-5 mr-2 text-primary-700" />
                  Bulk Import
                </h2>
                <p className="text-sm text-gray-600">
                  Quickly add products via CSV.
                </p>
                <button
                  onClick={onOpenUpgradeModal}
                  className="btn-locked w-full"
                >
                  <Lock className="w-4 h-4 mr-1.5" />
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-3">
          <ProductList
            products={filteredProducts}
            storeId={store.id}
            showError={showError}
            showSuccess={showSuccess}
            onEdit={handleEdit}
            db={db}
            currentPlanId={currentPlanId}
            searchTerm={productSearchTerm}
            onSearchChange={setProductSearchTerm}
            inventoryTitle={inventoryTitle}
            productSort={productSort}
            onSortChange={setProductSort}
            isLoading={productsLoading}
          />
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={handleAddNew}
        disabled={!canAddMoreProducts}
        className={`lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${!canAddMoreProducts ? 'bg-gray-400 text-gray-200' : 'bg-primary-700 text-white'
          }`}
        aria-label="Add Product"
        style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* --- DRAWER FOR PRODUCT FORM --- */}
      <SlideOver isOpen={showForm} onClose={handleDone} maxWidth="max-w-2xl">
        <ProductForm
          store={store}
          sendSystemNotification={sendSystemNotification}
          showError={showError}
          showSuccess={showSuccess}
          product={editingProduct}
          onDone={handleDone}
          db={db}
          storage={storage}
          functions={functions}
          canAddMoreProducts={canAddMoreProducts}
          productLimit={productLimit}
          categories={categories}
          brands={brands}
          onOpenUpgradeModal={onOpenUpgradeModal}
        />
      </SlideOver>

      {/* Modals */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
      />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? Products in this category will be uncategorized.`}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteCategory}
        confirmText="Delete"
      />
    </div>
  );
}