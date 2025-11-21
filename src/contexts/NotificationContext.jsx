// src/context/NotificationContext.jsx

import React, { useState, useMemo, createContext, useContext } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useFirebaseServices } from './FirebaseContext'; // Import our hook

// --- Notification System Definitions ---
const NOTIFICATION_TIERS = {
  free: { name: "Free", email: false, inApp: true, emailPriority: 'low' },
  basic: { name: "Basic", email: true, emailPriority: 'standard', inApp: true },
  pro: { name: "Pro", email: true, emailPriority: 'high', inApp: true }
};

// --- Context Definition ---
export const NotificationContext = createContext({
  sendSystemNotification: () => {},
  showError: () => {},
  showSuccess: () => {},
});

// --- Custom Hook ---
export const useNotifications = () => useContext(NotificationContext);

// --- Utility to send email via Cloud Function ---
const sendExternalCommunication = (functions, recipientEmail, subject, htmlBody) => {
  if (!functions) {
    console.error("[ERROR] Firebase Functions service not available.");
    return;
  }
  
  const sendEmail = httpsCallable(functions, 'sendEmailNotification');
  
  sendEmail({ 
    to: recipientEmail, 
    subject: subject, 
    htmlBody: htmlBody 
  })
  .then((result) => {
    console.log(`[Cloud Function] Email process initiated to ${recipientEmail} successfully.`, result.data.message);
  })
  .catch((error) => {
    console.error(`[Cloud Function ERROR] Failed to send email to ${recipientEmail}.`, error.code, error.message);
  });
};

// --- Transient Notification Component ---
// We keep this here as it's only used by the provider
function Notification({ message, type = 'error' }) {
  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  const icon = type === 'error' ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />;
  
  return (
    <div className={`fixed top-4 right-4 z-[100] ${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center animate-fade-in-down`}>
      {icon}
      <span>{message}</span>
    </div>
  );
}

// --- Provider Component ---
export function NotificationProvider({ children }) {
  const { db, functions } = useFirebaseServices(); // Get services from context
  const [transientNotifications, setTransientNotifications] = useState([]);
  
  const addTransientNotification = (message, type = 'success', duration = 4000) => {
    const id = Date.now();
    const newNotif = { id, message, type };
    setTransientNotifications(prev => [...prev, newNotif]);
    
    setTimeout(() => {
      setTransientNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  const showError = (message, duration = 5000) => {
    addTransientNotification(message, 'error', duration);
  };

  const showSuccess = (message, duration = 4000) => {
    addTransientNotification(message, 'success', duration);
  };

  const sendSystemNotification = async (storeId, storeEmail, tierId, type, message) => {
    const tier = NOTIFICATION_TIERS[tierId] || NOTIFICATION_TIERS.free;
    
    // 1. Log to Firestore (Persistent In-App Notification)
    if (tier.inApp && db && storeId && message) {
      try {
        const notificationsRef = collection(db, "stores", storeId, "notifications");
        await addDoc(notificationsRef, {
          message: message,
          type: type, 
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Failed to write persistent notification:", error);
      }
    }

    // 2. Send External Notification (Email)
    if (tier.email && storeEmail && functions) {
      let subject = `[${tier.emailPriority.toUpperCase()}] WebJor Alert: ${type.toUpperCase()}`;
      if (type === 'order') {
  // 1. Create the Regex dynamically using the variable
  const amountRegex = new RegExp(`${CURRENCY_CODE} ([\\d.]+)`);
  
  // 2. Extract the amount safely
  const amount = message.match(amountRegex)?.[1] || 'Unknown';
  
  // 3. Set the subject
  subject = `New Order: ${CURRENCY_CODE} ${amount} Placed.`;
}
      if (type === 'stock') subject = `Urgent Stock Alert: ${message.match(/: (.*?) is low/)?.[1] || 'A Product'} needs restocking!`;
      if (type === 'upgrade_approved') subject = `Congratulations! Your Plan Has Been Upgraded!`;
      if (type === 'upgrade_declined') subject = `Subscription Update: Your Upgrade Request Was Declined.`;
      
      sendExternalCommunication(functions, storeEmail, subject, message);
    }
  };
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    sendSystemNotification,
    showError,
    showSuccess,
  }), [db, functions]); // Dependencies

  return (
    <NotificationContext.Provider value={contextValue}>
      {/* Render transient notifications globally */}
      <div className="fixed top-4 right-4 z-[100]">
        {transientNotifications.map(n => (
          <Notification key={n.id} message={n.message} type={n.type} />
        ))}
      </div>
      {children}
    </NotificationContext.Provider>
  );
}