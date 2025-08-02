"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/components/ui/cart-item";
import { 
  ShoppingCart, 
  X, 
  Trash2, 
  ArrowRight, 
  Package, 
  Truck,
  Gift,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartContext } from "@/contexts/cart-context";
import { useLiquorToast } from "@/hooks/use-liquor-toast";

export interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
  className?: string;
}

const CartSheet = React.forwardRef<HTMLDivElement, CartSheetProps>(
  ({ isOpen, onClose, onCheckout, className }, ref) => {
    const toast = useLiquorToast();
    const cart = useCartContext();
    const [isClearing, setIsClearing] = useState(false);

    const {
      items,
      summary,
      isEmpty,
      hasItems,
      removeItem,
      updateQuantity,
      clearCart,
      incrementQuantity,
      decrementQuantity,
    } = cart;

    // Manejar eliminación de item
    const handleRemoveItem = (productId: number) => {
      const item = items.find(i => i.id === productId);
      if (item) {
        removeItem(productId);
        toast.success('Producto removido', {
          description: `${item.Nombre} se eliminó del carrito`
        });
      }
    };

    // Manejar cambio de cantidad
    const handleQuantityChange = (productId: number, quantity: number) => {
      updateQuantity(productId, quantity);
    };

    // Manejar limpiar carrito
    const handleClearCart = async () => {
      setIsClearing(true);
      
      try {
        clearCart();
        toast.success('Carrito limpiado', {
          description: 'Todos los productos fueron removidos'
        });
      } catch (error) {
        toast.error('Error al limpiar carrito', {
          description: 'Inténtalo de nuevo'
        });
      } finally {
        setIsClearing(false);
      }
    };

    // Manejar checkout
    const handleCheckout = () => {
      if (isEmpty) return;
      
      onCheckout?.();
      // Si no hay handler de checkout personalizado, ir a página de checkout
      if (!onCheckout) {
        window.location.href = '/checkout';
      }
    };

    // Calcular barra de progreso para envío gratis
    const freeShippingProgress = Math.min((summary.subtotal / 1500) * 100, 100);
    const remainingForFreeShipping = Math.max(1500 - summary.subtotal, 0);

    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={onClose}
          />
        )}

        {/* Sheet */}
        <div
          ref={ref}
          className={cn(
            "fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
            isOpen ? "translate-x-0" : "translate-x-full",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-liquor-orange" />
              <h2 className="text-lg font-semibold text-gray-900">
                Tu Carrito
              </h2>
              {hasItems && (
                <Badge variant="secondary" className="ml-2">
                  {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {isEmpty ? (
              /* Carrito vacío */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Agrega algunos productos para comenzar
                  </p>
                  <Button 
                    variant="liquorOrange" 
                    onClick={onClose}
                    className="w-full"
                  >
                    Continuar comprando
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Progreso de envío gratis */}
                {summary.shipping > 0 && (
                  <div className="p-4 bg-amber-50 border-b border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                          Envío gratis desde S/1,500
                        </span>
                      </div>
                      {remainingForFreeShipping > 0 && (
                        <span className="text-xs text-amber-600">
                          Faltan S/{remainingForFreeShipping.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Lista de items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      variant="default"
                      showActions={true}
                      showRemove={true}
                      showWishlist={false}
                      showLink={true}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                      onViewProduct={() => {
                        onClose();
                      }}
                    />
                  ))}
                </div>

                {/* Acciones del carrito */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      {summary.uniqueItemCount} {summary.uniqueItemCount === 1 ? 'producto' : 'productos'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearCart}
                      disabled={isClearing}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Limpiar todo
                    </Button>
                  </div>

                  {/* Resumen de precios */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">S/{summary.subtotal.toFixed(2)}</span>
                    </div>
                    
                    {summary.shipping > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Envío</span>
                        <span className="font-medium">S/{summary.shipping.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {summary.shipping === 0 && summary.subtotal >= 1500 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Envío gratis
                        </span>
                        <span className="font-medium">S/0.00</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Impuestos (16%)</span>
                      <span className="font-medium">S/{summary.tax.toFixed(2)}</span>
                    </div>
                    
                    {summary.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Descuento</span>
                        <span className="font-medium">-S/{summary.discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-lg text-gray-900">
                          S/{summary.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-liquor-orange hover:bg-liquor-orange/90 text-white font-semibold py-3"
                      disabled={isEmpty}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Proceder al checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    <Link href="/cart" onClick={onClose} className="block">
                      <Button variant="outline" className="w-full">
                        Ver carrito completo
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="ghost" 
                      onClick={onClose}
                      className="w-full text-gray-600"
                    >
                      Continuar comprando
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Información adicional */}
          {hasItems && (
            <div className="px-4 py-2 bg-gray-50 border-t">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Compra segura</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gift className="w-3 h-3" />
                  <span>Envío rápido</span>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>30 días devolución</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
);

CartSheet.displayName = "CartSheet";

export { CartSheet };