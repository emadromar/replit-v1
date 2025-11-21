// src/contexts/CartContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

// NO ROUTER IMPORTS

const CartContext = createContext();

export const useCart = (storeId) => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return {
    cart: context.carts[storeId] || {},
    addToCart: (product, quantity = 1) => context.addToCart(storeId, product, quantity),
    removeFromCart: (productId) => context.removeFromCart(storeId, productId),
    updateQuantity: (productId, quantity) => context.updateQuantity(storeId, productId, quantity),
    clearCart: () => context.clearCart(storeId),
    getItemCount: () => context.getItemCount(storeId),
    getTotalPrice: () => context.getTotalPrice(storeId),
  };
};

export const CartProvider = ({ children }) => {
  const [carts, setCarts] = useState(() => {
    const localData = localStorage.getItem('allCarts');
    return localData ? JSON.parse(localData) : {};
  });

  useEffect(() => {
    localStorage.setItem('allCarts', JSON.stringify(carts));
  }, [carts]);

  const modifyCart = (storeId, productId, updateFn) => {
    setCarts((prevCarts) => {
      const storeCart = prevCarts[storeId] || {};
      const updatedCart = updateFn(storeCart, productId);
      
      if (Object.keys(updatedCart).length === 0) {
        const { [storeId]: _, ...remainingCarts } = prevCarts;
        return remainingCarts;
      }
      
      return {
        ...prevCarts,
        [storeId]: updatedCart,
      };
    });
  };

  const addToCart = (storeId, product, quantity) => {
    modifyCart(storeId, product.id, (cart) => {
      const existingItem = cart[product.id];
      return {
        ...cart,
        [product.id]: {
          ...product,
          quantity: (existingItem ? existingItem.quantity : 0) + quantity,
        },
      };
    });
  };

  const removeFromCart = (storeId, productId) => {
    modifyCart(storeId, productId, (cart) => {
      const { [productId]: _, ...remainingItems } = cart;
      return remainingItems;
    });
  };

  const updateQuantity = (storeId, productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(storeId, productId);
    } else {
      modifyCart(storeId, productId, (cart) => ({
        ...cart,
        [productId]: { ...cart[productId], quantity },
      }));
    }
  };

  const clearCart = (storeId) => {
    setCarts((prevCarts) => {
      const { [storeId]: _, ...remainingCarts } = prevCarts;
      return remainingCarts;
    });
  };

  const getItemCount = (storeId) => {
    const cart = carts[storeId] || {};
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = (storeId) => {
    const cart = carts[storeId] || {};
    return Object.values(cart)
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const value = {
    carts,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalPrice,
  };

  // --- THE FIX ---
  // No <BrowserRouter>
  // Correct closing tag
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};