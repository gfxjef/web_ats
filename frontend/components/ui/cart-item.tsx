"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, X, Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/hooks/use-cart";

export interface CartItemProps {
  item: CartItemType;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
  showRemove?: boolean;
  showWishlist?: boolean;
  showLink?: boolean;
  readonly?: boolean;
  className?: string;
  onQuantityChange?: (productId: number, quantity: number) => void;
  onRemove?: (productId: number) => void;
  onWishlist?: (productId: number) => void;
  onViewProduct?: (productId: number) => void;
}

const CartItem = React.forwardRef<HTMLDivElement, CartItemProps>(
  ({
    item,
    variant = "default",
    showActions = true,
    showRemove = true,
    showWishlist = false,
    showLink = true,
    readonly = false,
    className,
    onQuantityChange,
    onRemove,
    onWishlist,
    onViewProduct,
  }, ref) => {

    // Calcular precio total del item
    const itemTotal = item.unitPrice * item.quantity;
    
    // Verificar si hay descuento (precio actual vs precio guardado)
    const hasDiscount = item['Precio B'] !== item.unitPrice;
    const discountAmount = hasDiscount ? (item.unitPrice - item['Precio B']) * item.quantity : 0;

    // Manejar cambio de cantidad
    const handleQuantityChange = (newQuantity: number) => {
      if (readonly) return;
      onQuantityChange?.(item.id, newQuantity);
    };

    // Manejar incremento
    const handleIncrement = () => {
      handleQuantityChange(item.quantity + 1);
    };

    // Manejar decremento
    const handleDecrement = () => {
      if (item.quantity > 1) {
        handleQuantityChange(item.quantity - 1);
      }
    };

    // Manejar eliminación
    const handleRemove = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (readonly) return;
      onRemove?.(item.id);
    };

    // Manejar wishlist
    const handleWishlist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onWishlist?.(item.id);
    };

    // Manejar ver producto
    const handleViewProduct = () => {
      onViewProduct?.(item.id);
    };

    // Configurar clases según variante
    const containerClasses = cn(
      "bg-white rounded-xl border border-gray-200 transition-all duration-200",
      {
        "p-4": variant === "default",
        "p-3": variant === "compact", 
        "p-6": variant === "detailed",
        "hover:shadow-sm": !readonly,
      },
      className
    );

    const imageClasses = cn(
      "bg-gray-100 rounded-lg overflow-hidden flex-shrink-0",
      {
        "w-16 h-16": variant === "compact",
        "w-20 h-20": variant === "default",
        "w-24 h-24": variant === "detailed",
      }
    );

    const contentLayout = variant === "compact" ? "flex items-center space-x-3" : "flex space-x-4";

    return (
      <div ref={ref} className={containerClasses}>
        <div className={contentLayout}>
          {/* Imagen del producto */}
          <div className={imageClasses}>
            {showLink ? (
              <Link href={`/product/${item.id}`} onClick={handleViewProduct}>
                <Image
                  src={item.Photo || "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"}
                  alt={item.Nombre}
                  width={variant === "compact" ? 64 : variant === "default" ? 80 : 96}
                  height={variant === "compact" ? 64 : variant === "default" ? 80 : 96}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </Link>
            ) : (
              <Image
                src={item.Photo || "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"}
                alt={item.Nombre}
                width={variant === "compact" ? 64 : variant === "default" ? 80 : 96}
                height={variant === "compact" ? 64 : variant === "default" ? 80 : 96}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Información del producto */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                {/* Nombre del producto */}
                {showLink ? (
                  <Link href={`/product/${item.id}`} onClick={handleViewProduct}>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight hover:text-liquor-orange transition-colors line-clamp-2">
                      {item.Nombre}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                    {item.Nombre}
                  </h3>
                )}

                {/* Información adicional */}
                {variant !== "compact" && (
                  <div className="flex items-center space-x-2 mt-1">
                    {item.Modelo && <span className="text-xs text-gray-500">{item.Modelo}</span>}
                    {item.Modelo && item.Tamaño && <span className="text-xs text-gray-400">•</span>}
                    {item.Tamaño && <span className="text-xs text-gray-500">{item.Tamaño}</span>}
                    {item.Tamaño && item['Sub Categoria'] && <span className="text-xs text-gray-400">•</span>}
                    {item['Sub Categoria'] && <span className="text-xs text-gray-500">{item['Sub Categoria']}</span>}
                  </div>
                )}

                {/* Stock status */}
                {variant === "detailed" && (
                  <div className="mt-2">
                    {item.Stock === 'Sin Stock' ? (
                      <Badge variant="destructive" className="text-xs">
                        Sin Stock
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Disponible
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de eliminar */}
              {showRemove && !readonly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                  onClick={handleRemove}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Precio y controles de cantidad */}
            <div className="flex items-center justify-between">
              {/* Precio */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">
                    S/{itemTotal.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-green-600">
                      (-S/{Math.abs(discountAmount).toFixed(2)})
                    </span>
                  )}
                </div>
                {variant !== "compact" && (
                  <span className="text-xs text-gray-500">
                    S/{item.unitPrice.toFixed(2)} c/u
                    {hasDiscount && (
                      <span className="ml-1 line-through text-gray-400">
                        S/{item['Precio B'].toFixed(2)}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Controles de cantidad */}
              {showActions && !readonly && (
                <div className="flex items-center space-x-2">
                  {/* Botón wishlist */}
                  {showWishlist && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-gray-400 hover:text-red-500"
                      onClick={handleWishlist}
                    >
                      <Heart className="w-3 h-3" />
                    </Button>
                  )}

                  {/* Controles de cantidad */}
                  <div className="flex items-center bg-gray-100 rounded-full">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-full hover:bg-gray-200"
                      onClick={handleDecrement}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    
                    <span className="px-3 py-1 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-full hover:bg-gray-200"
                      onClick={handleIncrement}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Solo mostrar cantidad si es readonly */}
              {readonly && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Cantidad:</span>
                  <span className="font-medium">{item.quantity}</span>
                </div>
              )}
            </div>

            {/* Información adicional para variante detailed */}
            {variant === "detailed" && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Agregado: {new Date(item.addedAt).toLocaleDateString()}</span>
                  {showLink && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={handleViewProduct}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver producto
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CartItem.displayName = "CartItem";

export { CartItem };