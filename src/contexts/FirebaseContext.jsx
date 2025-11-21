// src/context/FirebaseContext.jsx

import React, { createContext, useContext } from 'react';
// 1. IMPORT FROM YOUR ACTUAL SERVICES FILE
import { db, auth, storage, functions } from '../services/firebase.js';

// 2. CREATE THE CONTEXT, but initialize it as null
export const FirebaseContext = createContext(null);

// Create a custom hook for easy access
export const useFirebaseServices = () => useContext(FirebaseContext);

// 3. CREATE THE PROVIDER THAT APP.JSX NEEDS
export const FirebaseProvider = ({ children }) => {
  // 4. CREATE THE OBJECT *INSIDE* THE PROVIDER
  // This ensures it's created *after* firebase.js has run
  const firebaseServices = { db, auth, storage, functions };

  return (
    <FirebaseContext.Provider value={firebaseServices}>
      {children}
    </FirebaseContext.Provider>
  );
};