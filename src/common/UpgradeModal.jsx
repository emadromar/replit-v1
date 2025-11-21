// src/common/UpgradeModal.jsx

import React, { useState, useEffect, useRef } from 'react';
// --- FIX: ADDED 'collection', 'query', 'where', 'getDocs' ---
import {
  doc,
  addDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions'; // This isn't used, but it's okay
import { X, Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { CURRENCY_CODE } from '../config.js';
// --- FIX: Corrected the path from ../../ to ../ ---
import { PLAN_DETAILS } from '../config.js'; // <-- THIS WAS CHANGED

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlanId,
  storeId,
  db,
  storage,
  showError,
  showSuccess,
  storeEmail,
  sendSystemNotification,
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlanId(
        currentPlanId === 'free'
          ? 'basic'
          : currentPlanId === 'basic'
          ? 'pro'
          : null
      );
      checkPendingRequests();
    } else {
      setSelectedPlanId(null);
      setPaymentProofFile(null);
      setLoading(false);
      setHasPendingRequest(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen, currentPlanId, db, storeId, showError]); // Added dependencies

  const checkPendingRequests = async () => {
    if (!storeId || !db) return;
    try {
      // --- These functions will now work ---
      const requestsRef = collection(db, 'stores', storeId, 'subscriptionRequests');
      const q = query(requestsRef, where('status', '==', 'pending_review'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setHasPendingRequest(true);
        showError(
          'You already have a pending upgrade request. Please wait for admin review.'
        );
      } else {
        setHasPendingRequest(false);
      }
    } catch (e) {
      console.error('Error checking pending requests:', e);
      setHasPendingRequest(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      showError('File is too large (max 5MB).');
      setPaymentProofFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setPaymentProofFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasPendingRequest) {
      showError('A request is already pending. Cannot submit another.');
      return;
    }
    if (!selectedPlanId || !paymentProofFile) {
      showError('Please select a plan and upload payment proof.');
      return;
    }
    setLoading(true);

    try {
      const timestamp = Date.now();
      const safeFileName = paymentProofFile.name.replace(
        /[^a-zA-Z0-9.\-_]/g,
        '_'
      );
      const fileName = `${storeId}-upgrade-${selectedPlanId}-${timestamp}-${safeFileName}`;
      const proofRef = ref(storage, `subscription_proofs/${storeId}/${fileName}`);

      // Show a loading message, not an error
      showSuccess('Uploading proof... Do not close this.');
      await uploadBytes(proofRef, paymentProofFile);
      const paymentProofUrl = await getDownloadURL(proofRef);

      const requestsRef = collection(db, 'stores', storeId, 'subscriptionRequests');
      await addDoc(requestsRef, {
        requestedPlanId: selectedPlanId,
        paymentProofUrl: paymentProofUrl,
        status: 'pending_review',
        requestedAt: serverTimestamp(),
        userId: storeId,
      });

      sendSystemNotification(
        storeId,
        storeEmail,
        currentPlanId,
        'upgrade_submitted',
        `Subscription Request submitted for ${PLAN_DETAILS[selectedPlanId].name}. Waiting for Admin approval.`
      );

      showSuccess('Upgrade request submitted! Admin will review payment soon.');
      setHasPendingRequest(true);
      onClose();
    } catch (error) {
      console.error('Upgrade request submission error:', error);
      showError(`Submission failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const plansToShow = Object.entries(PLAN_DETAILS)
    .filter(([id]) => id !== 'free')
    .sort(([idA], [idB]) => (idA === 'basic' ? -1 : 1));

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Upgrade Your Plan
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {hasPendingRequest && (
            <div className="p-4">
              {' '}
              {/* Added padding */}
              <div
                className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-lg shadow-sm"
                role="alert"
              >
                <p className="font-bold text-sm">Action Blocked</p>
                <p className="text-xs">
                  You have an existing request pending review. Please wait for an
                  update.
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Plan Selection */}
            <div
              className={
                hasPendingRequest ? 'opacity-50 pointer-events-none' : ''
              }
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Plan to Upgrade/Renew To:
              </label>
              <div className="space-y-3">
                {plansToShow.map(([id, details]) => (
                  <label
                    key={id}
                    className={`flex items-start p-4 border rounded-md cursor-pointer transition ${
                      selectedPlanId === id
                        ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="planSelection"
                      value={id}
                      checked={selectedPlanId === id}
                      onChange={() => setSelectedPlanId(id)}
                      className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 mt-1"
                      disabled={hasPendingRequest}
                    />
                    <div className="ml-3 flex-1">
                      <span className="block text-sm font-semibold text-gray-900">
                        {details.name}
                      </span>
                      <span className="block text-sm text-indigo-600 font-medium">
                        {details.price}
                      </span>
                      <ul className="text-xs text-gray-500 mt-1 list-disc list-inside space-y-0.5">
                        <li>
                          {details.limits.products === Infinity
                            ? 'Unlimited'
                            : `Up to ${details.limits.products}`}{' '}
                          Products
                        </li>
                        {details.limits.bulkImport && (
                          <li>Bulk Import Enabled</li>
                        )}
                        {details.limits.customPath && <li>Custom Path</li>}
                        {details.limits.logo && <li>Store Logo</li>}
                        <li>{details.limits.images} Image(s) per Product</li>
                      </ul>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Instructions */}
            {selectedPlanId && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 space-y-2">
                <h3 className="text-sm font-semibold text-blue-800">
                  Payment Instructions (CLIQ)
                </h3>
                <p className="text-xs text-gray-700">
                  Please transfer{' '}
                  <strong>
                    {PLAN_DETAILS[selectedPlanId]?.price.split('/')[0]} ${CURRENCY_CODE}
                  </strong>{' '}
                  via CLIQ to:
                </p>
                <div className="text-xs text-gray-900 bg-white p-2 rounded border border-gray-200 font-mono">
                  Bank: Arab Bank
                  <br />
                  Alias/Phone: EMADOMARRR
                </div>
                <p className="text-xs text-red-700 font-medium">
                  After transferring, upload a screenshot below.
                </p>
              </div>
            )}

            {/* File Upload */}
            <div
              className={
                hasPendingRequest ? 'opacity-50 pointer-events-none' : ''
              }
            >
              <label
                htmlFor="paymentProofInputModal"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Upload Payment Proof <span className="text-red-500">*</span>
              </label>
              <input
                id="paymentProofInputModal"
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/gif, application/pdf"
                onChange={handleFileChange}
                required
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                disabled={hasPendingRequest}
              />
              {paymentProofFile && (
                <p className="mt-2 text-xs text-green-600 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> Selected:{' '}
                  {paymentProofFile.name} (
                  {(paymentProofFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={
                  loading ||
                  !selectedPlanId ||
                  !paymentProofFile ||
                  hasPendingRequest
                }
                className="w-full flex justify-center items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  'Submit Request for Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}