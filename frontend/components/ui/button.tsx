import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // Variantes específicas para licorería
        liquorOrange: 'bg-liquor-orange text-liquor-orange-foreground hover:bg-liquor-orange/90 shadow-md hover:shadow-lg',
        liquorAmber: 'bg-liquor-amber text-liquor-amber-foreground hover:bg-liquor-amber/90 shadow-md hover:shadow-lg',
        liquorPurple: 'bg-liquor-purple text-liquor-purple-foreground hover:bg-liquor-purple/90 shadow-md hover:shadow-lg',
        liquorGold: 'bg-liquor-gold text-liquor-gold-foreground hover:bg-liquor-gold/90 shadow-md hover:shadow-lg',
        // Outline variants para licorería
        liquorOrangeOutline: 'border-2 border-liquor-orange text-liquor-orange bg-transparent hover:bg-liquor-orange hover:text-liquor-orange-foreground',
        liquorAmberOutline: 'border-2 border-liquor-amber text-liquor-amber bg-transparent hover:bg-liquor-amber hover:text-liquor-amber-foreground',
        liquorPurpleOutline: 'border-2 border-liquor-purple text-liquor-purple bg-transparent hover:bg-liquor-purple hover:text-liquor-purple-foreground',
        liquorGoldOutline: 'border-2 border-liquor-gold text-liquor-gold bg-transparent hover:bg-liquor-gold hover:text-liquor-gold-foreground',
      },
      size: {
        xs: 'h-8 px-2 py-1 text-xs rounded-sm',
        sm: 'h-9 px-3 py-2 text-sm rounded-md',
        default: 'h-10 px-4 py-2 text-sm rounded-md',
        lg: 'h-11 px-8 py-2 text-base rounded-lg',
        xl: 'h-12 px-10 py-3 text-lg rounded-xl',
        icon: 'h-10 w-10',
        iconSm: 'h-8 w-8',
        iconLg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
