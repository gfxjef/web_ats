"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { Search, Filter, Grid3X3, List, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductGridSkeleton } from "@/components/ui/product-card-skeleton";
import { SearchInput } from "@/components/ui/search-input";
// import { PaginationProgress } from "@/components/ui/pagination-progress";
import { FilterSidebar } from "@/components/ui/filter-sidebar";
import { usePagination } from "@/hooks/use-pagination";
import { useFilters, createProductFilter } from "@/hooks/use-filters";
import { useSearch } from "@/hooks/use-debounce";
import { useLiquorToast } from "@/hooks/use-liquor-toast";
import { useCartContext } from "@/contexts/cart-context";
import Image from "next/image";
import Link from "next/link";

// Tipos para los productos
interface Product {
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

interface ApiResponse {
  success: boolean;
  data: Product[];
  meta: {
    categoria: string;
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  performance: {
    total_time: number;
    db_execution_time: number;
    cache_hit: boolean;
  };
}

// Función utilitaria para obtener la URL base de la API
const getApiUrl = (endpoint: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
  return `${baseUrl}${endpoint}`;
};

export default function CategoriaPage() {
  const params = useParams();
  const categoria = params.categoria as string;
  const toast = useLiquorToast();
  const cart = useCartContext();
  
  // Estados para vista y UI
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [paginationVariant, setPaginationVariant] = useState<'default' | 'compact' | 'detailed'>('default');
  const [autoScroll, setAutoScroll] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  
  // Hook de filtros
  const filters = useFilters({
    searchQuery: ''
  }, {
    persistToStorage: true,
    storageKey: `liquor-filters-${categoria}`
  });
  
  const {
    activeFilters,
    availableFilters,
    isFiltering,
    appliedFiltersCount,
    updateFilter,
    clearFilters,
    clearFilter,
    setAvailableFilters,
    filterItems,
    getFilterSummary
  } = filters;
  
  // Función de fetch para el hook de paginación
  const fetchProducts = useCallback(async (offset: number, limit: number) => {
    const response = await fetch(
      getApiUrl(`/api/v1/productos/categoria/${encodeURIComponent(categoria)}?limit=${limit}&offset=${offset}`),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'default',
        keepalive: true,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error('Error en la respuesta del servidor');
    }

    console.log(`⚡ Performance: ${data.performance.total_time}ms total, Cache: ${data.performance.cache_hit}`);
    
    return {
      data: data.data,
      total: data.meta.total,
      hasMore: data.meta.has_more,
      success: true
    };
  }, [categoria]);
  
  // Hook de paginación
  const pagination = usePagination<Product>(fetchProducts, {
    limit: 12,
    autoLoad: autoScroll,
    scrollThreshold: 400,
    maxItems: 500
  });
  
  const {
    items: allProducts,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    progress,
    page,
    isNearBottom,
    loadMore,
    reset,
    refresh
  } = pagination;
  
  // Aplicar filtros a los productos
  const filteredProducts = useMemo(() => {
    if (!isFiltering) return allProducts;
    
    const productFilter = createProductFilter(activeFilters);
    return allProducts.filter(productFilter);
  }, [allProducts, activeFilters, isFiltering]);
  
  // Alias para mantener compatibilidad
  const products = filteredProducts;

  // Resetear cuando cambia la categoría
  useEffect(() => {
    if (categoria) {
      reset();
      clearFilters(); // Limpiar filtros al cambiar categoría
    }
  }, [categoria]); // Solo depender de categoria, no de las funciones
  
  // Extraer filtros disponibles de los productos cargados
  useEffect(() => {
    if (allProducts.length > 0) {
      const subcategorias = Array.from(new Set(allProducts.map(p => p['Sub Categoria']).filter(Boolean)));
      const tamanos = Array.from(new Set(allProducts.map(p => p.Tamaño).filter(Boolean)));
      const precios = allProducts.map(p => p['Precio B']).filter(p => p > 0);
      
      setAvailableFilters({
        subcategorias: subcategorias.sort(),
        tamanos: tamanos.sort(),
        stock: ['Con Stock', 'Sin Stock'],
        precioMin: Math.min(...precios, 0),
        precioMax: Math.max(...precios, 1000)
      });
    }
  }, [allProducts, setAvailableFilters]);
  
  // Manejar errores con toast
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar productos', {
        description: error
      });
    }
  }, [error, toast]);

  // Scroll infinito - detectar cuando el usuario está cerca del final
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Cargar más cuando esté a 300px del final
      if (scrollTop + windowHeight >= documentHeight - 300) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, loadMore]);
  
  // Función de búsqueda para sugerencias
  const searchProducts = useCallback(async (query: string): Promise<Product[]> => {
    if (!query.trim()) return [];
    
    // Buscar en productos ya cargados
    const matchingProducts = allProducts.filter(product => {
      const searchText = query.toLowerCase();
      const productName = product.Nombre.toLowerCase();
      const productDesc = (product.Descripcion || '').toLowerCase();
      const productCategory = product['Sub Categoria'].toLowerCase();
      
      return productName.includes(searchText) || 
             productDesc.includes(searchText) || 
             productCategory.includes(searchText);
    });
    
    return matchingProducts.slice(0, 10); // Limitar resultados para sugerencias
  }, [allProducts]);
  
  // Hook de búsqueda con debounce
  const search = useSearch(searchProducts, {
    debounceMs: 300,
    minLength: 2,
    storageKey: `search-history-${categoria}`,
    enableHistory: true,
    maxSuggestions: 8
  });
  
  // Generar sugerencias basadas en productos
  const searchSuggestions = useMemo(() => {
    if (!search.query.trim() || search.query.length < 2) return [];
    
    const uniqueNames = new Set<string>();
    const suggestions = [];
    
    // Sugerencias de nombres de productos
    for (const product of allProducts) {
      const name = product.Nombre.toLowerCase();
      const query = search.query.toLowerCase();
      
      if (name.includes(query) && !uniqueNames.has(product.Nombre)) {
        uniqueNames.add(product.Nombre);
        suggestions.push({
          id: `product-${product.id}`,
          text: product.Nombre,
          type: 'suggestion' as const,
          category: product['Sub Categoria'],
          count: 1
        });
        
        if (suggestions.length >= 5) break;
      }
    }
    
    // Sugerencias de subcategorías
    const uniqueCategories = new Set<string>();
    for (const product of allProducts) {
      const category = product['Sub Categoria'].toLowerCase();
      const query = search.query.toLowerCase();
      
      if (category.includes(query) && !uniqueCategories.has(product['Sub Categoria'])) {
        uniqueCategories.add(product['Sub Categoria']);
        const categoryCount = allProducts.filter(p => p['Sub Categoria'] === product['Sub Categoria']).length;
        suggestions.push({
          id: `category-${product['Sub Categoria']}`,
          text: product['Sub Categoria'],
          type: 'suggestion' as const,
          category: 'Categoría',
          count: categoryCount
        });
        
        if (suggestions.length >= 8) break;
      }
    }
    
    return suggestions;
  }, [allProducts, search.query]);
  
  // Manejar cambio de búsqueda
  const handleSearchChange = useCallback((value: string) => {
    search.setQuery(value);
    updateFilter('searchQuery', value);
  }, [search.setQuery, updateFilter]);
  
  // Manejar búsqueda directa
  const handleSearch = useCallback((query: string) => {
    updateFilter('searchQuery', query);
    toast.success('Búsqueda aplicada', {
      description: `Buscando "${query}" en ${formatCategoryName(categoria)}`
    });
  }, [updateFilter, toast, categoria]);

  // Función para agregar producto al carrito
  const handleAddToCart = (product: Product) => {
    console.log('Agregando producto al carrito:', product);
    console.log('Cart object:', cart);
    
    try {
      cart.addItem(product, 1);
      toast.productAdded(product.Nombre, 1, product['Precio B']);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  // Formatear nombre de categoría para mostrar
  const formatCategoryName = (categoryName: string): string => {
    return categoryName
      .replace(/%20/g, ' ')
      .replace(/\+/g, ' ')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {formatCategoryName(categoria)}
              </h1>
              <p className="text-sm text-gray-600">
                {loading ? 'Cargando...' : `${total} productos disponibles`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda avanzada */}
        <div className="mb-6">
          <SearchInput
            value={search.query}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder={`Buscar en ${formatCategoryName(categoria)}...`}
            suggestions={searchSuggestions}
            history={search.history}
            trending={['Premium', 'Artesanal', 'Añejo', 'Importado']}
            isLoading={search.searchResult.isLoading}
            isDebouncing={search.isDebouncing}
            error={search.searchResult.error}
            searchTime={search.searchResult.searchTime}
            resultCount={search.searchResult.resultCount}
            onClearHistory={search.clearHistory}
            onRemoveFromHistory={search.removeFromHistory}
            showSuggestions={true}
            showHistory={true}
            showTrending={true}
            className="relative"
          />
        </div>

        {/* Filtros y ordenamiento */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={appliedFiltersCount > 0 ? "liquorOrange" : "outline"}
              onClick={() => setShowFilterSidebar(true)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {appliedFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs min-w-[1.25rem] h-5">
                  {appliedFiltersCount}
                </Badge>
              )}
            </Button>
            
            {appliedFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-red-600"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {isFiltering ? (
              <span>
                Mostrando {products.length} de {allProducts.length} productos
                {appliedFiltersCount > 0 && (
                  <span className="text-liquor-orange ml-1">(filtrados)</span>
                )}
              </span>
            ) : (
              <span>Mostrando {products.length} de {total}</span>
            )}
          </div>
        </div>
        
        {/* Filtros activos */}
        {isFiltering && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {getFilterSummary().map((summary, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {summary}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* FilterSidebar */}
        <FilterSidebar
          isOpen={showFilterSidebar}
          onClose={() => setShowFilterSidebar(false)}
          onFiltersChange={(newFilters) => {
            // Actualizar todos los filtros
            updateFilter('subcategorias', newFilters.subcategorias);
            updateFilter('tamanos', newFilters.tamanos);
            updateFilter('stock', newFilters.stock);
            updateFilter('precioRange', newFilters.precioRange);
            
            toast.success('Filtros aplicados', {
              description: `Se aplicaron ${Object.values(newFilters).flat().length} filtros`
            });
          }}
          availableFilters={availableFilters}
          activeFilters={activeFilters}
        />
      </div>

      {/* Contenido principal */}
      <div className="p-4">
        {loading ? (
          <ProductGridSkeleton 
            count={12} 
            variant="default" 
            showPrice={true}
            className={viewMode === 'grid' 
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
              : "grid-cols-1"
            }
          />
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar productos
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              variant="liquorOrange" 
              onClick={refresh}
            >
              Reintentar
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-4h-8m4-2v.01M9 7v.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              No se encontraron productos en la categoría {formatCategoryName(categoria)}
            </p>
            <Link href="/">
              <Button variant="liquorOrange">
                Explorar otras categorías
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Grid de productos */}
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <Link 
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="block group"
                >
                  <div 
                    className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group-hover:border-liquor-orange/50 ${
                      viewMode === 'list' ? 'flex items-center space-x-4' : ''
                    }`}
                  >
                  {/* Imagen del producto */}
                  <div className={`relative ${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-40 mb-3'}`}>
                    <div className={`bg-gray-100 rounded-xl overflow-hidden ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-full'}`}>
                      <Image 
                        src={product.Photo || "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"}
                        alt={product.Nombre}
                        width={viewMode === 'list' ? 96 : 160}
                        height={viewMode === 'list' ? 96 : 160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Stock badge */}
                    {product.Stock === 'Sin Stock' && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Agotado
                      </div>
                    )}
                    
                    {/* Botón + */}
                    {viewMode === 'grid' && (
                      <Button 
                        size="sm"
                        variant="liquorOrange"
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={product.Stock === 'Sin Stock'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </Button>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                      {product.Nombre}
                    </h4>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      {product.Tamaño} • {product['Sub Categoria']}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          S/{product['Precio B']}
                        </span>
                        {product['Precio J'] !== product['Precio B'] && (
                          <span className="text-sm text-gray-500 line-through">
                            S/{product['Precio J']}
                          </span>
                        )}
                      </div>
                      
                      {viewMode === 'list' && (
                        <Button 
                          variant="liquorOrange"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={product.Stock === 'Sin Stock'}
                        >
                          Agregar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                </Link>
              ))}
            </div>

            {/* Indicador de carga para scroll infinito */}
            {hasMore && loadingMore && (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center space-x-2 text-gray-500">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Cargando más productos...</span>
                </div>
              </div>
            )}
            
            {/* Mensaje cuando no hay más productos */}
            {!hasMore && products.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  Has visto todos los productos disponibles ({total} productos)
                </p>
              </div>
            )}
            
          </>
        )}
      </div>

      {/* Espaciado inferior para evitar solapamiento con navegación */}
      <div className="h-24"></div>
    </div>
  );
}