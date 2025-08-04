"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartContext } from "@/contexts/cart-context";

export interface CartButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showCount?: boolean;
  showTotal?: boolean;
  className?: string;
  onClick?: () => void;
}

const CartButton = React.forwardRef<HTMLButtonElement, CartButtonProps>(
  ({ 
    variant = "ghost", 
    size = "icon", 
    showCount = true, 
    showTotal = false,
    className,
    onClick,
    ...props 
  }, ref) => {
    const { summary, toggleCart, hasItems } = useCartContext();
    const [isAnimating, setIsAnimating] = useState(false);
    const [prevItemCount, setPrevItemCount] = useState(summary.itemCount);
    
    // Detectar cuando se agrega un item al carrito
    useEffect(() => {
      if (summary.itemCount > prevItemCount) {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 1000);
        return () => clearTimeout(timer);
      }
      setPrevItemCount(summary.itemCount);
    }, [summary.itemCount, prevItemCount]);
    
    const handleClick = () => {
      if (onClick) {
        onClick();
      } else {
        toggleCart();
      }
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        onClick={handleClick}
        className={cn(
          "relative transition-all duration-300",
          isAnimating && "animate-cart-pulse text-white shadow-lg shadow-liquor-orange/50",
          className
        )}
        {...props}
      >
        <ShoppingCart 
          className={cn(
            "w-5 h-5 transition-all duration-300",
            isAnimating && "animate-spin"
          )} 
        />
        
        {/* Contador de items con animación mejorada */}
        {showCount && hasItems && (
          <Badge 
            variant="destructive" 
            className={cn(
              "absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs font-bold transition-all duration-300",
              isAnimating && "animate-badge-bounce bg-green-500 ring-2 ring-green-300"
            )}
          >
            {summary.itemCount > 99 ? '99+' : summary.itemCount}
          </Badge>
        )}
        
        {/* Total del carrito */}
        {showTotal && hasItems && size !== "icon" && (
          <span className="ml-2 font-medium">
            S/{summary.total.toFixed(2)}
          </span>
        )}
        
        {/* Texto para tamaños no-icon */}
        {size !== "icon" && !showTotal && (
          <span className="ml-2">
            {hasItems ? `Carrito (${summary.itemCount})` : 'Carrito'}
          </span>
        )}
      </Button>
    );
  }
);

CartButton.displayName = "CartButton";

export { CartButton };