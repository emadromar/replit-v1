// src/BrandsPage.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  collection, onSnapshot, query, orderBy, doc, deleteDoc, 
  updateDoc, addDoc, serverTimestamp, getDocs, where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Plus, Tag, Trash2, Loader2, Image, X, Lock, TrendingUp, Upload
} from 'lucide-react';

// --- CONTEXT IMPORTS ---
import { useFirebaseServices } from './contexts/FirebaseContext.jsx';
import { useNotifications } from './contexts/NotificationContext.jsx';

// --- COMPONENT IMPORTS ---
import { ConfirmModal } from './ConfirmModal.jsx';
import { ProductImage } from './ProductImage.jsx';
import { Input } from './Forminput.jsx';
import { useOutletContext } from 'react-router-dom';

// --- Reusable Locked Feature Card (Local Definition) ---
const LockedFeatureTeaser = ({ title, description, icon, planName, onUpgrade, className = "" }) => {
  const Icon = icon || Lock;
  const planColorClass = planName === 'Basic' ? 'text-subscription-basic' : 'text-subscription-pro';
  
  return (
    <div className={`p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <Icon className={`w-4 h-4 mr-2 ${planColorClass}`} />
                {title}
            </h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planColorClass} bg-white border border-current`}>
                {planName} Plan
            </span>
        </div>
        <p className='text-sm text-gray-500 mt-1 mb-2'>{description}</p>
        <button
            type="button"
            onClick={onUpgrade}
            className="mt-1 text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors"
        >
            {`Upgrade to ${planName} to enable`}
        </button>
    </div>
);
};


// --- COMPONENT 1: BrandSidebar ---
function BrandSidebar({ brands, selectedBrand, onSelectBrand, onShowNewBrand, onDeleteBrand }) {
  
  const allBrandsCategory = {
    id: 'all',
    name: 'All Brands',
  };
  const displayBrands = [allBrandsCategory, ...brands];

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h3 className="text-lg font-bold text-gray-900">Brands</h3>
        <button 
          onClick={onShowNewBrand}
          className="flex items-center px-3 py-1.5 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 text-sm font-medium transition"
        >
          <Plus className="w-4 h-4 mr-1" /> New
        </button>
      </div>
      
      <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
        {displayBrands.map((brand) => (
          <div key={brand.id} className="flex items-center group">
            <button
              onClick={() => onSelectBrand(brand.id === 'all' ? null : brand)}
              className={`flex-1 text-left flex items-center p-2 rounded-lg transition-colors ${
                (brand.id === 'all' && !selectedBrand) || (selectedBrand?.id === brand.id)
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {brand.id === 'all' ? (
                <Tag className="w-5 h-5 mr-2.5" />
              ) : (
                <ProductImage src={brand.logoUrl} alt={brand.name} className="w-5 h-5 mr-2.5 rounded-sm" />
              )}
              <span className="truncate">{brand.name}</span>
            </button>
            
            {brand.id !== 'all' && (
              <button
                onClick={() => onDeleteBrand(brand.id, brand.name)}
                className="p-1.5 ml-1 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                title={`Delete ${brand.name}`}
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


// --- COMPONENT 2: BrandForm (Redesigned) ---
function BrandForm({ store, brand, onDone, showError, showSuccess, db, storage }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!brand;
  const storeId = store.id;

  useEffect(() => {
    if (isEditing) {
      setName(brand.name || '');
      setDescription(brand.description || '');
      setLogoUrl(brand.logoUrl || '');
      setLogoFile(null);
    } else {
      setName('');
      setDescription('');
      setLogoUrl('');
      setLogoFile(null);
    }
  }, [brand, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      showError("Brand name is required.");
      return;
    }
    setLoading(true);

    try {
      let finalLogoUrl = logoUrl || null;

      if (logoFile) {
        const timestamp = Date.now();
        const safeFileName = logoFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const newFileName = `${storeId}-brand-${timestamp}-${safeFileName}`;
        const storageRef = ref(storage, `brand_logos/${storeId}/${newFileName}`);

        await uploadBytes(storageRef, logoFile);
        finalLogoUrl = await getDownloadURL(storageRef);
      }

      const brandData = {
        name: name,
        name_lowercase: name.toLowerCase(),
        description: description,
        logoUrl: finalLogoUrl,
      };

      if (isEditing) {
        const brandRef = doc(db, "stores", storeId, "brands", brand.id);
        await updateDoc(brandRef, {
          ...brandData,
          updatedAt: serverTimestamp(),
        });
        showSuccess(`Brand "${name}" updated!`);
      } else {
        const brandsRef = collection(db, "stores", storeId, "brands");
        await addDoc(brandsRef, {
          ...brandData,
          createdAt: serverTimestamp(),
        });
        showSuccess(`Brand "${name}" created!`);
      }
      onDone();
    } catch (error) {
      console.error("Error saving brand:", error);
      showError(`Failed to save brand: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Brand' : 'Add New Brand'}</h2>
         <button
          type="button"
          onClick={onDone}
          className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors duration-150"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <Input 
        label="Brand Name" 
        id="brand-name"
        value={name}
        onChange={setName}
        required
      />

      <div>
        <label htmlFor="brand-description" className="block text-sm font-medium text-gray-700">Brand Description (Optional)</label>
        <textarea
          id="brand-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo (Optional)</label>
        {logoUrl && !logoFile && (
          <div className="mb-2">
            <ProductImage src={logoUrl} alt="Current logo" className="w-20 h-20 rounded-lg object-contain border p-1" />
          </div>
        )}
        <input 
          type="file" 
          accept="image/png, image/jpeg" 
          onChange={(e) => setLogoFile(e.target.files[0])}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          onClick={(event) => { event.target.value = null }} 
        />
        {logoFile && <p className="mt-2 text-sm text-green-600">New logo selected: {logoFile.name}</p>}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onDone} 
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading || !name} 
          className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition flex justify-center items-center text-sm font-semibold"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? 'Save Changes' : 'Create Brand')}
        </button>
      </div>
    </form>
  );
}


// --- MAIN COMPONENT: BrandsPage ---
export function BrandsPage() {
  const { user, store, showError, showSuccess, onOpenUpgradeModal } = useOutletContext();
  const { db, storage } = useFirebaseServices();
  
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  // Fetch brands
  useEffect(() => {
    if (!user) return;
    const storeId = user.uid;
    const brandsRef = collection(db, "stores", storeId, "brands");
    const q = query(brandsRef, orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBrands = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBrands(fetchedBrands);
    }, (error) => { 
      console.error("Brands listener error:", error); 
      showError("Failed to load brands.");
    });
    
    return () => unsubscribe();
  }, [store, db, showError]);

  // --- Brand Delete Logic ---
  const handleDeleteBrand = (brandId, brandName) => {
    setBrandToDelete({ id: brandId, name: brandName });
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteBrand = async () => {
    if (!brandToDelete || !store || !db) {
      showError("Error: No brand selected for deletion.");
      return;
    }
    
    try {
      const { id, name } = brandToDelete;
      const brandRef = doc(db, "stores", store.id, "brands", id);
      await deleteDoc(brandRef);
      
      showSuccess(`Brand "${name}" deleted.`);
      if (selectedBrand?.id === id) {
        setSelectedBrand(null);
      }
    } catch (error) {
      console.error("Error deleting brand: ", error);
      showError("Failed to delete brand.");
    } finally {
      setIsConfirmModalOpen(false);
      setBrandToDelete(null);
    }
  };

  // --- Handlers for showing/hiding form ---
  const handleShowNewBrand = () => {
    setSelectedBrand(null);
    setShowForm(true); 		
  };
  
  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    setShowForm(true); 		
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedBrand(null);
  };

  if (!store || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  // --- PLAN GATING ---
  const currentPlanId = store?.planId || 'free';
  const canUseBrands = currentPlanId === 'basic' || currentPlanId === 'pro';

  if (!canUseBrands) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
        <LockedFeatureTeaser
          title="Brand Management"
          description="Group your products by brand to build loyalty and allow customers to filter your store."
          icon={TrendingUp}
          planName="Basic"
          onUpgrade={onOpenUpgradeModal}
        />
      </div>
    );
  }

  // --- Main View for Basic/Pro ---
  return (
    <>
      <div className="max-w-screen-2xl mx-auto p-4 md:p-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BrandSidebar 
              brands={brands}
              selectedBrand={selectedBrand}
              onSelectBrand={handleSelectBrand}
              onShowNewBrand={handleShowNewBrand}
              onDeleteBrand={handleDeleteBrand}
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {showForm ? (
              <BrandForm 
                store={store}
                brand={selectedBrand}
                onDone={handleCancelForm}
                showError={showError}
                showSuccess={showSuccess}
                db={db}
                storage={storage}
              />
            ) : (
              <div className="card p-6 text-center h-full flex flex-col justify-center min-h-[300px]">
                <Image className="w-16 h-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Select a brand to edit or add a new one
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Brands help you organize products and allow customers to filter your store.
                </p>
                <button
                  onClick={handleShowNewBrand}
                  className="mt-6 inline-flex items-center self-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add New Brand
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Delete Brand"
        message={`Are you sure you want to delete the brand "${brandToDelete?.name}"? This cannot be undone.`}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteBrand}
        confirmText="Delete"
      />
    </>
  );
}