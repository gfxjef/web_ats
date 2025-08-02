"use client";

import * as React from "react";
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
        className={cn("relative", className)}
        {...props}
      >
        <ShoppingCart className="w-5 h-5" />
        
        {/* Contador de items */}
        {showCount && hasItems && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs font-bold"
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