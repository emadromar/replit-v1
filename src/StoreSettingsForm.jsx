// src/StoreSettingsForm.jsx

import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { Upload, Sparkles, Lock, Zap, Palette, Store, LayoutTemplate } from 'lucide-react';
import { Input } from './Forminput.jsx';
import { ProductImage } from './ProductImage.jsx';
import { LockedFeatureCard } from './components/shared/LockedFeatureCard.jsx'; 
import { SmartSaveButton } from './components/shared/SmartSaveButton.jsx'; // NEW
import { useOutletContext } from 'react-router-dom';
import { CURRENCY_CODE } from './config.js';

// --- Helper ---
const createSlug = (text) => {
  if (!text) return '';
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\u0020a-z0-9-]/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
};

export function StoreSettingsForm() {
  const { store, user, services, showError, showSuccess, onOpenUpgradeModal } = useOutletContext();
  const { db, storage, functions } = services; 
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#6D28D9');
  const [customPath, setCustomPath] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false); // For SmartButton
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Track unsaved changes

  const currentPlanId = store?.planId || 'free';
  const isFreePlan = currentPlanId === 'free';
  const isProPlan = currentPlanId === 'pro';
  const hasBasic = currentPlanId === 'basic' || isProPlan;

  // Initialize
  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setPhone(store.phone || '');
      setLogoUrl(store.logoUrl || '');
      setThemeColor(store.themeColor || '#6D28D9');
      setCustomPath(store.customPath || '');
      setMonthlyTarget(store.monthlyTarget ? String(store.monthlyTarget) : ''); 
    }
  }, [store]);

  // Warn on exit if dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleLogoUpload = async (file) => {
    if (!file) return;
    if (!storage || !user) { showError('Storage service is not available.'); return; }
    setUploadLoading(true);
    try {
      const storageRef = ref(storage, `store_logos/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setLogoUrl(url);
      setIsDirty(true);
      showSuccess('Logo uploaded! Save to apply.');
    } catch (error) {
      showError(`Upload failed: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleGenerateTheme = async () => {
    if (!name) return showError('Please enter a store name first');
    setAiLoading(true); 
    try {
      const generateColor = httpsCallable(functions, 'generateBrandColor');
      const result = await generateColor({ storeName: name, mood: 'Trustworthy' }); 
      setThemeColor(result.data.color);
      setIsDirty(true);
      showSuccess(`Generated theme color!`);
    } catch (error) {
      console.error('Theme Gen Error:', error);
      showError('Failed to generate theme');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db || !user) { showError('Database service is not available.'); return; }
    if (isProPlan && customPath && !/^[a-z0-9-]+$/.test(customPath)) {
      showError('Custom Path can only contain lowercase letters, numbers, and dashes.');
      return;
    }
    setLoading(true);
    setSaveSuccess(false);
    try {
      const parsedTarget = parseFloat(monthlyTarget) || 0;
      const storeRef = doc(db, 'stores', user.uid);
      const storeData = {
        name, phone,
        logoUrl: isFreePlan ? '' : logoUrl,
        themeColor: isFreePlan ? '#6D28D9' : themeColor,
        customPath: isProPlan ? customPath.trim() : '',
        name_slug: createSlug(name),
        monthlyTarget: hasBasic ? parsedTarget : 0,
      };
      await updateDoc(storeRef, storeData);
      setSaveSuccess(true);
      setIsDirty(false);
    } catch (error) {
      showError(`Save failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const presetColors = [ '#6D28D9', '#DB2777', '#E11D48', '#EA580C', '#EAB308', '#22C55E', '#14B8A6', '#0EA5E9', '#3B82F6', '#1F2937' ];

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8 pb-24">
      
      {/* Card 1: Basic Info */}
      <div className="card p-6 space-y-6">
        <h2 className="card-header">
          <Store className="w-5 h-5 mr-2 text-primary-600" /> Store Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Store Name" value={name} onChange={setName} required maxLength={50} id="store-name" placeholder="My Awesome Shop" onChangeCapture={() => setIsDirty(true)} />
          <Input label="Public Phone Number" value={phone} onChange={setPhone} maxLength={20} id="store-phone" placeholder="079 123 4567" onChangeCapture={() => setIsDirty(true)} />
        </div>
      </div>

      {/* Card 2: Sales Target */}
      {hasBasic ? (
        <div className="card p-6 space-y-6">
          <h2 className="card-header">
            <Zap className="w-5 h-5 mr-2 text-subscription-basic" /> Sales Target
          </h2>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Input label={`Monthly Revenue Goal (${CURRENCY_CODE})`} type="number" step="1" min="0" value={monthlyTarget} onChange={setMonthlyTarget} id="store-target" placeholder="1000" onChangeCapture={() => setIsDirty(true)} />
              <p className="text-xs text-gray-500 mt-2">We'll track this on your dashboard to keep you motivated.</p>
            </div>
          </div>
        </div>
      ) : (
        <LockedFeatureCard title="Sales Target" description="Set monthly goals to visually track your revenue progress." icon={Zap} planName="Basic" onUpgrade={onOpenUpgradeModal} />
      )}

      {/* Card 3: Customization */}
      {hasBasic ? (
        <div className="card p-6 space-y-6">
          <h2 className="card-header">
            <Palette className="w-5 h-5 mr-2 text-primary-600" /> Branding & Look
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Store Logo</label>
              <div className="flex items-center gap-4">
                <ProductImage src={logoUrl} alt="Store Logo" className="w-20 h-20 rounded-xl object-contain bg-gray-50 border border-gray-200 p-2" />
                <div>
                  <label htmlFor="logo-upload" className="btn-secondary-sm cursor-pointer flex items-center w-fit">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadLoading ? 'Uploading...' : 'Upload Logo'}
                  </label>
                  <input id="logo-upload" type="file" accept="image/png, image/jpeg" className="sr-only" onChange={(e) => handleLogoUpload(e.target.files[0])} disabled={uploadLoading} />
                  <p className="text-xs text-gray-400 mt-2">Recommended: 512x512px</p>
                </div>
              </div>
            </div>

            {/* Color Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Theme Color</label>
                <button type="button" onClick={handleGenerateTheme} disabled={aiLoading || !name} className="text-xs flex items-center text-primary-600 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                  {aiLoading ? <span className="animate-pulse">Generating...</span> : <><Sparkles className="w-3 h-3 mr-1" /> Ask AI to choose</>}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input type="color" value={themeColor} onChange={(e) => { setThemeColor(e.target.value); setIsDirty(true); }} className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer p-1 bg-white" />
                <div className="flex flex-wrap gap-2">
                  {presetColors.map(color => (
                    <button key={color} type="button" onClick={() => { setThemeColor(color); setIsDirty(true); }} className={`w-6 h-6 rounded-full border transition-transform ${themeColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <LockedFeatureCard title="Professional Branding" description="Remove the 'Powered by' badge and customize your logo and colors." icon={Palette} planName="Basic" onUpgrade={onOpenUpgradeModal} />
      )}
      
      {/* Card 4: Custom Path */}
      {isProPlan ? (
        <div className="card p-6 space-y-6">
          <h2 className="card-header">
            <Lock className="w-5 h-5 mr-2 text-subscription-pro" /> Custom Store Link
          </h2>
          <div className="space-y-2">
             <label className="block text-sm font-medium text-gray-700">Your Store URL</label>
             <div className="flex items-center">
              <span className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-l-lg border border-r-0 border-gray-300 text-sm font-mono">
                {window.location.origin}/
              </span>
              <input
                type="text"
                value={customPath}
                onChange={(e) => { setCustomPath(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setIsDirty(true); }}
                className="flex-1 block w-full px-4 py-2.5 border border-gray-300 rounded-r-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono outline-none"
                placeholder="my-store-name"
              />
            </div>
            <p className="text-xs text-gray-500">This is the link you share with customers.</p>
          </div>
        </div>
      ) : (
        <LockedFeatureCard title="Custom Store Link" description="Get a clean, professional URL for your store (e.g., webjor.live/my-brand)." icon={LayoutTemplate} planName="Pro" onUpgrade={onOpenUpgradeModal} />
      )}

      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-nav md:static md:bg-transparent md:border-0 md:p-0 md:z-auto">
         <div className="max-w-3xl mx-auto flex items-center justify-between md:justify-end gap-4">
            {isDirty && <span className="text-sm text-amber-600 font-medium hidden md:block">Unsaved changes</span>}
            <SmartSaveButton 
              isLoading={loading} 
              isSuccess={saveSuccess} 
              disabled={!isDirty && !loading} 
              onClick={handleSubmit} 
              className="w-full md:w-auto md:px-10 shadow-lg"
            />
         </div>
      </div>
    </form>
  );
}