import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para debounce de valores con control avanzado
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook avanzado para debounce con cancelación y estado de loading
 */
export function useAdvancedDebounce<T>(
  value: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
) {
  const { leading = false, trailing = true, maxWait } = options;
  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>();
  const lastInvokeTimeRef = useRef<number>(0);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
    setIsDebouncing(false);
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setDebouncedValue(value);
      setIsDebouncing(false);
      lastInvokeTimeRef.current = Date.now();
    }
  }, [value]);

  useEffect(() => {
    const now = Date.now();
    lastCallTimeRef.current = now;
    
    const shouldInvokeLeading = leading && (!lastInvokeTimeRef.current || (now - lastInvokeTimeRef.current >= delay));
    
    if (shouldInvokeLeading) {
      setDebouncedValue(value);
      lastInvokeTimeRef.current = now;
      if (!trailing) return;
    }

    setIsDebouncing(true);

    // Configurar timeout principal
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
        lastInvokeTimeRef.current = Date.now();
      }
      setIsDebouncing(false);
    }, delay);

    // Configurar maxWait si está definido
    if (maxWait && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        lastInvokeTimeRef.current = Date.now();
        setIsDebouncing(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
      }, maxWait);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
        maxTimeoutRef.current = undefined;
      }
    };
  }, [value, delay, leading, trailing, maxWait]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    debouncedValue,
    isDebouncing,
    cancel,
    flush
  };
}

/**
 * Hook para manejar búsquedas con debounce y funcionalidades avanzadas
 */
export interface UseSearchOptions {
  debounceMs?: number;
  minLength?: number;
  maxSuggestions?: number;
  storageKey?: string;
  enableHistory?: boolean;
  enableTrending?: boolean;
}

export interface SearchResult<T> {
  query: string;
  results: T[];
  isLoading: boolean;
  isEmpty: boolean;
  hasError: boolean;
  error?: string;
  searchTime?: number;
  resultCount: number;
}

export function useSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  options: UseSearchOptions = {}
) {
  const {
    debounceMs = 300,
    minLength = 2,
    maxSuggestions = 10,
    storageKey = 'search-history',
    enableHistory = true,
    enableTrending = false
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  
  const { debouncedValue: debouncedQuery, isDebouncing } = useAdvancedDebounce(
    query,
    debounceMs,
    { trailing: true, maxWait: debounceMs * 3 }
  );

  const abortControllerRef = useRef<AbortController>();

  // Cargar historial desde localStorage
  useEffect(() => {
    if (enableHistory && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedHistory = JSON.parse(saved);
          setHistory(Array.isArray(parsedHistory) ? parsedHistory.slice(0, maxSuggestions) : []);
        }
      } catch (error) {
        console.warn('Error loading search history:', error);
      }
    }
  }, [enableHistory, storageKey, maxSuggestions]);

  // Guardar en historial
  const addToHistory = useCallback((searchQuery: string) => {
    if (!enableHistory || !searchQuery.trim() || searchQuery.length < minLength) return;

    setHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(item => item !== searchQuery)]
        .slice(0, maxSuggestions);
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newHistory));
        } catch (error) {
          console.warn('Error saving search history:', error);
        }
      }
      
      return newHistory;
    });
  }, [enableHistory, minLength, maxSuggestions, storageKey]);

  // Realizar búsqueda
  const performSearch = useCallback(async (searchQuery: string): Promise<void> => {
    if (!searchQuery.trim() || searchQuery.length < minLength) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Cancelar búsqueda anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    const startTime = performance.now();

    try {
      const searchResults = await searchFunction(searchQuery);
      const endTime = performance.now();
      
      setResults(searchResults);
      setSearchTime(endTime - startTime);
      addToHistory(searchQuery);
      
      console.log(`🔍 Búsqueda "${searchQuery}" completada en ${(endTime - startTime).toFixed(2)}ms`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorMessage = err instanceof Error ? err.message : 'Error en la búsqueda';
        setError(errorMessage);
        console.error('Error en búsqueda:', err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = undefined;
    }
  }, [searchFunction, minLength, addToHistory]);

  // Efecto para realizar búsqueda cuando cambia el query debounced
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Limpiar historial
  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('Error clearing search history:', error);
      }
    }
  }, [storageKey]);

  // Remover elemento del historial
  const removeFromHistory = useCallback((item: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(historyItem => historyItem !== item);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newHistory));
        } catch (error) {
          console.warn('Error updating search history:', error);
        }
      }
      return newHistory;
    });
  }, [storageKey]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const searchResult: SearchResult<T> = {
    query: debouncedQuery,
    results,
    isLoading,
    isEmpty: !isLoading && results.length === 0 && debouncedQuery.length >= minLength,
    hasError: !!error,
    error: error || undefined,
    searchTime,
    resultCount: results.length
  };

  return {
    // Estado actual
    query,
    setQuery,
    searchResult,
    isDebouncing,
    history,
    trending,
    
    // Acciones
    performSearch: (q: string) => performSearch(q),
    clearHistory,
    removeFromHistory,
    
    // Utilidades
    canSearch: query.length >= minLength,
    hasQuery: query.trim().length > 0,
    hasResults: results.length > 0,
  };
}