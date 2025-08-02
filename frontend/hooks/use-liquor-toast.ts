import { toast } from "sonner";
import { ShoppingCart, CheckCircle, AlertCircle, Info, X } from "lucide-react";

// Tipos de toast específicos para licorería
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'cart';

// Opciones extendidas para toasts de licorería
export interface LiquorToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  productName?: string;
  productPrice?: number;
  quantity?: number;
}

// Hook personalizado para toasts de licorería
export function useLiquorToast() {
  
  const showToast = (type: ToastType, options: LiquorToastOptions) => {
    const { title, description, duration = 4000, action, productName, productPrice, quantity } = options;

    switch (type) {
      case 'success':
        return toast.success(title || '¡Éxito!', {
          description,
          duration,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        });

      case 'error':
        return toast.error(title || '¡Error!', {
          description,
          duration,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        });

      case 'warning':
        return toast.warning(title || '¡Atención!', {
          description,
          duration,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        });

      case 'info':
        return toast.info(title || 'Información', {
          description,
          duration,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        });

      case 'cart':
        const cartTitle = productName ? `${productName} agregado al carrito` : 'Producto agregado al carrito';
        const cartDescription = productPrice && quantity 
          ? `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} • S/${productPrice * quantity}`
          : description;

        return toast.success(cartTitle, {
          description: cartDescription,
          duration,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : {
            label: 'Ver Carrito',
            onClick: () => {
              // Navegar al carrito - implementar según tu routing
              console.log('Navegando al carrito...');
            },
          },
        });

      default:
        return toast(title || 'Notificación', {
          description,
          duration,
        });
    }
  };

  // Métodos de conveniencia específicos para licorería
  const success = (title: string, options?: Omit<LiquorToastOptions, 'title'>) => 
    showToast('success', { title, ...options });

  const error = (title: string, options?: Omit<LiquorToastOptions, 'title'>) => 
    showToast('error', { title, ...options });

  const warning = (title: string, options?: Omit<LiquorToastOptions, 'title'>) => 
    showToast('warning', { title, ...options });

  const info = (title: string, options?: Omit<LiquorToastOptions, 'title'>) => 
    showToast('info', { title, ...options });

  const addToCart = (productName: string, options?: Omit<LiquorToastOptions, 'productName'>) => 
    showToast('cart', { productName, ...options });

  // Toasts específicos para casos de uso de licorería
  const productAdded = (productName: string, quantity: number = 1, price?: number) => {
    return addToCart(productName, {
      quantity,
      productPrice: price,
    });
  };

  const stockWarning = (productName: string) => {
    return warning('Stock limitado', {
      description: `Solo quedan pocas unidades de ${productName}`,
      action: {
        label: 'Ver alternativas',
        onClick: () => console.log('Mostrando productos similares...'),
      },
    });
  };

  const outOfStock = (productName: string) => {
    return error('Producto agotado', {
      description: `${productName} no está disponible temporalmente`,
      action: {
        label: 'Notificarme',
        onClick: () => console.log('Configurando notificación...'),
      },
    });
  };

  const orderSuccess = (orderNumber?: string) => {
    return success('¡Pedido enviado exitosamente!', {
      description: orderNumber 
        ? `Tu pedido #${orderNumber} será procesado pronto`
        : 'Recibirás una confirmación en WhatsApp',
      duration: 6000,
    });
  };

  const minimumOrderWarning = (currentTotal: number, minimumRequired: number) => {
    const remaining = minimumRequired - currentTotal;
    return warning('Pedido mínimo no alcanzado', {
      description: `Necesitas agregar S/${remaining} más para delivery`,
      action: {
        label: 'Seguir comprando',
        onClick: () => console.log('Redirigiendo a productos...'),
      },
    });
  };

  // Método para cerrar todos los toasts
  const dismiss = () => toast.dismiss();

  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
    addToCart,
    productAdded,
    stockWarning,
    outOfStock,
    orderSuccess,
    minimumOrderWarning,
    dismiss,
  };
}

// Export directo para usar sin hook
export const liquorToast = {
  success: (title: string, options?: Omit<LiquorToastOptions, 'title'>) => 
    toast.success(title, options),
    
  error: (title: string, options?: Omit<LiquorToastOptions, 'title'>) => 
    toast.error(title, options),
    
  warning: (title: string, options?: Omit<LiquorToastOptions, 'title'>) => 
    toast.warning(title, options),
    
  info: (title: string, options?: Omit<LiquorToastOptions, 'title'>) => 
    toast.info(title, options),
    
  cart: (productName: string, options?: Omit<LiquorToastOptions, 'productName'>) => {
    const { quantity, productPrice, ...rest } = options || {};
    const description = productPrice && quantity 
      ? `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} • S/${productPrice * quantity}`
      : rest.description;
      
    return toast.success(`${productName} agregado al carrito`, {
      ...rest,
      description,
    });
  },
};