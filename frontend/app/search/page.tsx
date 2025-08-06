"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, Grid3X3, List, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductGridSkeleton } from "@/components/ui/product-card-skeleton";
import { SearchInput } from "@/components/ui/search-input";
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nombreParam = searchParams.get('nombre') || '';
  const toast = useLiquorToast();
  const cart = useCartContext();
  
  // Estados para vista y UI
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Configuración de filtros memoizada para evitar re-creaciones
  const filterInitialValues = useMemo(() => ({
    searchQuery: '' // No inicializar con nombreParam para evitar doble filtrado
  }), []);
  
  const filterConfig = useMemo(() => ({
    persistToStorage: true,
    storageKey: `liquor-filters-search`
  }), []);

  // Hook de filtros
  const filters = useFilters(filterInitialValues, filterConfig);
  
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
  
  // Función para buscar productos por nombre
  const searchProductsByName = useCallback(async () => {
    if (!nombreParam) {
      setAllProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Buscando productos con nombre: ${nombreParam}`);
      
      const response = await fetch(
        getApiUrl(`/api/v1/productos/buscar/${encodeURIComponent(nombreParam)}?limit=100`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'default',
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Error en la respuesta del servidor');
      }

      console.log(`✅ Productos encontrados: ${data.data?.length || 0} items`);
      console.log(`⚡ Performance: ${data.performance.total_time}ms total, Cache: ${data.performance.cache_hit}`);
      
      setAllProducts(data.data || []);
    } catch (error) {
      console.error('❌ Error buscando productos:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      // Remover toast de aquí para evitar dependencia inestable
      // toast.error('Error al buscar productos', {
      //   description: 'No se pudieron cargar los resultados de búsqueda'
      // });
    } finally {
      setLoading(false);
    }
  }, [nombreParam]); // Remover toast de las dependencias
  
  // Aplicar filtros a los productos
  const filteredProducts = useMemo(() => {
    // Si no hay filtros activos (excepto searchQuery vacío), mostrar todos los productos
    const hasActiveFilters = 
      (activeFilters.searchQuery && activeFilters.searchQuery.trim() !== '') ||
      (activeFilters.subcategorias && activeFilters.subcategorias.length > 0) ||
      (activeFilters.tamanos && activeFilters.tamanos.length > 0) ||
      (activeFilters.stock && activeFilters.stock.length > 0) ||
      (activeFilters.precioRange && activeFilters.precioRange.length > 0);
    
    if (!hasActiveFilters) return allProducts;
    
    const productFilter = createProductFilter(activeFilters);
    return allProducts.filter(productFilter);
  }, [allProducts, activeFilters]);
  
  const products = filteredProducts;

  // Buscar productos cuando cambia el parámetro nombre
  useEffect(() => {
    searchProductsByName();
  }, [searchProductsByName]);

  // Manejar errores con toast de forma separada para evitar dependencias circulares
  useEffect(() => {
    if (error) {
      toast.error('Error al buscar productos', {
        description: 'No se pudieron cargar los resultados de búsqueda'
      });
    }
  }, [error, toast]);
  
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
  
  // Función de búsqueda adicional (memoizada sin dependencias para evitar re-creaciones)
  const searchProducts = useCallback(async (query: string): Promise<Product[]> => {
    if (!query.trim()) return [];
    
    try {
      const response = await fetch(getApiUrl(`/api/v1/productos/buscar/${encodeURIComponent(query)}?limit=10`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'default',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      return [];
    }
  }, []); // Sin dependencias ya que getApiUrl es estable
  
  // Configuración del hook de búsqueda memoizada
  const searchConfig = useMemo(() => ({
    debounceMs: 300,
    minLength: 2,
    storageKey: `search-history-global`,
    enableHistory: true,
    maxSuggestions: 8
  }), []);

  // Hook de búsqueda con debounce
  const search = useSearch(searchProducts, searchConfig);
  
  // Manejar cambio de búsqueda
  const handleSearchChange = useCallback((value: string) => {
    search.setQuery(value);
    // Solo actualizar el filtro si hay un valor real
    if (value.trim()) {
      updateFilter('searchQuery', value);
    } else {
      updateFilter('searchQuery', '');
    }
  }, [search, updateFilter]);
  
  // Manejar búsqueda directa
  const handleSearch = useCallback((query: string) => {
    router.push(`/search?nombre=${encodeURIComponent(query)}`);
  }, [router]);

  // Función para agregar producto al carrito
  const handleAddToCart = (product: Product) => {
    try {
      cart.addItem(product, 1);
      toast.productAdded(product.Nombre, 1, product['Precio B']);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Resultados de búsqueda
              </h1>
              <p className="text-sm text-gray-600">
                {loading ? 'Buscando...' : `${allProducts.length} productos encontrados para "${nombreParam}"`}
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

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <SearchInput
            value={search.query || nombreParam}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder="Buscar productos..."
            isLoading={search.searchResult.isLoading}
            isDebouncing={search.isDebouncing}
            error={search.searchResult.error}
            searchTime={search.searchResult.searchTime}
            resultCount={search.searchResult.resultCount}
            showSuggestions={false}
            showHistory={false}
            showTrending={false}
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
              <span>Mostrando {products.length} productos</span>
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
            try {
              // Actualizar todos los filtros
              updateFilter('subcategorias', newFilters.subcategorias || []);
              updateFilter('tamanos', newFilters.tamanos || []);
              updateFilter('stock', newFilters.stock || []);
              updateFilter('precioRange', newFilters.precioRange || [0, 1000]);
              
              const filterCount = (newFilters.subcategorias?.length || 0) + 
                                 (newFilters.tamanos?.length || 0) + 
                                 (newFilters.stock?.length || 0);
              
              toast.success('Filtros aplicados', {
                description: `Se aplicaron ${filterCount} filtros`
              });
            } catch (error) {
              console.error('❌ Error aplicando filtros:', error);
              toast.error('Error al aplicar filtros');
            }
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
              Error al buscar productos
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              variant="liquorOrange" 
              onClick={searchProductsByName}
            >
              Reintentar
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-4">
              No hay productos que coincidan con &quot;{nombreParam}&quot;
            </p>
            <Link href="/">
              <Button variant="liquorOrange">
                Explorar todos los productos
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
                      {product.Modelo && <>{product.Modelo}</>}
                      {product.Modelo && product.Tamaño && <> • </>}
                      {product.Tamaño && <>{product.Tamaño}</>}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          S/{product['Precio B']}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          S/{(product['Precio B'] * 1.05).toFixed(2)}
                        </span>
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
          </>
        )}
      </div>

      {/* Espaciado inferior para evitar solapamiento con navegación */}
      <div className="h-24"></div>
    </div>
  );
}