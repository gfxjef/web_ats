import { useState, useEffect, useCallback, useMemo } from 'react';

// Tipos para los filtros
export interface FilterOptions {
  subcategorias?: string[];
  tamanos?: string[];
  stock?: string[];
  precioMin?: number;
  precioMax?: number;
}

export interface ActiveFilters {
  subcategorias: string[];
  tamanos: string[];
  stock: string[];
  precioRange: [number, number];
  searchQuery?: string;
}

export interface FilterConfig {
  persistToUrl?: boolean;
  persistToStorage?: boolean;
  storageKey?: string;
  debounceMs?: number;
}

export interface UseFiltersResult {
  // Estado actual
  activeFilters: ActiveFilters;
  availableFilters: FilterOptions;
  isFiltering: boolean;
  appliedFiltersCount: number;
  
  // Acciones
  setActiveFilters: (filters: Partial<ActiveFilters>) => void;
  updateFilter: <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => void;
  clearFilters: () => void;
  clearFilter: (filterType: keyof ActiveFilters) => void;
  setAvailableFilters: (filters: FilterOptions) => void;
  
  // Utilidades
  filterItems: <T>(items: T[], filterFn: (item: T, filters: ActiveFilters) => boolean) => T[];
  getFilterSummary: () => string[];
}

export function useFilters<T = any>(
  initialFilters?: Partial<ActiveFilters>,
  config: FilterConfig = {}
): UseFiltersResult {
  const {
    persistToUrl = false,
    persistToStorage = true,
    storageKey = 'liquor-store-filters',
    debounceMs = 300
  } = config;

  // Estados principales
  const [activeFilters, setActiveFiltersState] = useState<ActiveFilters>(() => {
    const defaultFilters: ActiveFilters = {
      subcategorias: [],
      tamanos: [],
      stock: [],
      precioRange: [0, 1000],
      searchQuery: '',
      ...initialFilters
    };

    // Cargar desde localStorage si está habilitado
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedFilters = JSON.parse(saved);
          return { ...defaultFilters, ...parsedFilters };
        }
      } catch (error) {
        console.warn('Error loading filters from storage:', error);
      }
    }

    return defaultFilters;
  });

  const [availableFilters, setAvailableFilters] = useState<FilterOptions>({
    subcategorias: [],
    tamanos: [],
    stock: ['Con Stock', 'Sin Stock'],
    precioMin: 0,
    precioMax: 1000
  });

  // Calcular si hay filtros activos
  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    
    count += activeFilters.subcategorias.length;
    count += activeFilters.tamanos.length;
    count += activeFilters.stock.length;
    
    // Contar filtro de precio si no está en el rango completo
    const fullRange = activeFilters.precioRange[0] === (availableFilters.precioMin || 0) && 
                     activeFilters.precioRange[1] === (availableFilters.precioMax || 1000);
    if (!fullRange) count += 1;
    
    // Contar búsqueda si hay texto
    if (activeFilters.searchQuery && activeFilters.searchQuery.trim().length > 0) {
      count += 1;
    }
    
    return count;
  }, [activeFilters, availableFilters]);

  const isFiltering = appliedFiltersCount > 0;

  // Persistir filtros cuando cambien
  useEffect(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(activeFilters));
      } catch (error) {
        console.warn('Error saving filters to storage:', error);
      }
    }

    // TODO: Implementar persistencia en URL si está habilitada
    if (persistToUrl) {
      // Implementar con useRouter y URLSearchParams
    }
  }, [activeFilters, persistToStorage, persistToUrl, storageKey]);

  // Función para actualizar filtros
  const setActiveFilters = useCallback((newFilters: Partial<ActiveFilters>) => {
    setActiveFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Función para actualizar un filtro específico
  const updateFilter = useCallback(<K extends keyof ActiveFilters>(
    key: K, 
    value: ActiveFilters[K]
  ) => {
    setActiveFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Función para limpiar todos los filtros
  const clearFilters = useCallback(() => {
    const clearedFilters: ActiveFilters = {
      subcategorias: [],
      tamanos: [],
      stock: [],
      precioRange: [availableFilters.precioMin || 0, availableFilters.precioMax || 1000],
      searchQuery: ''
    };
    setActiveFiltersState(clearedFilters);
  }, [availableFilters]);

  // Función para limpiar un filtro específico
  const clearFilter = useCallback((filterType: keyof ActiveFilters) => {
    setActiveFiltersState(prev => {
      const updated = { ...prev };
      
      switch (filterType) {
        case 'subcategorias':
        case 'tamanos':
        case 'stock':
          updated[filterType] = [];
          break;
        case 'precioRange':
          updated.precioRange = [availableFilters.precioMin || 0, availableFilters.precioMax || 1000];
          break;
        case 'searchQuery':
          updated.searchQuery = '';
          break;
      }
      
      return updated;
    });
  }, [availableFilters]);

  // Función para filtrar items
  const filterItems = useCallback(<T>(
    items: T[], 
    filterFn: (item: T, filters: ActiveFilters) => boolean
  ): T[] => {
    if (!isFiltering) return items;
    return items.filter(item => filterFn(item, activeFilters));
  }, [activeFilters, isFiltering]);

  // Función para obtener resumen de filtros activos
  const getFilterSummary = useCallback((): string[] => {
    const summary: string[] = [];
    
    if (activeFilters.subcategorias.length > 0) {
      summary.push(`${activeFilters.subcategorias.length} subcategoría${activeFilters.subcategorias.length > 1 ? 's' : ''}`);
    }
    
    if (activeFilters.tamanos.length > 0) {
      summary.push(`${activeFilters.tamanos.length} tamaño${activeFilters.tamanos.length > 1 ? 's' : ''}`);
    }
    
    if (activeFilters.stock.length > 0) {
      summary.push(`${activeFilters.stock.length} disponibilidad`);
    }
    
    const fullRange = activeFilters.precioRange[0] === (availableFilters.precioMin || 0) && 
                     activeFilters.precioRange[1] === (availableFilters.precioMax || 1000);
    if (!fullRange) {
      summary.push(`S/${activeFilters.precioRange[0]} - S/${activeFilters.precioRange[1]}`);
    }
    
    if (activeFilters.searchQuery && activeFilters.searchQuery.trim().length > 0) {
      summary.push(`"${activeFilters.searchQuery.trim()}"`);
    }
    
    return summary;
  }, [activeFilters, availableFilters]);

  return {
    // Estado
    activeFilters,
    availableFilters,
    isFiltering,
    appliedFiltersCount,
    
    // Acciones
    setActiveFilters,
    updateFilter,
    clearFilters,
    clearFilter,
    setAvailableFilters,
    
    // Utilidades
    filterItems,
    getFilterSummary
  };
}

// Función utilitaria para filtrar productos de licorería
export function createProductFilter<T extends {
  'Sub Categoria'?: string;
  Tamaño?: string;
  Stock?: string;
  'Precio B'?: number;
  Nombre?: string;
  Descripcion?: string;
}>(filters: ActiveFilters) {
  return (product: T): boolean => {
    // Filtro por subcategorías
    if (filters.subcategorias.length > 0) {
      const productSubcategoria = product['Sub Categoria'] || '';
      if (!filters.subcategorias.includes(productSubcategoria)) {
        return false;
      }
    }

    // Filtro por tamaños
    if (filters.tamanos.length > 0) {
      const productTamano = product.Tamaño || '';
      if (!filters.tamanos.includes(productTamano)) {
        return false;
      }
    }

    // Filtro por stock
    if (filters.stock.length > 0) {
      const productStock = product.Stock || '';
      const hasStock = productStock !== 'Sin Stock' ? 'Con Stock' : 'Sin Stock';
      if (!filters.stock.includes(hasStock)) {
        return false;
      }
    }

    // Filtro por precio
    const productPrice = product['Precio B'] || 0;
    if (productPrice < filters.precioRange[0] || productPrice > filters.precioRange[1]) {
      return false;
    }

    // Filtro por búsqueda de texto
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const query = filters.searchQuery.toLowerCase().trim();
      const productName = (product.Nombre || '').toLowerCase();
      const productDesc = (product.Descripcion || '').toLowerCase();
      
      if (!productName.includes(query) && !productDesc.includes(query)) {
        return false;
      }
    }

    return true;
  };
}