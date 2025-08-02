import { useState, useEffect, useCallback, useRef } from 'react';

export interface PaginationConfig {
  limit?: number;
  initialOffset?: number;
  autoLoad?: boolean;
  scrollThreshold?: number;
  maxItems?: number;
}

export interface PaginationState<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  offset: number;
  limit: number;
  page: number;
}

export interface PaginationActions {
  loadMore: () => Promise<void>;
  reset: () => Promise<void>;
  refresh: () => Promise<void>;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setTotal: (total: number) => void;
}

export interface UsePaginationResult<T> extends PaginationState<T>, PaginationActions {
  isNearBottom: boolean;
  progress: number;
}

export function usePagination<T = any>(
  fetchFunction: (offset: number, limit: number) => Promise<{
    data: T[];
    total: number;
    hasMore: boolean;
    success: boolean;
  }>,
  config: PaginationConfig = {}
): UsePaginationResult<T> {
  const {
    limit = 12,
    initialOffset = 0,
    autoLoad = false,
    scrollThreshold = 300,
    maxItems = 1000
  } = config;

  // Estados principales
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(initialOffset);
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Referencias
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cálculos derivados
  const page = Math.floor(offset / limit) + 1;
  const progress = total > 0 ? Math.min((items.length / total) * 100, 100) : 0;

  // Referencias estables para evitar bucles
  const fetchFunctionRef = useRef(fetchFunction);
  const limitRef = useRef(limit);
  const maxItemsRef = useRef(maxItems);
  
  // Actualizar refs cuando cambien las props
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);
  
  useEffect(() => {
    limitRef.current = limit;
  }, [limit]);
  
  useEffect(() => {
    maxItemsRef.current = maxItems;
  }, [maxItems]);

  // Función para cargar datos - ahora estable
  const loadData = useCallback(async (isReset = false, isLoadMore = false) => {
    if (isLoadingRef.current) return;
    
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    isLoadingRef.current = true;

    try {
      const currentOffset = isReset ? 0 : offset;
      
      if (isReset) {
        setLoading(true);
        setError(null);
      } else if (isLoadMore) {
        setLoadingMore(true);
      }

      const startTime = performance.now();
      const response = await fetchFunctionRef.current(currentOffset, limitRef.current);
      const endTime = performance.now();

      if (!response.success) {
        throw new Error('Error en la respuesta del servidor');
      }

      console.log(`📊 Paginación cargada en: ${(endTime - startTime).toFixed(2)}ms`);

      if (isReset) {
        setItems(response.data);
        setOffset(limitRef.current);
      } else {
        setItems(prev => {
          // Evitar duplicados basados en ID si existe
          const newItems = response.data.filter(newItem => {
            if (newItem && typeof newItem === 'object' && 'id' in newItem) {
              return !prev.some(existingItem => 
                existingItem && typeof existingItem === 'object' && 'id' in existingItem && 
                (existingItem as any).id === (newItem as any).id
              );
            }
            return true;
          });
          
          const combined = [...prev, ...newItems];
          
          // Respetar límite máximo de items
          return combined.length > maxItemsRef.current ? combined.slice(0, maxItemsRef.current) : combined;
        });
        setOffset(prev => prev + limitRef.current);
      }

      setHasMore(response.hasMore && items.length < maxItemsRef.current);
      setTotal(response.total);

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error en paginación:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [offset]); // Solo depender de offset

  // Acciones públicas
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingRef.current) return;
    await loadData(false, true);
  }, [hasMore, loadData]);

  const reset = useCallback(async () => {
    setItems([]);
    setOffset(0);
    setError(null);
    await loadData(true);
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  // Auto-scroll detection
  useEffect(() => {
    if (!autoLoad) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const nearBottom = distanceFromBottom < scrollThreshold;
      
      setIsNearBottom(nearBottom);
      
      if (nearBottom && hasMore && !isLoadingRef.current) {
        loadMore();
      }
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [autoLoad, hasMore, loadMore, scrollThreshold]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Estado
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    offset,
    limit,
    page,
    isNearBottom,
    progress,
    
    // Acciones
    loadMore,
    reset,
    refresh,
    setError,
    setHasMore,
    setTotal,
  };
}

// Utility function para throttle
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}