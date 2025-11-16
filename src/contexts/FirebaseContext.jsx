// src/context/FirebaseContext.jsx

import React, { createContext, useContext } from 'react';
// 1. IMPORT FROM YOUR ACTUAL SERVICES FILE
import { db, auth, storage, functions } from '../services/firebase.js';

// 2. CREATE AN OBJECT WITH ALL SERVICES
const firebaseServices = { db, auth, storage, functions };

// Create the context
export const FirebaseContext = createContext(firebaseServices);

// Create a custom hook for easy access
export const useFirebaseServices = () => useContext(FirebaseContext);

// 3. CREATE THE PROVIDER THAT APP.JSX NEEDS
export const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider value={firebaseServices}>
      {children}
    </FirebaseContext.Provider>
  );
};