import * as React from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

export interface ProductCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showPrice?: boolean;
  showDescription?: boolean;
  showBadge?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const ProductCardSkeleton = React.forwardRef<HTMLDivElement, ProductCardSkeletonProps>(
  ({ 
    className, 
    showPrice = true, 
    showDescription = false, 
    showBadge = false,
    variant = 'default',
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-2xl p-4 shadow-sm border border-gray-100",
          variant === 'compact' && "p-3",
          variant === 'featured' && "p-6",
          className
        )}
        {...props}
      >
        {/* Imagen del producto */}
        <div className="relative mb-3">
          <Skeleton 
            className={cn(
              "w-full rounded-xl",
              variant === 'compact' ? "h-32" : "h-40",
              variant === 'featured' && "h-48"
            )}
          />
          
          {/* Badge opcional */}
          {showBadge && (
            <Skeleton 
              className="absolute top-2 left-2 h-6 w-16 rounded-full" 
            />
          )}
          
          {/* Botón + flotante */}
          <Skeleton 
            shape="circle"
            className={cn(
              "absolute -bottom-2 -right-2",
              variant === 'compact' ? "w-7 h-7" : "w-8 h-8",
              variant === 'featured' && "w-10 h-10"
            )}
          />
        </div>

        {/* Contenido */}
        <div className="space-y-2">
          {/* Título del producto */}
          <Skeleton 
            className={cn(
              "h-4 w-3/4",
              variant === 'featured' && "h-5"
            )}
          />
          
          {/* Descripción opcional */}
          {showDescription && (
            <Skeleton 
              className={cn(
                "h-3 w-1/2",
                variant === 'featured' && "h-4"
              )}
            />
          )}
          
          {/* Precio */}
          {showPrice && (
            <div className="flex items-center space-x-2 pt-1">
              <Skeleton 
                className={cn(
                  "h-5 w-16",
                  variant === 'featured' && "h-6 w-20"
                )}
              />
              <Skeleton 
                className={cn(
                  "h-4 w-12",
                  variant === 'featured' && "h-5 w-14"
                )}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);
ProductCardSkeleton.displayName = "ProductCardSkeleton";

// Componente para múltiples skeletons de productos
export interface ProductGridSkeletonProps {
  count?: number;
  variant?: 'default' | 'compact' | 'featured';
  showPrice?: boolean;
  showDescription?: boolean;
  showBadge?: boolean;
  className?: string;
}

export function ProductGridSkeleton({
  count = 6,
  variant = 'default',
  showPrice = true,
  showDescription = false,
  showBadge = false,
  className,
}: ProductGridSkeletonProps) {
  return (
    <div className={cn(
      "grid gap-4",
      variant === 'compact' 
        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      variant === 'featured' && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton
          key={`product-skeleton-${index}`}
          variant={variant}
          showPrice={showPrice}
          showDescription={showDescription}
          showBadge={showBadge}
        />
      ))}
    </div>
  );
}

// Skeleton para lista horizontal de productos
export interface ProductRowSkeletonProps {
  count?: number;
  showPrice?: boolean;
  className?: string;
}

export function ProductRowSkeleton({
  count = 5,
  showPrice = true,
  className,
}: ProductRowSkeletonProps) {
  return (
    <div className={cn("flex space-x-4 overflow-x-auto pb-2", className)}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton
          key={`product-row-skeleton-${index}`}
          variant="compact"
          showPrice={showPrice}
          className="min-w-[160px] flex-shrink-0"
        />
      ))}
    </div>
  );
}

export { ProductCardSkeleton };