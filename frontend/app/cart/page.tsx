"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/components/ui/cart-item";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Trash2, 
  Package, 
  Truck,
  Gift,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Shield,
  RefreshCw
} from "lucide-react";
import { useCartContext } from "@/contexts/cart-context";
import { useLiquorToast } from "@/hooks/use-liquor-toast";

export default function CartPage() {
  const router = useRouter();
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
    getCartWeight,
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
    router.push('/checkout');
  };

  // Calcular información de envío
  const cartWeight = getCartWeight();
  const freeShippingProgress = Math.min((summary.subtotal / 1500) * 100, 100);
  const remainingForFreeShipping = Math.max(1500 - summary.subtotal, 0);
  const estimatedDeliveryDays = cartWeight > 5 ? '3-5' : '1-3';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tu Carrito</h1>
                <p className="text-sm text-gray-600">
                  {hasItems ? `${summary.itemCount} productos en tu carrito` : 'Tu carrito está vacío'}
                </p>
              </div>
            </div>
            
            {hasItems && (
              <Button
                variant="ghost"
                onClick={handleClearCart}
                disabled={isClearing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isClearing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Limpiar carrito
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isEmpty ? (
          /* Estado vacío */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              ¡Es hora de encontrar los mejores licores! Explora nuestras categorías y encuentra tus favoritos.
            </p>
            <div className="space-y-4">
              <Link href="/">
                <Button variant="liquorOrange" size="lg" className="px-8">
                  Explorar productos
                </Button>
              </Link>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {['WHISKY', 'CERVEZA', 'VODKA'].map((categoria) => (
                  <Link 
                    key={categoria}
                    href={`/categoria/${encodeURIComponent(categoria)}`}
                    className="block"
                  >
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-liquor-orange">
                      <h3 className="font-semibold text-gray-900 mb-2">{categoria}</h3>
                      <p className="text-sm text-gray-600">Explora nuestra selección</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Contenido con productos */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progreso de envío gratis */}
              {summary.shipping > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-amber-800">
                        ¡Envío gratis desde S/1,500!
                      </span>
                    </div>
                    {remainingForFreeShipping > 0 && (
                      <Badge variant="outline" className="border-amber-300 text-amber-800">
                        Faltan S/{remainingForFreeShipping.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-amber-500 h-3 rounded-full transition-all duration-700 flex items-center justify-end pr-1"
                      style={{ width: `${freeShippingProgress}%` }}
                    >
                      {freeShippingProgress > 20 && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-amber-700">
                    {remainingForFreeShipping > 0 
                      ? `Agrega S/${remainingForFreeShipping.toFixed(2)} más para obtener envío gratis` 
                      : '¡Felicidades! Tu pedido califica para envío gratis'}
                  </p>
                </div>
              )}

              {/* Items del carrito */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Productos ({summary.uniqueItemCount})
                  </h2>
                  <div className="text-sm text-gray-500">
                    Peso estimado: {cartWeight.toFixed(1)} kg
                  </div>
                </div>
                
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    variant="detailed"
                    showActions={true}
                    showRemove={true}
                    showWishlist={true}
                    showLink={true}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                    onWishlist={(productId) => {
                      toast.success('Agregado a favoritos', {
                        description: 'El producto se guardó en tu lista de deseos'
                      });
                    }}
                  />
                ))}
              </div>

              {/* Productos recomendados */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Te podría interesar</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: 999, name: "Whisky Premium", price: 850, image: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop" },
                    { id: 998, name: "Cerveza Artesanal", price: 65, image: "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop" },
                    { id: 997, name: "Vodka Premium", price: 750, image: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop" },
                  ].map((product) => (
                    <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{product.name}</h4>
                      <p className="text-sm font-bold text-gray-900 mb-2">S/{product.price}</p>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Agregar al carrito
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen y checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Resumen del pedido
                </h2>

                {/* Desglose de precios */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({summary.itemCount} items)</span>
                    <span className="font-medium">S/{summary.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuestos (16%)</span>
                    <span className="font-medium">S/{summary.tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      Envío
                      {summary.shipping === 0 && (
                        <CheckCircle2 className="w-4 h-4 ml-1 text-green-500" />
                      )}
                    </span>
                    <span className={`font-medium ${summary.shipping === 0 ? 'text-green-600' : ''}`}>
                      {summary.shipping === 0 ? 'GRATIS' : `S/${summary.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento</span>
                      <span className="font-medium">-S/{summary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-xl text-gray-900">
                        S/{summary.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información de entrega */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Entrega estimada</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    {estimatedDeliveryDays} días hábiles
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Peso del paquete: {cartWeight.toFixed(1)} kg
                  </p>
                </div>

                {/* Botón de checkout */}
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-liquor-orange hover:bg-liquor-orange/90 text-white font-semibold py-3 mb-4"
                  size="lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceder al pago
                </Button>

                {/* Información de seguridad */}
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3 h-3" />
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gift className="w-3 h-3" />
                    <span>Empaque especial incluido</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-3 h-3" />
                    <span>30 días para devoluciones</span>
                  </div>
                </div>

                {/* Botón continuar comprando */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Continuar comprando
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom padding to account for fixed navigation */}
      <div className="h-24"></div>
    </div>
  );
}