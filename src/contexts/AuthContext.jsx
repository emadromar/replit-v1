// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebaseServices } from './FirebaseContext'; 

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const services = useFirebaseServices(); // Get services from context

  useEffect(() => {
    // Make sure services are loaded
    if (!services || !services.auth || !services.db) {
      console.log("AuthContext: Waiting for Firebase services...");
      return;
    }

    const { auth, db } = services;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        console.log("AuthContext: User detected:", currentUser.uid);
        
        try {
          // Directly fetch the admin document without artificial delay
          const adminRef = doc(db, "admins", currentUser.uid); 
          const adminSnap = await getDoc(adminRef);
          
          if (adminSnap.exists()) {
            const userRole = adminSnap.data()?.role;
            if (userRole === 'admin') {
              setIsAdmin(true);
              console.log("AuthContext: Admin access granted.");
            } else {
              setIsAdmin(false);
            }
          } else {
            // No admin document means regular user
            setIsAdmin(false);
          }
        } catch (err) {
          console.error("AuthContext: Admin check failed:", err);
          setIsAdmin(false);
        }
      } else {
        // User logged out
        setIsAdmin(false);
      }
      
      // Only NOW do we let the app render
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, [services]);

  const handleSignOut = async () => {
    if (!services || !services.auth) return;
    try { 
      await signOut(services.auth);
      window.location.href = '/';
    } catch (error) { 
      console.error("Sign out error:", error);
    }
  };

  const value = {
    user,
    isAdmin,
    isAuthReady,
    handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}