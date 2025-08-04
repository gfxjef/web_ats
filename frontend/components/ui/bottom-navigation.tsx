"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Grid3X3, Percent, Package, ShoppingCart } from "lucide-react";
import { useCartContext } from "@/contexts/cart-context";

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { summary, toggleCart } = useCartContext();
  
  // Determinar qué tab está activo basado en la ruta actual
  const getActiveTab = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/categoria') || pathname.startsWith('/categorias')) return 'categories';
    if (pathname.startsWith('/offers') || pathname.startsWith('/promociones')) return 'offers';
    if (pathname.startsWith('/orders') || pathname.startsWith('/pedidos')) return 'orders';
    // Cart no tiene página dedicada, se maneja por CartSheet
    return 'home'; // Default
  };

  const activeTab = getActiveTab();

  const handleNavigation = (tab: string) => {
    switch (tab) {
      case 'home':
        router.push('/');
        break;
      case 'categories':
        router.push('/categorias');
        break;
      case 'offers':
        // Por ahora vamos a home, después se puede crear una página de ofertas
        router.push('/');
        break;
      case 'orders':
        // Por ahora vamos a home, después se puede crear una página de pedidos
        router.push('/');
        break;
      case 'cart':
        toggleCart(); // Abrir el CartSheet
        break;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 max-w-md mx-auto">
      <div className="flex justify-around items-center">
        {/* Home */}
        <button 
          onClick={() => handleNavigation('home')}
          className="flex flex-col items-center space-y-1"
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'text-gray-900' : 'text-gray-400'}`} />
          <span className={`text-xs ${activeTab === 'home' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Inicio</span>
        </button>
        
        {/* Categories */}
        <button 
          onClick={() => handleNavigation('categories')}
          className="flex flex-col items-center space-y-1"
        >
          <Grid3X3 className={`w-6 h-6 ${activeTab === 'categories' ? 'text-gray-900' : 'text-gray-400'}`} />
          <span className={`text-xs ${activeTab === 'categories' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Categoría</span>
        </button>
        
        {/* Offers */}
        <button 
          onClick={() => handleNavigation('offers')}
          className="flex flex-col items-center space-y-1"
        >
          <Percent className={`w-6 h-6 ${activeTab === 'offers' ? 'text-gray-900' : 'text-gray-400'}`} />
          <span className={`text-xs ${activeTab === 'offers' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Offers</span>
        </button>
        
        {/* Orders */}
        <button 
          onClick={() => handleNavigation('orders')}
          className="flex flex-col items-center space-y-1"
        >
          <Package className={`w-6 h-6 ${activeTab === 'orders' ? 'text-gray-900' : 'text-gray-400'}`} />
          <span className={`text-xs ${activeTab === 'orders' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Orders</span>
        </button>
        
        {/* Cart */}
        <button 
          onClick={() => handleNavigation('cart')}
          className="flex flex-col items-center space-y-1 relative"
          data-cart-trigger
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-400" />
            {summary.itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {summary.itemCount > 99 ? '99+' : summary.itemCount}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">Cart</span>
        </button>
      </div>
    </div>
  );
}