// src/StoreSettingsForm.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { Loader2, Upload, Sparkles, Lock, Zap, Palette } from 'lucide-react';
import { Input } from './Forminput.jsx';
import { ProductImage } from './ProductImage.jsx';
import { LockedFeatureCard } from './components/shared/LockedFeatureCard.jsx'; 

// --- 1. ADD A HELPER FUNCTION TO CREATE SLUGS ---
const createSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\u0600-\u06FF\u0020a-z0-9-]/g, '') // Remove special chars, allow Arabic
    .replace(/--+/g, '-') // Replace multiple -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

import { useOutletContext } from 'react-router-dom';
// ...
export function StoreSettingsForm() {
  const { store, user, services, showError, showSuccess, onOpenUpgradeModal } = useOutletContext();
  const { db, storage, functions } = services; // Get services from the context
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [themeColor, setThemeColor] = useState('#6D28D9');
  const [customPath, setCustomPath] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Plan logic
  const currentPlanId = store?.planId || 'free';
  const isFreePlan = currentPlanId === 'free';
  const isBasicPlan = currentPlanId === 'basic';
  const isProPlan = currentPlanId === 'pro';

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
    if (!storage || !user) {
      showError('Storage service is not available.');
      return;
    }
    setUploadLoading(true);
    try {
      const storageRef = ref(storage, `store_logos/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setLogoUrl(url);
      setLogoFile(null);
      showSuccess('Logo uploaded!');
    } catch (error) {
      showError(`Upload failed: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const generateAiColor = async () => {
    if (isFreePlan) {
      onOpenUpgradeModal();
      return;
    }
    setAiLoading(true);
    try {
      const generateColor = httpsCallable(functions, 'generateBrandColor');
      const result = await generateColor({ storeName: name });
      if (result.data.color) {
        setThemeColor(result.data.color);
        showSuccess('AI color generated!');
      } else {
        throw new Error('AI failed to generate a color.');
      }
    } catch (error) {
      showError(`AI Error: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db || !user) {
      showError('Database service is not available.');
      return;
    }
    
    if (isProPlan && customPath && !/^[a-z0-9-]+$/.test(customPath)) {
      showError('Custom Path can only contain lowercase letters, numbers, and dashes.');
      return;
    }

    setLoading(true);
    try {
      const parsedTarget = parseFloat(monthlyTarget) || 0;
      
      const storeRef = doc(db, 'stores', user.uid);
      
      // --- 2. ADD name_slug TO THE DATA ---
      const storeData = {
        name,
        phone,
        logoUrl: isFreePlan ? '' : logoUrl,
        themeColor: isFreePlan ? '#6D28D9' : themeColor,
        // Pro users use customPath, everyone else uses name_slug
        customPath: isProPlan ? customPath.trim() : '',
        name_slug: createSlug(name), // This will update the slug on every save
        monthlyTarget: (isBasicPlan || isProPlan) ? parsedTarget : 0,
      };

      await updateDoc(storeRef, storeData);
      showSuccess('Store settings saved!');
    } catch (error) {
      showError(`Save failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const presetColors = [
    '#6D28D9', '#DB2777', '#E11D48', '#EA580C', '#EAB308',
    '#22C55E', '#14B8A6', '#0EA5E9', '#3B82F6', '#1F2937'
  ];

  return (
    <form onSubmit={handleSubmit} className="card p-6 max-w-2xl mx-auto space-y-6">
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Store Information</h2>
        <Input 
          label="Store Name" 
          value={name} 
          onChange={setName} 
          required 
          maxLength={50}
          id="store-name"
        />
        <Input 
          label="Public Phone Number (Optional)" 
          value={phone} 
          onChange={setPhone} 
          maxLength={20}
          id="store-phone"
          placeholder="e.g., 079 123 4567"
        />
      </div>

      {(isBasicPlan || isProPlan) ? (
        <div className="space-y-4 card p-4 bg-gray-50 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-subscription-basic" />
            Sales Target (Basic Feature)
          </h2>
          <Input 
            label="Monthly Sales Target (JOD)" 
            type="number"
            step="1"
            min="0"
            value={monthlyTarget} 
            onChange={setMonthlyTarget} 
            id="store-target"
            placeholder="e.g., 1000"
          />
        </div>
      ) : (
        <LockedFeatureCard
          title="Sales Target"
          description="Set monthly goals to visually track your revenue progress on the dashboard."
          icon={Zap}
          planName="Basic"
          onUpgrade={onOpenUpgradeModal}
        />
      )}

      {(isBasicPlan || isProPlan) ? (
        <div className="space-y-4 card p-4 bg-gray-50 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Store Customization (Basic Features)
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Logo
            </label>
            <div className="flex items-center gap-4">
              <ProductImage 
                src={logoUrl} 
                alt="Store Logo"
                className="w-16 h-16 rounded-lg object-cover bg-gray-100 border"
              />
              <label htmlFor="logo-upload" className="btn-secondary cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploadLoading ? 'Uploading...' : 'Upload Logo'}
              </label>
              <input 
                id="logo-upload"
                type="file" 
                accept="image/png, image/jpeg"
                className="sr-only"
                onChange={(e) => handleLogoUpload(e.target.files[0])}
                disabled={uploadLoading}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Theme Color
              </label>
              <button
                type="button"
                onClick={generateAiColor}
                disabled={aiLoading}
                className="btn-secondary text-xs bg-ai-light text-ai hover:bg-ai/20"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                {aiLoading ? "Generating..." : "Generate AI Color"}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-300 overflow-hidden"
              />
              <div className="flex flex-wrap gap-1">
                {presetColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setThemeColor(color)}
                    className={`w-7 h-7 rounded-full border-2 ${themeColor.toLowerCase() === color.toLowerCase() ? 'border-primary-700 ring-2 ring-primary-300' : 'border-white'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <LockedFeatureCard
          title="Look Professional"
          description="Customers trust stores with a logo and brand color. Upgrade to Basic to unlock customization."
          icon={Palette}
          planName="Basic"
          onUpgrade={onOpenUpgradeModal}
        />
      )}
      
      {isProPlan ? (
        <div className="space-y-4 card p-4 bg-gray-50 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Custom Store Path (Pro Feature)
          </h2>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-gray-200 text-gray-600 rounded-l-lg border border-r-0 border-gray-300 text-sm">
              {window.location.origin}/
            </span>
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="my-store-name"
            />
          </div>
        </div>
      ) : (
        <LockedFeatureCard
          title="Custom Store Path"
          description="Get a clean, professional URL for your store (e.g., .../my-store-name)."
          icon={Lock}
          planName="Pro"
          onUpgrade={onOpenUpgradeModal}
        />
      )}

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading || uploadLoading}
          className="btn-primary w-full"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}