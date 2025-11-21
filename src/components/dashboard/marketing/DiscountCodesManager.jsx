// src/components/dashboard/marketing/DiscountCodesManager.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc, doc,
  serverTimestamp, Timestamp, query, orderBy
} from 'firebase/firestore';
import { Percent, Trash2, ToggleLeft, ToggleRight, Plus, Loader2, Calendar, DollarSign, Hash, TrendingDown } from 'lucide-react';

// --- Adjusted Imports for new folder structure ---
import { CURRENCY_CODE } from '../../../config.js';
import { useFirebaseServices } from '../../../contexts/FirebaseContext.jsx';
import { useNotifications } from '../../../contexts/NotificationContext.jsx';
import { LockedFeatureCard } from '../../shared/LockedFeatureCard.jsx';
import { ConfirmModal } from '../../../ConfirmModal.jsx';

export function DiscountCodesManager() {
  const { store, onOpenUpgradeModal } = useOutletContext();
  const { db } = useFirebaseServices();
  const { showError, showSuccess } = useNotifications();
  
  const planId = store?.planId || 'free';
  const isPro = planId === 'pro';

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [discountCodes, setDiscountCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setDiscountCodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      showError('Failed to load discount codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) return showError('Enter a code');
    if (!discountValue) return showError('Enter a value');
    
    setIsSaving(true);
    try {
      const codesRef = collection(db, 'stores', store.id, 'discountCodes');
      await addDoc(codesRef, {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        expiryDate: expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        usageCount: 0,
        isActive,
        createdAt: serverTimestamp()
      });
      
      showSuccess('Code created!');
      setCode(''); setDiscountValue(''); setMinOrderAmount(''); setExpiryDate(''); setUsageLimit('');
      fetchDiscountCodes();
    } catch (error) {
      showError('Failed to create code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!codeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'stores', store.id, 'discountCodes', codeToDelete.id));
      showSuccess('Code deleted');
      setDeleteModalOpen(false);
      fetchDiscountCodes();
    } catch (error) {
      showError('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (codeData) => {
    try {
      await updateDoc(doc(db, 'stores', store.id, 'discountCodes', codeData.id), {
        isActive: !codeData.isActive
      });
      fetchDiscountCodes();
    } catch (error) { showError('Failed to update'); }
  };

  if (!isPro) {
    return (
      <div className="p-4">
        <LockedFeatureCard
          title="Unlock Revenue Engine"
          description="Create discount codes to run sales and track influencers."
          icon={Percent}
          planName="Pro"
          onUpgrade={onOpenUpgradeModal}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-primary-600" /> Create New Code
        </h3>
        <form onSubmit={handleCreateCode} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Code Name</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)} className="input uppercase" placeholder="SUMMER20" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="label">Type</label>
                    <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="input">
                        <option value="percentage">Percent %</option>
                        <option value="fixed">Fixed {CURRENCY_CODE}</option>
                    </select>
                </div>
                <div>
                    <label className="label">Value</label>
                    <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="input" placeholder="20" required />
                </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
             <div className="flex items-center space-x-3">
                <button type="button" onClick={() => setIsActive(!isActive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-primary-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-gray-700">{isActive ? 'Active' : 'Inactive'}</span>
             </div>
             <button type="submit" disabled={isSaving} className="btn-primary px-6">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Code'}
             </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600"/></div>
        ) : discountCodes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No active codes. Create one above!</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {discountCodes.map((dc) => (
                <tr key={dc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{dc.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {dc.discountType === 'percentage' ? `${dc.discountValue}%` : `${dc.discountValue} ${CURRENCY_CODE}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dc.usageCount || 0} used</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleToggleActive(dc)} className="text-gray-400 hover:text-primary-600">
                        {dc.isActive ? <ToggleRight className="w-5 h-5"/> : <ToggleLeft className="w-5 h-5"/>}
                    </button>
                    <button onClick={() => { setCodeToDelete(dc); setDeleteModalOpen(true); }} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Code"
        message="Are you sure?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}