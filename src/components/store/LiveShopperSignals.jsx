// src/components/store/LiveShopperSignals.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Eye, Check, X, Heart } from 'lucide-react';
import { useFirebaseServices } from '../../contexts/FirebaseContext';
import { httpsCallable } from 'firebase/functions';

const SignalIcon = ({ type }) => {
  const Icon = {
    VIEW: Eye,
    ADD_TO_CART: ShoppingBag,
    PURCHASE: Check,
    TRUST: Heart,
  }[type] || Eye;

  const color = {
    VIEW: 'text-gray-500',
    ADD_TO_CART: 'text-primary-500',
    PURCHASE: 'text-green-500',
    TRUST: 'text-red-500',
  }[type] || 'text-gray-500';

  return (
    <div className={`p-2 rounded-full bg-white shadow-md ${color} flex-shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
  );
};

// Component for a single floating notification
const SignalNotification = ({ signal, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Close notification after 5s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-4 left-4 bg-white rounded-lg shadow-xl p-3 flex items-start space-x-3 max-w-xs z-50 border-l-4 border-primary-500"
        >
          <SignalIcon type={signal.type} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {signal.type === 'PURCHASE' ? 'Sale Alert! (Proof)' : 'Shopper Activity'}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {signal.message}
            </p>
          </div>
          <button onClick={() => setIsVisible(false)} className="p-1 text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export function LiveShopperSignals({ storeId, storeName, currentPlanId, isRecoveryBubbleVisible }) { 
  const { services } = useFirebaseServices();
  const functions = services?.functions;
  
  const [events, setEvents] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false); // Tracks whether fetch attempt is complete
  const [currentSignal, setCurrentSignal] = useState(null);
  
  const planIsActive = currentPlanId === 'basic' || currentPlanId === 'pro';
  
  // 1. Fetch Events from Backend
  useEffect(() => {
    if (!planIsActive || !functions) return;

    const fetchEvents = async () => {
      try {
        const getEvents = httpsCallable(functions, 'getStoreEvents');
        const result = await getEvents({ 
          planId: currentPlanId, 
          storeName: storeName 
        });
        
        if (result.data && result.data.events) {
          setEvents(result.data.events);
        }
      } catch (error) {
        console.error("Error fetching store events:", error);
      } finally {
        setIsDataReady(true);
      }
    };

    fetchEvents();
  }, [functions, storeId, currentPlanId, planIsActive]);


  // 2. Logic to display signals in a loop - STARTS WHEN EVENTS ARE READY
  useEffect(() => {
    // Stop the loop if the Recovery Bubble is active, or if data/plan is not ready
    if (isRecoveryBubbleVisible || !planIsActive || events.length === 0 || !functions || !isDataReady) return;

    const displayNextSignal = () => {
      const randomIndex = Math.floor(Math.random() * events.length);
      setCurrentSignal(events[randomIndex]);
    };
    
    // Start signal loop cycle: Display 5s, Gap 3s
    const loopTimer = setInterval(displayNextSignal, 8000); 

    // Initial display after 3 seconds
    const initialTimer = setTimeout(displayNextSignal, 3000); 

    return () => {
      clearTimeout(initialTimer);
      clearInterval(loopTimer);
    };
    // The loop runs whenever events or functions changes.
  }, [planIsActive, events, functions, isRecoveryBubbleVisible, isDataReady]); 

  // If plan is locked, don't render.
  if (!planIsActive) {
    return null;
  }

  // FIX: Only render the popup IF the recovery bubble is NOT visible AND data IS ready
  if (isRecoveryBubbleVisible || !isDataReady) {
      return null;
  }

  return (
    <AnimatePresence>
      {currentSignal && (
        <SignalNotification 
          signal={currentSignal} 
          onClose={() => setCurrentSignal(null)} 
        />
      )}
    </AnimatePresence>
  );
}