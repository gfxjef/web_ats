import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  "animate-pulse bg-muted rounded-md",
  {
    variants: {
      variant: {
        default: "bg-muted",
        light: "bg-gray-200",
        dark: "bg-gray-300",
        shimmer: "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer",
      },
      shape: {
        rectangle: "rounded-md",
        circle: "rounded-full",
        rounded: "rounded-lg",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "rectangle",
    },
  }
);

export interface SkeletonProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, shape, width, height, style, ...props }, ref) => {
    const skeletonStyle = {
      width: width,
      height: height,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, shape }), className)}
        style={skeletonStyle}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

// Hook personalizado para manejar estados de loading
export function useLoadingState(initialLoading: boolean = true) {
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  
  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  
  return { isLoading, startLoading, stopLoading };
}

// Utilidad para renderizar múltiples skeletons
export function renderSkeletons(
  count: number, 
  SkeletonComponent: React.ComponentType<any>, 
  props: any = {}
) {
  return Array.from({ length: count }, (_, index) => (
    <SkeletonComponent key={`skeleton-${index}`} {...props} />
  ));
}

export { Skeleton, skeletonVariants };
