import { useState, useEffect, useCallback, useMemo } from 'react';

// Tipos para el carrito
export interface CartItem {
  id: number;
  SKU: string;
  Nombre: string;
  Modelo: string;
  Tamaño: string;
  'Precio B': number;
  'Precio J': number;
  Categoria: string;
  'Sub Categoria': string;
  Stock: string;
  Photo: string;
  quantity: number;
  addedAt: string; // ISO string
  unitPrice: number; // Precio al momento de agregar (para histórico)
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  taxRate: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
  uniqueItemCount: number;
}

export interface CartConfig {
  storageKey?: string;
  taxRate?: number;
  freeShippingThreshold?: number;
  shippingCost?: number;
  enablePersistence?: boolean;
  maxQuantityPerItem?: number;
}

export interface UseCartResult {
  // Estado del carrito
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  isEmpty: boolean;
  hasItems: boolean;
  
  // Acciones básicas
  addItem: (product: Omit<CartItem, 'quantity' | 'addedAt' | 'unitPrice'>, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  
  // Acciones avanzadas
  incrementQuantity: (productId: number) => void;
  decrementQuantity: (productId: number) => void;
  getItem: (productId: number) => CartItem | undefined;
  getItemQuantity: (productId: number) => number;
  isInCart: (productId: number) => boolean;
  
  // Utilidades
  getTotalItems: () => number;
  getTotalValue: () => number;
  getCartWeight: () => number;
  canAddMore: (productId: number) => boolean;
  
  // Persistencia
  saveCart: () => void;
  loadCart: () => void;
  exportCart: () => string;
  importCart: (cartData: string) => boolean;
}

// Configuración por defecto
const defaultConfig: Required<CartConfig> = {
  storageKey: 'liquor-cart',
  taxRate: 0.16, // 16% IVA en México
  freeShippingThreshold: 1500, // Envío gratis a partir de $1500
  shippingCost: 150, // $150 de envío estándar
  enablePersistence: true,
  maxQuantityPerItem: 50,
};

export function useCart(config: CartConfig = {}): UseCartResult {
  const mergedConfig = { ...defaultConfig, ...config };
  const {
    storageKey,
    taxRate,
    freeShippingThreshold,
    shippingCost,
    enablePersistence,
    maxQuantityPerItem,
  } = mergedConfig;

  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      loadCart();
    }
  }, [enablePersistence]);

  // Guardar carrito automáticamente cuando cambie
  useEffect(() => {
    if (enablePersistence && items.length >= 0) {
      saveCart();
    }
  }, [items, enablePersistence]);

  // Calcular resumen del carrito
  const summary = useMemo((): CartSummary => {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueItemCount = items.length;
    
    const tax = subtotal * taxRate;
    
    // Calcular envío
    const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
    
    // Descuento (se puede expandir con lógica de promociones)
    const discount = 0;
    
    const total = subtotal + tax + shipping - discount;

    return {
      subtotal,
      tax,
      taxRate,
      shipping,
      discount,
      total,
      itemCount,
      uniqueItemCount,
    };
  }, [items, taxRate, freeShippingThreshold, shippingCost]);

  // Estados derivados
  const isEmpty = items.length === 0;
  const hasItems = items.length > 0;

  // Función para agregar item al carrito
  const addItem = useCallback((
    product: Omit<CartItem, 'quantity' | 'addedAt' | 'unitPrice'>, 
    quantity: number = 1
  ) => {
    if (quantity <= 0) return;

    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Si el item ya existe, actualizar cantidad
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          maxQuantityPerItem
        );
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };
        
        return updatedItems;
      } else {
        // Si es un item nuevo, agregarlo
        const newItem: CartItem = {
          ...product,
          quantity: Math.min(quantity, maxQuantityPerItem),
          addedAt: new Date().toISOString(),
          unitPrice: product['Precio B'], // Guardar precio al momento de agregar
        };
        
        return [...prevItems, newItem];
      }
    });
  }, [maxQuantityPerItem]);

  // Función para remover item del carrito
  const removeItem = useCallback((productId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  // Función para actualizar cantidad
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: Math.min(quantity, maxQuantityPerItem) }
          : item
      )
    );
  }, [removeItem, maxQuantityPerItem]);

  // Función para limpiar carrito
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Incrementar cantidad
  const incrementQuantity = useCallback((productId: number) => {
    const item = items.find(item => item.id === productId);
    if (item && item.quantity < maxQuantityPerItem) {
      updateQuantity(productId, item.quantity + 1);
    }
  }, [items, maxQuantityPerItem, updateQuantity]);

  // Decrementar cantidad
  const decrementQuantity = useCallback((productId: number) => {
    const item = items.find(item => item.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity - 1);
    }
  }, [items, updateQuantity]);

  // Obtener item específico
  const getItem = useCallback((productId: number): CartItem | undefined => {
    return items.find(item => item.id === productId);
  }, [items]);

  // Obtener cantidad de un item específico
  const getItemQuantity = useCallback((productId: number): number => {
    const item = getItem(productId);
    return item ? item.quantity : 0;
  }, [getItem]);

  // Verificar si un producto está en el carrito
  const isInCart = useCallback((productId: number): boolean => {
    return items.some(item => item.id === productId);
  }, [items]);

  // Obtener total de items
  const getTotalItems = useCallback((): number => {
    return summary.itemCount;
  }, [summary.itemCount]);

  // Obtener valor total del carrito
  const getTotalValue = useCallback((): number => {
    return summary.total;
  }, [summary.total]);

  // Calcular peso del carrito (para envío)
  const getCartWeight = useCallback((): number => {
    // Asumir peso promedio por tipo de producto
    const weightMap: Record<string, number> = {
      'WHISKY': 1.2,
      'CERVEZA': 0.5,
      'VODKA': 1.0,
      'RON': 1.0,
      'TEQUILA': 1.0,
      'VINO': 0.8,
    };

    return items.reduce((totalWeight, item) => {
      const unitWeight = weightMap[item.Categoria] || 1.0;
      return totalWeight + (unitWeight * item.quantity);
    }, 0);
  }, [items]);

  // Verificar si se puede agregar más cantidad de un producto
  const canAddMore = useCallback((productId: number): boolean => {
    const item = getItem(productId);
    if (!item) return true;
    return item.quantity < maxQuantityPerItem;
  }, [getItem, maxQuantityPerItem]);

  // Guardar carrito en localStorage
  const saveCart = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const cartData = {
        items,
        savedAt: new Date().toISOString(),
        version: '1.0',
      };
      localStorage.setItem(storageKey, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items, storageKey]);

  // Cargar carrito desde localStorage
  const loadCart = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      setIsLoading(true);
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const cartData = JSON.parse(savedData);
        
        // Validar formato de datos
        if (cartData.items && Array.isArray(cartData.items)) {
          setItems(cartData.items);
          console.log(`🛒 Carrito cargado: ${cartData.items.length} items`);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Exportar carrito como JSON
  const exportCart = useCallback((): string => {
    const exportData = {
      items,
      summary,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(exportData, null, 2);
  }, [items, summary]);

  // Importar carrito desde JSON
  const importCart = useCallback((cartData: string): boolean => {
    try {
      const data = JSON.parse(cartData);
      
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
        console.log(`🛒 Carrito importado: ${data.items.length} items`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing cart:', error);
      return false;
    }
  }, []);

  return {
    // Estado
    items,
    summary,
    isLoading,
    isEmpty,
    hasItems,
    
    // Acciones básicas
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    
    // Acciones avanzadas
    incrementQuantity,
    decrementQuantity,
    getItem,
    getItemQuantity,
    isInCart,
    
    // Utilidades
    getTotalItems,
    getTotalValue,
    getCartWeight,
    canAddMore,
    
    // Persistencia
    saveCart,
    loadCart,
    exportCart,
    importCart,
  };
}