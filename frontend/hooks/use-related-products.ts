import { useState, useEffect, useCallback, useMemo } from 'react';

// Tipos para productos relacionados
export interface RelatedProduct {
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
  'Sub Categoria Nivel': string;
  'Al Por Mayor': string;
  Top_S_Sku: string;
  Product_asig: string;
  Descripcion: string;
  Cantidad: number;
  Photo: string;
}

export interface RelatedProductsConfig {
  maxProducts?: number;
  includeCategories?: boolean;
  includeSubcategories?: boolean;
  includePriceRange?: boolean;
  includeBrand?: boolean;
  priceRangeTolerance?: number; // Porcentaje de tolerancia para rango de precios
  enableCache?: boolean;
  cacheDuration?: number; // en milisegundos
}

export interface RelatedProductsResult {
  products: RelatedProduct[];
  loading: boolean;
  error: string | null;
  hasProducts: boolean;
  isEmpty: boolean;
  total: number;
  categories: string[];
  refreshRelated: () => Promise<void>;
  getByCategory: (category: string) => RelatedProduct[];
  getByPriceRange: (minPrice: number, maxPrice: number) => RelatedProduct[];
}

// Función utilitaria para obtener la URL base de la API
const getApiUrl = (endpoint: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
  return `${baseUrl}${endpoint}`;
};

// Cache simple para productos relacionados
const relatedProductsCache = new Map<string, {
  data: RelatedProduct[];
  timestamp: number;
}>();

export function useRelatedProducts(
  currentProduct: RelatedProduct | null,
  config: RelatedProductsConfig = {}
): RelatedProductsResult {
  const {
    maxProducts = 8,
    includeCategories = true,
    includeSubcategories = true,
    includePriceRange = true,
    includeBrand = false,
    priceRangeTolerance = 0.3, // 30% de tolerancia
    enableCache = true,
    cacheDuration = 5 * 60 * 1000 // 5 minutos
  } = config;

  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generar clave de cache basada en el producto actual y configuración
  const cacheKey = useMemo(() => {
    if (!currentProduct) return null;
    return `${currentProduct.id}_${currentProduct.Categoria}_${currentProduct['Sub Categoria']}_${maxProducts}`;
  }, [currentProduct, maxProducts]);

  // Función para calcular similitud entre productos con algoritmos inteligentes
  const calculateSimilarity = useCallback((product: RelatedProduct, current: RelatedProduct): number => {
    let score = 0;
    let maxScore = 0;

    // Categoría exacta (40% del score)
    if (includeCategories) {
      maxScore += 40;
      if (product.Categoria === current.Categoria) {
        score += 40;
      } else {
        // Bonus por categorías relacionadas (ej: WHISKY vs WHISKEY)
        const categoryWords = current.Categoria.toLowerCase().split(/\s+/);
        const productCategoryWords = product.Categoria.toLowerCase().split(/\s+/);
        const commonWords = categoryWords.filter(word => 
          productCategoryWords.some(pWord => pWord.includes(word) || word.includes(pWord))
        );
        if (commonWords.length > 0) {
          score += 15; // Bonus por similitud parcial
        }
      }
    }

    // Subcategoría (30% del score)
    if (includeSubcategories) {
      maxScore += 30;
      if (product['Sub Categoria'] === current['Sub Categoria']) {
        score += 30;
      } else {
        // Bonus por subcategorías relacionadas
        const subCatWords = current['Sub Categoria'].toLowerCase().split(/\s+/);
        const productSubCatWords = product['Sub Categoria'].toLowerCase().split(/\s+/);
        const commonSubWords = subCatWords.filter(word => 
          productSubCatWords.some(pWord => pWord.includes(word) || word.includes(pWord))
        );
        if (commonSubWords.length > 0) {
          score += 10; // Bonus por similitud parcial
        }
      }
    }

    // Rango de precios inteligente (20% del score)
    if (includePriceRange) {
      maxScore += 20;
      const currentPrice = current['Precio B'];
      const productPrice = product['Precio B'];
      const priceRange = currentPrice * priceRangeTolerance;
      
      if (Math.abs(productPrice - currentPrice) <= priceRange) {
        const proximity = 1 - (Math.abs(productPrice - currentPrice) / priceRange);
        score += 20 * proximity;
      } else {
        // Bonus menor para productos en rangos de precio similares (premium, mid-range, budget)
        const priceTier = getPriceTier(currentPrice);
        const productTier = getPriceTier(productPrice);
        if (priceTier === productTier) {
          score += 5; // Bonus por tier similar
        }
      }
    }

    // Marca/Modelo/Características (10% del score)
    if (includeBrand) {
      maxScore += 10;
      if (product.Modelo === current.Modelo) {
        score += 10;
      } else {
        // Bonus por características similares
        let characteristicBonus = 0;
        
        // Tamaño similar
        if (product.Tamaño === current.Tamaño) {
          characteristicBonus += 3;
        }
        
        // Nivel similar (Premium, Standard, etc.)
        if (product['Sub Categoria Nivel'] === current['Sub Categoria Nivel']) {
          characteristicBonus += 3;
        }
        
        // Disponibilidad al por mayor
        if (product['Al Por Mayor'] === current['Al Por Mayor']) {
          characteristicBonus += 2;
        }

        // Stock similar (ambos con stock o ambos sin stock)
        if ((product.Stock === 'Con Stock') === (current.Stock === 'Con Stock')) {
          characteristicBonus += 2;
        }
        
        score += Math.min(characteristicBonus, 8); // Max 8 puntos de bonus
      }
    }

    return maxScore > 0 ? (score / maxScore) * 100 : 0;
  }, [includeCategories, includeSubcategories, includePriceRange, includeBrand, priceRangeTolerance]);

  // Función auxiliar para determinar tier de precio
  const getPriceTier = useCallback((price: number): string => {
    if (price >= 1000) return 'premium';
    if (price >= 500) return 'mid-range';
    if (price >= 200) return 'standard';
    return 'budget';
  }, []);

  // Función para obtener productos relacionados
  const fetchRelatedProducts = useCallback(async (product: RelatedProduct): Promise<RelatedProduct[]> => {
    if (!product) return [];

    // Verificar cache primero
    if (enableCache && cacheKey) {
      const cached = relatedProductsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < cacheDuration) {
        console.log('📦 Productos relacionados cargados desde cache');
        return cached.data;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();

      // Obtener productos de la misma categoría
      const categoryResponse = await fetch(
        getApiUrl(`/api/v1/productos/categoria/${encodeURIComponent(product.Categoria)}?limit=50&offset=0`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'default',
        }
      );

      if (!categoryResponse.ok) {
        throw new Error(`HTTP error! status: ${categoryResponse.status}`);
      }

      const categoryData = await categoryResponse.json();
      
      if (!categoryData.success) {
        throw new Error('Error en la respuesta del servidor');
      }

      let allProducts: RelatedProduct[] = categoryData.data || [];

      // Si necesitamos más productos, obtener de categorías similares
      if (allProducts.length < maxProducts * 2) {
        try {
          // Obtener productos de todas las categorías para encontrar similares
          const allCategoriesResponse = await fetch(
            getApiUrl(`/api/v1/productos?limit=100&offset=0`),
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              cache: 'default',
            }
          );

          if (allCategoriesResponse.ok) {
            const allCategoriesData = await allCategoriesResponse.json();
            if (allCategoriesData.success && allCategoriesData.data) {
              // Combinar productos, evitando duplicados
              const existingIds = new Set(allProducts.map(p => p.id));
              const additionalProducts = allCategoriesData.data.filter(
                (p: RelatedProduct) => !existingIds.has(p.id)
              );
              allProducts = [...allProducts, ...additionalProducts];
            }
          }
        } catch (additionalError) {
          console.warn('Error obteniendo productos adicionales:', additionalError);
        }
      }

      // Filtrar el producto actual
      const candidateProducts = allProducts.filter(p => p.id !== product.id);

      // Calcular similitud y ordenar
      const productsWithSimilarity = candidateProducts.map(p => ({
        product: p,
        similarity: calculateSimilarity(p, product)
      }));

      // Ordenar por similitud y tomar los mejores
      const sortedProducts = productsWithSimilarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxProducts)
        .map(item => item.product);

      const endTime = performance.now();
      console.log(`🔗 Productos relacionados calculados en: ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`📊 Encontrados ${sortedProducts.length} productos relacionados de ${candidateProducts.length} candidatos`);

      // Guardar en cache
      if (enableCache && cacheKey) {
        relatedProductsCache.set(cacheKey, {
          data: sortedProducts,
          timestamp: Date.now()
        });
      }

      return sortedProducts;

    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error obteniendo productos relacionados:', err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [calculateSimilarity, maxProducts, enableCache, cacheKey, cacheDuration]);

  // Cargar productos relacionados cuando cambia el producto actual
  useEffect(() => {
    if (currentProduct) {
      fetchRelatedProducts(currentProduct).then(setProducts);
    } else {
      setProducts([]);
      setError(null);
    }
  }, [currentProduct, fetchRelatedProducts]);

  // Función para refrescar productos relacionados
  const refreshRelated = useCallback(async () => {
    if (currentProduct) {
      // Limpiar cache
      if (enableCache && cacheKey) {
        relatedProductsCache.delete(cacheKey);
      }
      const newProducts = await fetchRelatedProducts(currentProduct);
      setProducts(newProducts);
    }
  }, [currentProduct, fetchRelatedProducts, enableCache, cacheKey]);

  // Funciones de filtrado
  const getByCategory = useCallback((category: string) => {
    return products.filter(p => p.Categoria === category);
  }, [products]);

  const getByPriceRange = useCallback((minPrice: number, maxPrice: number) => {
    return products.filter(p => p['Precio B'] >= minPrice && p['Precio B'] <= maxPrice);
  }, [products]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p['Sub Categoria']))).filter(Boolean);
  }, [products]);

  return {
    products,
    loading,
    error,
    hasProducts: products.length > 0,
    isEmpty: !loading && products.length === 0,
    total: products.length,
    categories,
    refreshRelated,
    getByCategory,
    getByPriceRange,
  };
}

// Hook auxiliar para obtener productos relacionados por categoría específica
export function useRelatedProductsByCategory(
  category: string,
  excludeIds: number[] = [],
  limit: number = 6
) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryProducts = useCallback(async () => {
    if (!category) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        getApiUrl(`/api/v1/productos/categoria/${encodeURIComponent(category)}?limit=${limit * 2}&offset=0`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'default',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Error en la respuesta del servidor');
      }

      // Filtrar productos excluidos y limitar cantidad
      const filteredProducts = (data.data || [])
        .filter((p: RelatedProduct) => !excludeIds.includes(p.id))
        .slice(0, limit);

      setProducts(filteredProducts);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error obteniendo productos por categoría:', err);
    } finally {
      setLoading(false);
    }
  }, [category, excludeIds, limit]);

  useEffect(() => {
    fetchCategoryProducts();
  }, [fetchCategoryProducts]);

  return {
    products,
    loading,
    error,
    hasProducts: products.length > 0,
    refresh: fetchCategoryProducts,
  };
}