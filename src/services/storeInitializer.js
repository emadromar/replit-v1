// src/services/storeInitializer.js
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Ensures a store document exists for the user
 * Creates one if it doesn't exist
 */
export async function ensureStoreExists(db, user) {
  if (!db || !user) {
    throw new Error('Database or user not provided');
  }

  const storeRef = doc(db, 'stores', user.uid);
  const storeSnap = await getDoc(storeRef);

  if (!storeSnap.exists()) {
    console.log('Store document not found, creating one...');
    
    // Extract name from email (before @)
    const defaultStoreName = user.email?.split('@')[0] || 'My Store';
    const storeSlug = defaultStoreName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    await setDoc(storeRef, {
      userId: user.uid,
      ownerName: user.displayName || defaultStoreName,
      email: user.email,
      name: defaultStoreName,
      name_slug: storeSlug,
      phone: '',
      logoUrl: '',
      themeColor: '#3b82f6',
      createdAt: serverTimestamp(),
      isActive: true,
      customPath: null,
      planId: 'free',
      subscriptionEnds: null,
      onboardingComplete: false,
    });

    console.log('Store document created successfully');
    return { id: user.uid, userId: user.uid, name: defaultStoreName, planId: 'free' };
  }

  return { id: storeSnap.id, ...storeSnap.data() };
}
