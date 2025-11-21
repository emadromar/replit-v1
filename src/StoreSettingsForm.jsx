// src/StoreSettingsForm.jsx

import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
// FIX 1: Consolidated imports (removed duplicate Palette/Wand2 lines)
import { Loader2, Upload, Sparkles, Lock, Zap, Palette, Store, Wand2 } from 'lucide-react';
import { Input } from './Forminput.jsx';
import { ProductImage } from './ProductImage.jsx';
import { LockedFeatureCard } from './components/shared/LockedFeatureCard.jsx'; 
import { useOutletContext } from 'react-router-dom';
import { CURRENCY_CODE } from './config.js'; // Ensure this is imported

// --- Helper ---
const createSlug = (text) => {
  if (!text) return '';
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\u0020a-z0-9-]/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
};

export function StoreSettingsForm() {
  const { store, user, services, showError, showSuccess, onOpenUpgradeModal } = useOutletContext();
  const { db, storage, functions } = services; 
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#6D28D9');
  const [customPath, setCustomPath] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [themeMood, setThemeMood] = useState('Trustworthy');
  
  const currentPlanId = store?.planId || 'free';
  const isFreePlan = currentPlanId === 'free';
  const isBasicPlan = currentPlanId === 'basic';
  const isProPlan = currentPlanId === 'pro';
  const hasBasic = isBasicPlan || isProPlan;

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

  const handleLogoUpload = async (file) => {
    if (!file) return;
    if (!storage || !user) { showError('Storage service is not available.'); return; }
    setUploadLoading(true);
    try {
      const storageRef = ref(storage, `store_logos/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setLogoUrl(url);
      showSuccess('Logo uploaded!');
    } catch (error) {
      showError(`Upload failed: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleGenerateTheme = async () => {
    if (!name) return showError('Please enter a store name first');
    // FIX 2: Use correct state setter (setAiLoading instead of setIsGenerating)
    setAiLoading(true); 
    try {
      const generateColor = httpsCallable(functions, 'generateBrandColor');
      const result = await generateColor({ storeName: name, mood: themeMood }); 
      setThemeColor(result.data.color);
      showSuccess(`Generated ${themeMood} theme!`);
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
      showSuccess('Store settings saved!');
    } catch (error) {
      showError(`Save failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const presetColors = [ '#6D28D9', '#DB2777', '#E11D48', '#EA580C', '#EAB308', '#22C55E', '#14B8A6', '#0EA5E9', '#3B82F6', '#1F2937' ];

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Card 1: Basic Info */}
      <div className="card p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center border-b pb-3">
          <Store className="w-5 h-5 mr-2 text-primary-600" /> Store Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Store Name" value={name} onChange={setName} required maxLength={50} id="store-name" placeholder="e.g., My Awesome Shop" />
          <Input label="Public Phone Number" value={phone} onChange={setPhone} maxLength={20} id="store-phone" placeholder="e.g., 079 123 4567" />
        </div>
      </div>

      {/* Card 2: Sales Target */}
      {hasBasic ? (
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center border-b pb-3">
            <Zap className="w-5 h-5 mr-2 text-subscription-basic" /> Sales Target
          </h2>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Input label={`Monthly Revenue Goal (${CURRENCY_CODE})`} type="number" step="1" min="0" value={monthlyTarget} onChange={setMonthlyTarget} id="store-target" placeholder="e.g., 1000" />
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
          <h2 className="text-xl font-bold text-gray-900 flex items-center border-b pb-3">
            <Palette className="w-5 h-5 mr-2 text-primary-600" /> Branding & Look
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Store Logo</label>
              <div className="flex items-center gap-4">
                <ProductImage src={logoUrl} alt="Store Logo" className="w-20 h-20 rounded-xl object-contain bg-gray-50 border border-gray-200 p-2" />
                <div>
                  <label htmlFor="logo-upload" className="btn-secondary-sm cursor-pointer flex items-center">
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
                {/* FIX 3: Corrected onClick handler name */}
                <button type="button" onClick={handleGenerateTheme} disabled={aiLoading} className="text-xs flex items-center text-ai font-semibold hover:underline disabled:opacity-50">
                  {aiLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                  {aiLoading ? "Generating..." : "Ask AI to choose"}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer p-1 bg-white" />
                <div className="flex flex-wrap gap-2">
                  {presetColors.map(color => (
                    <button key={color} type="button" onClick={() => setThemeColor(color)} className={`w-6 h-6 rounded-full border ${themeColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
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
          <h2 className="text-xl font-bold text-gray-900 flex items-center border-b pb-3">
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
                onChange={(e) => setCustomPath(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 block w-full px-4 py-2.5 border border-gray-300 rounded-r-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono"
                placeholder="my-store-name"
              />
            </div>
            <p className="text-xs text-gray-500">This is the link you share with customers.</p>
          </div>
        </div>
      ) : (
        <LockedFeatureCard title="Custom Store Link" description="Get a clean, professional URL for your store (e.g., webjor.live/my-brand)." icon={Lock} planName="Pro" onUpgrade={onOpenUpgradeModal} />
      )}

      {/* Sticky Save Button */}
      <div className="fixed bottom-4 left-4 right-4 md:static md:block z-20 md:pt-4">
         <button type="submit" disabled={loading || uploadLoading} className="btn-primary w-full md:w-auto md:px-8 shadow-lg md:shadow-sm">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save All Settings'}
        </button>
      </div>
    </form>
  );
}