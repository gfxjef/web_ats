"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart, type UseCartResult } from '@/hooks/use-cart';
import { CartSheet } from '@/components/ui/cart-sheet';

interface CartContextType extends UseCartResult {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCartContext(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const cart = useCart({
    storageKey: 'liquor-ats-cart',
    taxRate: 0.16,
    freeShippingThreshold: 1500,
    shippingCost: 150,
    enablePersistence: true,
    maxQuantityPerItem: 50,
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Cerrar carrito al presionar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isCartOpen]);

  const contextValue: CartContextType = {
    ...cart,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      <CartSheet 
        isOpen={isCartOpen} 
        onClose={closeCart}
        onCheckout={() => {
          closeCart();
          // El componente CartSheet maneja la navegación
        }}
      />
    </CartContext.Provider>
  );
}