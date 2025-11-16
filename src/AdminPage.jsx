// src/AdminPage.jsx

import React, { useState, useEffect, useMemo } from 'react'; 
import { 
    doc, updateDoc, collection, query, 
    where, getDocs, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { 
    Shield, Upload, Eye, CheckCircle, X, UserX, UserCheck, 
    Loader2, Store, DollarSign, Package
} from 'lucide-react';

import { useFirebaseServices } from './contexts/FirebaseContext';
import { useNotifications } from './contexts/NotificationContext';
import { PLAN_DETAILS } from './config.js';
import { FullScreenLoader } from './components/shared/FullScreenLoader.jsx';

// Reusable Stat Card Component (Unchanged)
const AdminStatCard = ({ title, value, icon: Icon, colorClass = 'text-primary-700' }) => (
  <div className="card p-4 bg-gray-50">
    <div className="flex items-center">
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-gray-200`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div className="ml-3 min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  </div>
);


export function AdminPage({ showError, showSuccess }) {
  const [stores, setStores] = useState([]);
  const [requests, setRequests] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // --- FIX 1: Add a new state to trigger refetching ---
  const [forceRefetch, setForceRefetch] = useState(false);

  const { db: firestoreDb } = useFirebaseServices();
  const { sendSystemNotification } = useNotifications();

  // Business Intelligence Calculations (Unchanged)
  const businessStats = useMemo(() => {
    const totalStores = stores.length;
    let freeCount = 0;
    let basicCount = 0;
    let proCount = 0;

    stores.forEach(store => {
      const planId = store.planId || 'free';
      const subEndDate = store.subscriptionEnds?.toDate();
      const isActiveSub = subEndDate ? subEndDate > new Date() : false;

      if (planId === 'basic' && (isActiveSub || store.planId === 'free')) {
        basicCount++;
      } else if (planId === 'pro' && (isActiveSub || store.planId === 'free')) {
        proCount++;
      } else {
        freeCount++;
      }
    });

    const basicPrice = parseFloat(PLAN_DETAILS.basic.price.split(' ')[0]);
    const proPrice = parseFloat(PLAN_DETAILS.pro.price.split(' ')[0]);
    const totalMonthlyRevenue = (basicCount * basicPrice) + (proCount * proPrice);

    return {
      totalStores,
      totalMonthlyRevenue: totalMonthlyRevenue.toFixed(2),
      planCounts: {
        free: freeCount,
        basic: basicCount,
        pro: proCount
      }
    };
  }, [stores]);

  // Handler for Approval
  const handleApproveUpgrade = async (request) => { 
    if (!window.confirm(`Are you sure you want to APPROVE the upgrade to ${PLAN_DETAILS[request.requestedPlanId].name} for store ${request.storeName}?`)) return;

    const subscriptionEnds = new Date();
    subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);
    
    const merchantStore = stores.find(s => s.id === request.storeId);
    const merchantEmail = merchantStore?.email;

    try {
      const storeRef = doc(firestoreDb, "stores", request.storeId);
      await updateDoc(storeRef, {
        planId: request.requestedPlanId,
        subscriptionEnds: subscriptionEnds,
      });

      const requestRef = doc(firestoreDb, "stores", request.storeId, "subscriptionRequests", request.id);
      await updateDoc(requestRef, {
        status: 'completed',
        approvedAt: serverTimestamp(),
      });

      sendSystemNotification(
        request.storeId,
        merchantEmail,
        request.requestedPlanId,
        'upgrade_approved',
        `Success! Your store has been upgraded to the **${PLAN_DETAILS[request.requestedPlanId].name}**. Your plan is now active.`
      );

      showSuccess(`Successfully upgraded ${request.storeName} to ${PLAN_DETAILS[request.requestedPlanId].name}!`);
      
      // --- FIX 2: Trigger a refetch instead of setting loading ---
      setForceRefetch(prev => !prev); 
      
    } catch (err) {
      console.error("Upgrade approval failed:", err);
      showError(`Approval failed: ${err.message}`);
    }
  };
  
  // Handler for Decline
  const handleDeclineRequest = async (request) => {
    if (!window.confirm(`Are you sure you want to DECLINE the request for store ${request.storeName}?`)) return;
    
    const merchantStore = stores.find(s => s.id === request.storeId);
    const merchantEmail = merchantStore?.email;

    try {
      const requestRef = doc(firestoreDb, "stores", request.storeId, "subscriptionRequests", request.id);
      await updateDoc(requestRef, {
        status: 'declined',
        declinedAt: serverTimestamp(),
      });

      sendSystemNotification(
        request.storeId,
        merchantEmail,
        request.requestedPlanId, 
        'upgrade_declined',
        `Your request for the **${PLAN_DETAILS[request.requestedPlanId].name}** was declined. Please check the uploaded proof or contact support.`
      );

      showSuccess(`Successfully declined upgrade request for ${request.storeName}.`);

      // --- FIX 3: Trigger a refetch instead of setting loading ---
      setForceRefetch(prev => !prev);

    } catch (err) {
      console.error("Decline failed:", err);
      showError(`Decline failed: ${err.message}`);
    }
  };

  // Data Fetching Effect
  useEffect(() => {
    if (!firestoreDb) return;
    const fetchData = async () => {
      setLoading(true); // <-- Set loading to true at the START
      try {
        // 1. Fetch All Stores
        const storesRef = collection(firestoreDb, "stores");
        const qStores = query(storesRef, orderBy("createdAt", "desc"));
        const storesSnapshot = await getDocs(qStores);
        const fetchedStores = storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStores(fetchedStores);

        // 2. Fetch All Pending Requests
        const allRequests = [];
        for (const store of fetchedStores) {
          const requestsRef = collection(firestoreDb, "stores", store.id, "subscriptionRequests");
          const qRequests = query(requestsRef, where("status", "==", "pending_review"));
          const requestsSnapshot = await getDocs(qRequests);
          
          requestsSnapshot.forEach(doc => {
            allRequests.push({
              id: doc.id,
              storeId: store.id,
              storeName: store.name,
              ...doc.data()
            });
          });
        }
        setRequests(allRequests.sort((a, b) => b.requestedAt - a.requestedAt)); 

      } catch (err) {
        console.error("Admin data fetch error:", err);
        showError(`Load error: ${err.message}`);
      }
      setLoading(false); // <-- Set loading to false at the END
    };
    fetchData();
  
  // --- FIX 4: Remove 'loading' from dependencies and add 'forceRefetch' ---
  }, [firestoreDb, showError, showSuccess, forceRefetch]); 

  // Store Status Handler (Unchanged)
  const handleSetStoreStatus = async (storeId, newStatus) => {
    if (!firestoreDb) return;
    const action = newStatus ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${action} store ${storeId}?`)) return; 
    try {
      const storeRef = doc(firestoreDb, "stores", storeId);
      await updateDoc(storeRef, { isActive: newStatus });
      setStores(prevStores =>
        prevStores.map(store => store.id === storeId ? { ...store, isActive: newStatus } : store)
      );
      showSuccess(`Store ${action}d.`);
    } catch (err) {
      console.error("Status update error:", err);
      showError(`Update failed: ${err.message}`);
    }
  };


  if (loading) return <FullScreenLoader message="Loading Admin..." />;

  // --- Render (Unchanged) ---
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <Shield className="w-8 h-8 mr-3 text-primary-700" /> Admin Dashboard
      </h1>
      
      {/* --- Business Stats Section (Unchanged) --- */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Business Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AdminStatCard 
            title="Total Stores" 
            value={businessStats.totalStores} 
            icon={Store} 
            colorClass="text-primary-700"
          />
          <AdminStatCard 
            title="Total Monthly Revenue" 
            value={`JOD ${businessStats.totalMonthlyRevenue}`}
            icon={DollarSign} 
            colorClass="text-alert-success"
          />
          <AdminStatCard 
            title="Pro Accounts" 
            value={businessStats.planCounts.pro} 
            icon={Package}
            colorClass="text-subscription-pro"
          />
          <AdminStatCard 
            title="Basic Accounts" 
            value={businessStats.planCounts.basic} 
            icon={Package}
            colorClass="text-subscription-basic"
          />
        </div>
      </div>
      
      {/* --- Pending Subscription Requests Table (Unchanged) --- */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-alert-warning" /> Pending Upgrade Requests 
          {requests.length > 0 && <span className="ml-3 px-3 py-1 text-sm font-bold rounded-full bg-alert-error text-white">{requests.length}</span>}
        </h2>
        
        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">No pending upgrade requests.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Store</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Requested Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Requested At</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Proof</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-yellow-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {req.storeName || 'N/A'} 
                      <span className="block text-xs text-gray-500">ID: {req.storeId.slice(0, 6)}...</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-700">
                      {PLAN_DETAILS[req.requestedPlanId]?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {req.requestedAt?.toDate ? new Date(req.requestedAt.toDate()).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <a 
                        href={req.paymentProofUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View Proof
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex gap-2 justify-center">
                      <button 
                        onClick={() => handleApproveUpgrade(req)}
                        className="btn-secondary bg-green-100 text-green-700 hover:bg-green-200 text-xs"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </button>
                      <button 
                        onClick={() => handleDeclineRequest(req)} 
                        className="btn-secondary-danger bg-red-100 text-red-700 hover:bg-red-200 text-xs"
                      >
                        <X className="w-4 h-4 mr-1" /> Decline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- All Merchant Stores Table (Unchanged) --- */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">All Merchant Stores</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Store (Path)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Owner / Email / Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Store ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stores.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">No stores found.</td></tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{store.name || 'N/A'}</div>
                      <div className="text-xs text-primary-600 hover:underline">
                        <a href={store.customPath ? `/${store.customPath}` : `/${store.name_slug || store.id}`} target="_blank" rel="noopener noreferrer">
                          {store.customPath ? `/${store.customPath}` : `/${store.name_slug || '(No Path)'}`}

                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{store.ownerName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{store.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{store.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {PLAN_DETAILS[store.planId || 'free']?.name || 'Unknown Plan'}
                      {store.planId !== 'free' && store.subscriptionEnds?.toDate && (
                        <div className={`text-xs ${store.subscriptionEnds.toDate() > new Date() ? 'text-alert-success' : 'text-alert-error'}`}>
                          Expires: {store.subscriptionEnds.toDate().toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"> <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded border"> {store.id} </span> </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"> {store.createdAt?.toDate ? new Date(store.createdAt.toDate()).toLocaleDateString() : 'N/A'} </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {store.isActive ? ( <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"> Active </span> ) : ( <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"> Inactive </span> )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {store.isActive ? ( <button onClick={() => handleSetStoreStatus(store.id, false)} className="btn-secondary-danger bg-red-100 text-red-700 hover:bg-red-200 text-xs" title="Deactivate"> <UserX className="w-4 h-4 mr-1" /> Deactivate </button> ) : ( <button onClick={() => handleSetStoreStatus(store.id, true)} className="btn-secondary bg-green-100 text-green-700 hover:bg-green-200 text-xs" title="Activate"> <UserCheck className="w-4 h-4 mr-1" /> Activate </button> )}
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}