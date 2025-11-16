// src/components/dashboard/MarketingPage.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { Percent, Trash2, ToggleLeft, ToggleRight, Plus, Loader2, Calendar, DollarSign, Hash, TrendingDown } from 'lucide-react';

import { useFirebaseServices } from '../../contexts/FirebaseContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { LockedFeatureCard } from '../shared/LockedFeatureCard.jsx';
import { ConfirmModal } from '../../ConfirmModal.jsx';

export function MarketingPage() {
  const { store, onOpenUpgradeModal } = useOutletContext();
  const { db } = useFirebaseServices();
  const { showError, showSuccess } = useNotifications();
  
  const planId = store?.planId || 'free';
  const isPro = planId === 'pro';

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);

  // List state
  const [discountCodes, setDiscountCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch discount codes
  useEffect(() => {
    if (!isPro || !store?.id) return;
    
    fetchDiscountCodes();
  }, [isPro, store?.id]);

  const fetchDiscountCodes = async () => {
    setIsLoading(true);
    try {
      const codesRef = collection(db, 'stores', store.id, 'discountCodes');
      const q = query(codesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const codes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDiscountCodes(codes);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      showError('Failed to load discount codes');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!code.trim()) {
      showError('Please enter a discount code');
      return false;
    }

    if (code.trim().length < 3) {
      showError('Discount code must be at least 3 characters');
      return false;
    }

    if (!discountValue || isNaN(discountValue) || Number(discountValue) <= 0) {
      showError('Please enter a valid discount value');
      return false;
    }

    if (discountType === 'percentage' && Number(discountValue) > 100) {
      showError('Percentage discount cannot exceed 100%');
      return false;
    }

    if (minOrderAmount && (isNaN(minOrderAmount) || Number(minOrderAmount) < 0)) {
      showError('Minimum order amount must be a valid number');
      return false;
    }

    if (usageLimit && (isNaN(usageLimit) || Number(usageLimit) <= 0)) {
      showError('Usage limit must be a positive number');
      return false;
    }

    // Check if code already exists
    const codeUpper = code.trim().toUpperCase();
    const exists = discountCodes.some(dc => dc.code === codeUpper);
    if (exists) {
      showError('This discount code already exists');
      return false;
    }

    return true;
  };

  const handleCreateCode = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const codesRef = collection(db, 'stores', store.id, 'discountCodes');
      
      const newCode = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        expiryDate: expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        usageCount: 0,
        isActive,
        createdAt: serverTimestamp()
      };

      await addDoc(codesRef, newCode);
      
      showSuccess('Discount code created successfully!');
      
      // Reset form
      setCode('');
      setDiscountValue('');
      setMinOrderAmount('');
      setExpiryDate('');
      setUsageLimit('');
      setIsActive(true);
      
      // Refresh list
      fetchDiscountCodes();
    } catch (error) {
      console.error('Error creating discount code:', error);
      showError('Failed to create discount code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (codeData) => {
    try {
      const codeRef = doc(db, 'stores', store.id, 'discountCodes', codeData.id);
      await updateDoc(codeRef, {
        isActive: !codeData.isActive
      });
      
      showSuccess(`Discount code ${!codeData.isActive ? 'activated' : 'deactivated'}`);
      fetchDiscountCodes();
    } catch (error) {
      console.error('Error toggling discount code:', error);
      showError('Failed to update discount code');
    }
  };

  const confirmDelete = (codeData) => {
    setCodeToDelete(codeData);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!codeToDelete) return;

    setIsDeleting(true);
    try {
      const codeRef = doc(db, 'stores', store.id, 'discountCodes', codeToDelete.id);
      await deleteDoc(codeRef);
      
      showSuccess('Discount code deleted successfully');
      setDeleteModalOpen(false);
      setCodeToDelete(null);
      fetchDiscountCodes();
    } catch (error) {
      console.error('Error deleting discount code:', error);
      showError('Failed to delete discount code');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCodeStatus = (codeData) => {
    if (!codeData.isActive) {
      return { label: 'Inactive', color: 'bg-gray-100 text-gray-600' };
    }

    // Check if expired
    if (codeData.expiryDate) {
      const expiryTimestamp = codeData.expiryDate.toDate();
      if (expiryTimestamp < new Date()) {
        return { label: 'Expired', color: 'bg-red-100 text-red-600' };
      }
    }

    // Check if usage limit reached
    if (codeData.usageLimit && codeData.usageCount >= codeData.usageLimit) {
      return { label: 'Limit Reached', color: 'bg-orange-100 text-orange-600' };
    }

    return { label: 'Active', color: 'bg-green-100 text-green-600' };
  };

  const formatDiscount = (codeData) => {
    if (codeData.discountType === 'percentage') {
      return `${codeData.discountValue}% off`;
    } else {
      return `${codeData.discountValue} JOD off`;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No expiry';
    return timestamp.toDate().toLocaleDateString('en-GB');
  };

  // --- If the user is NOT Pro, show the locked card ---
  if (!isPro) {
    return (
      <div className="max-w-screen-2xl mx-auto p-4 md:p-8">
        <LockedFeatureCard
          title="Unlock Your Revenue Engine"
          description="Create discount codes, run sales, and track influencer campaigns. This is the #1 tool for growing your sales."
          icon={Percent}
          planName="Pro"
          onUpgrade={onOpenUpgradeModal}
        />
      </div>
    );
  }

  // --- If the user IS Pro, show the actual feature ---
  return (
    <div className="max-w-screen-2xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Marketing & Discounts
        </h2>
        <p className="text-gray-600">
          Create and manage discount codes, flash sales, and influencer campaigns.
        </p>
      </div>

      {/* Create New Discount Form */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-primary-600" />
          Create New Discount Code
        </h3>
        
        <form onSubmit={handleCreateCode} className="space-y-4">
          {/* Row 1: Code and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Name *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., EID20, SUMMER50"
                className="input w-full uppercase"
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="input w-full"
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (JOD)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Value and Min Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? '20' : '5'}
                  className="input w-full pl-10"
                  step="0.01"
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="e.g., 50"
                  className="input w-full pl-10"
                  step="0.01"
                  min="0"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum order value to apply discount</p>
            </div>
          </div>

          {/* Row 3: Expiry and Usage Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (Optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="input w-full pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Limit (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="e.g., 100"
                  className="input w-full pl-10"
                  min="1"
                  step="1"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Hash className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Max number of times this code can be used</p>
            </div>
          </div>

          {/* Row 4: Active Toggle */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">
              {isActive ? 'Active' : 'Inactive'}
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Discount Code
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Discount Codes */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Your Discount Codes
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : discountCodes.length === 0 ? (
          <div className="text-center py-12">
            <Percent className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No discount codes yet. Create your first one above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min. Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discountCodes.map((codeData) => {
                  const status = getCodeStatus(codeData);
                  return (
                    <tr key={codeData.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{codeData.code}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDiscount(codeData)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {codeData.minOrderAmount ? `${codeData.minOrderAmount} JOD` : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{formatDate(codeData.expiryDate)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {codeData.usageCount} {codeData.usageLimit ? `/ ${codeData.usageLimit}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleActive(codeData)}
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                            title={codeData.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {codeData.isActive ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => confirmDelete(codeData)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Discount Code"
        message={`Are you sure you want to delete the discount code "${codeToDelete?.code}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCodeToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
