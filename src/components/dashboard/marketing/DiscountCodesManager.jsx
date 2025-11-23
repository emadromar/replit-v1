// src/components/dashboard/marketing/DiscountCodesManager.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc, doc,
  serverTimestamp, Timestamp, query, orderBy
} from 'firebase/firestore';
import { Percent, Trash2, Plus, Loader2, Calendar, DollarSign, Hash, ChevronDown, Copy, Check, Tag, Ticket, Edit, MoreHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from '@headlessui/react';

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

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null); // Track if we are editing

  const [discountCodes, setDiscountCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

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

  const resetForm = () => {
    setCode('');
    setDiscountValue('');
    setMinOrderAmount('');
    setExpiryDate('');
    setUsageLimit('');
    setIsActive(true);
    setEditingId(null);
    setDiscountType('percentage');
  };

  const handleEditClick = (dc) => {
    setCode(dc.code);
    setDiscountType(dc.discountType);
    setDiscountValue(dc.discountValue);
    setMinOrderAmount(dc.minOrderAmount || '');
    setUsageLimit(dc.usageLimit || '');
    setIsActive(dc.isActive);

    // Handle Date conversion
    if (dc.expiryDate) {
      const date = dc.expiryDate.toDate();
      setExpiryDate(date.toISOString().split('T')[0]);
    } else {
      setExpiryDate('');
    }

    setEditingId(dc.id);
    setIsFormOpen(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) return showError('Enter a code');
    if (!discountValue) return showError('Enter a value');

    setIsSaving(true);
    try {
      const codeData = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        expiryDate: expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive,
      };

      if (editingId) {
        // Update existing
        await updateDoc(doc(db, 'stores', store.id, 'discountCodes', editingId), {
          ...codeData,
          updatedAt: serverTimestamp()
        });
        showSuccess('Code updated!');
      } else {
        // Create new
        await addDoc(collection(db, 'stores', store.id, 'discountCodes'), {
          ...codeData,
          usageCount: 0,
          createdAt: serverTimestamp()
        });
        showSuccess('Code created!');
      }

      resetForm();
      setIsFormOpen(false);
      fetchDiscountCodes();
    } catch (error) {
      console.error(error);
      showError('Failed to save code');
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
      setDiscountCodes(prev => prev.map(c => c.id === codeData.id ? { ...c, isActive: !c.isActive } : c));
    } catch (error) { showError('Failed to update'); }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showSuccess('Code copied!');
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
    <div className="space-y-8">
      {/* Create/Edit Form Toggle */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
        <button
          onClick={() => {
            if (isFormOpen && editingId) {
              resetForm(); // Cancel edit if closing
            }
            setIsFormOpen(!isFormOpen);
          }}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-colors ${isFormOpen ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-600 group-hover:bg-primary-100'}`}>
              {editingId ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Discount Code' : 'Create New Discount'}
              </h3>
              <p className="text-sm text-gray-500">
                {editingId ? `Updating code: ${code}` : 'Set up percentage or fixed amount codes'}
              </p>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isFormOpen ? 'bg-gray-100 rotate-180' : 'bg-transparent'}`}>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-gray-100"
            >
              <form onSubmit={handleSaveCode} className="p-6 md:p-8 space-y-8 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Code Details */}
                  <div className="space-y-5">
                    <h4 className="flex items-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                      <Tag className="w-4 h-4 mr-2 text-primary-500" />
                      Code Details
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="label">Code Name</label>
                        <div className="relative group">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className="input pl-10 uppercase font-bold tracking-wide text-lg"
                            placeholder="SUMMER20"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  {/* Restrictions */}
                  <div className="space-y-5">
                    <h4 className="flex items-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                      <Ticket className="w-4 h-4 mr-2 text-primary-500" />
                      Restrictions (Optional)
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Min Order</label>
                          <div className="relative group">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input type="number" value={minOrderAmount} onChange={e => setMinOrderAmount(e.target.value)} className="input pl-9" placeholder="0.00" />
                          </div>
                        </div>
                        <div>
                          <label className="label">Usage Limit</label>
                          <input type="number" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} className="input" placeholder="∞" />
                        </div>
                      </div>
                      <div>
                        <label className="label">Expiry Date</label>
                        <div className="relative group">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                          <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="input pl-10" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setIsActive(!isActive)}>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isActive ? 'bg-primary-600' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 select-none">{isActive ? 'Active Immediately' : 'Save as Inactive'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => { resetForm(); setIsFormOpen(false); }}
                        className="btn-secondary px-6 py-3"
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" disabled={isSaving} className="btn-primary px-8 py-3 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transform hover:-translate-y-0.5 transition-all">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? 'Update Code' : 'Create Code')}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Premium Table Layout */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" /></div>
        ) : discountCodes.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Ticket className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No active coupons</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">Create your first discount code to start running sales and tracking your marketing campaigns.</p>
            <button onClick={() => setIsFormOpen(true)} className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
              Create your first code
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Expires</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {discountCodes.map((dc) => (
                  <tr key={dc.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(dc)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${dc.isActive
                            ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                      >
                        {dc.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-gray-900 text-base">{dc.code}</span>
                        <button
                          onClick={() => copyToClipboard(dc.code, dc.id)}
                          className="text-gray-300 hover:text-primary-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Copy Code"
                        >
                          {copiedId === dc.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center mr-3 text-primary-600">
                          {dc.discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {dc.discountType === 'percentage' ? `${dc.discountValue}%` : `${CURRENCY_CODE} ${dc.discountValue}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{dc.usageCount || 0}</span>
                        {dc.usageLimit && <span className="text-gray-400 mx-1">/</span>}
                        {dc.usageLimit && <span>{dc.usageLimit}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {dc.expiryDate ? (
                        <span className={`text-sm ${new Date(dc.expiryDate.toDate()) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {dc.expiryDate.toDate().toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </Menu.Button>
                        <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="p-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleEditClick(dc)}
                                  className={`${active ? 'bg-primary-50 text-primary-700' : 'text-gray-700'} group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => { setCodeToDelete(dc); setDeleteModalOpen(true); }}
                                  className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'} group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Code"
        message="Are you sure? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
