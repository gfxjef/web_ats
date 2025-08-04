"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  CheckCircle2,
  Plus,
  Sparkles,
  MessageCircle
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

// Tipo para productos sugeridos
interface SuggestedProduct {
  id: number;
  Nombre: string;
  'Precio B': number;
  Photo?: string;
  Categoria: string;
}

const CartSheet = React.forwardRef<HTMLDivElement, CartSheetProps>(
  ({ isOpen, onClose, onCheckout, className }, ref) => {
    const toast = useLiquorToast();
    const cart = useCartContext();
    const [isClearing, setIsClearing] = useState(false);
    const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);
    
    // Estado para el envío de pedido por WhatsApp
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);

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

    // Cargar productos sugeridos cuando se abre el carrito
    useEffect(() => {
      if (isOpen && hasItems) {
        // Obtener categorías únicas del carrito
        const categories = [...new Set(items.map(item => item.Categoria))];
        
        // Por ahora, usar productos de ejemplo (en producción esto vendría de la API)
        const mockSuggestions: SuggestedProduct[] = [
          { id: 101, Nombre: "Ron Bacardí Añejo", 'Precio B': 89.90, Categoria: "RON" },
          { id: 102, Nombre: "Whisky Johnnie Walker", 'Precio B': 129.90, Categoria: "WHISKY" },
          { id: 103, Nombre: "Vodka Absolut", 'Precio B': 79.90, Categoria: "VODKA" },
          { id: 104, Nombre: "Tequila Jose Cuervo", 'Precio B': 99.90, Categoria: "TEQUILA" },
        ];
        
        setSuggestedProducts(mockSuggestions);
      }
    }, [isOpen, hasItems, items]);

    // Función para generar y enviar pedido por WhatsApp
    const handleWhatsAppOrder = () => {      
      if (isEmpty) {
        toast.error('Tu carrito está vacío');
        return;
      }

      setIsProcessingOrder(true);

      try {
        // Generar mensaje como si fuera enviado por el cliente
        const whatsappMessage = `Hola! 👋 

Quiero realizar el pedido de los siguientes productos cotizados vía web:

${items.map(item => `• ${item.quantity}x ${item.Nombre} - S/ ${(item.unitPrice * item.quantity).toFixed(2)}`).join('\n')}

*Total: S/ ${summary.subtotal.toFixed(2)}*

¿Podrían confirmarme la disponibilidad y el tiempo de entrega?

Gracias! 😊`;

        // Número de WhatsApp del negocio (938101013 con código de país de Perú)
        const whatsappNumber = '51938101013';
        
        // Crear URL de WhatsApp
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Limpiar carrito después de enviar
        clearCart();
        
        // Cerrar carrito
        onClose();
        
        toast.success('Pedido enviado por WhatsApp', {
          description: 'Tu pedido se ha enviado correctamente'
        });

      } catch (error) {
        toast.error('Error al procesar pedido', {
          description: 'Inténtalo de nuevo'
        });
      } finally {
        setIsProcessingOrder(false);
      }
    };

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
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-3">
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
                  
                  {/* Sección de productos sugeridos - Movida aquí */}
                  {suggestedProducts.length > 0 && (
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-1 mb-2">
                        <Sparkles className="w-3 h-3 text-liquor-orange" />
                        <h3 className="text-xs font-semibold text-gray-700">Te puede interesar</h3>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {suggestedProducts.slice(0, 6).map((product) => (
                          <div
                            key={product.id}
                            className="flex-shrink-0 bg-white rounded-lg p-2 border border-gray-200 hover:border-liquor-orange/50 transition-colors cursor-pointer w-20"
                            onClick={() => {
                              cart.addItem(product as any, 1);
                              toast.productAdded(product.Nombre, 1, product['Precio B']);
                            }}
                          >
                            <div className="relative aspect-square mb-1">
                              <Image
                                src={product.Photo || "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg"}
                                alt={product.Nombre}
                                fill
                                className="object-cover rounded"
                              />
                              <Button
                                size="sm"
                                variant="liquorOrange"
                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <h4 className="text-[10px] font-medium text-gray-900 line-clamp-2 leading-tight">{product.Nombre}</h4>
                            <p className="text-[10px] font-bold text-liquor-orange">S/{product['Precio B']}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones del carrito */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      {summary.uniqueItemCount} {summary.uniqueItemCount === 1 ? 'producto' : 'productos'}
                    </span>
                    <button
                      onClick={handleClearCart}
                      disabled={isClearing}
                      className="text-xs text-red-600 hover:text-red-700 underline"
                    >
                      Limpiar carrito
                    </button>
                  </div>

                  {/* Resumen de precios simplificado */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">S/{summary.subtotal.toFixed(2)}</span>
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
                          S/{summary.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleWhatsAppOrder}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 shadow-lg hover:shadow-xl transition-shadow"
                      disabled={isEmpty || isProcessingOrder}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {isProcessingOrder ? 'Enviando...' : 'Finalizar Pedido'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={onClose}
                      className="flex-1 text-gray-600 py-2.5"
                      disabled={isProcessingOrder}
                    >
                      Seguir comprando
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