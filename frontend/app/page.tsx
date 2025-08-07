"use client";

import { Search, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductRowSkeleton } from "@/components/ui/product-card-skeleton";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import { useLiquorToast } from "@/hooks/use-liquor-toast";
import { useCartContext } from "@/contexts/cart-context";
import { useAnalytics } from "@/hooks/use-analytics";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";

// Tipos para las categorías
interface Category {
  Categoria: string; // Para URLs (compatibilidad)
  Sub_Categoria: string; // Nombre a mostrar
  Sub_Categoria_Nivel: string; // Para ordenamiento
  total_productos: number;
  productos_con_stock?: number;
}

// Tipos para productos de whisky
interface WhiskyProduct {
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
  data: Category[];
  meta: {
    total: number;
    limit: number;
  };
  performance: {
    total_time: number;
    db_execution_time: number;
    cache_hit: boolean;
  };
}

interface WhiskyApiResponse {
  success: boolean;
  data: WhiskyProduct[];
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

// Tipos para productos de combo (misma estructura que WhiskyProduct)
interface ComboProduct {
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

interface ComboApiResponse {
  success: boolean;
  data: ComboProduct[];
  meta: {
    subcategoria: string;
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

// Tipos para productos recomendados (piscos)
interface RecommendedProduct {
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

interface RecommendedApiResponse {
  success: boolean;
  data: RecommendedProduct[];
  meta: {
    subcategoria: string;
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

// Caché eliminado - causaba problemas en producción

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useLiquorToast();
  const { addItem } = useCartContext();
  const { trackAddToCart, trackSearch } = useAnalytics();
  
  // Estado para whiskies
  const [whiskies, setWhiskies] = useState<WhiskyProduct[]>([]);
  const [whiskiesLoading, setWhiskiesLoading] = useState(true);
  const [whiskiesError, setWhiskiesError] = useState<string | null>(null);
  
  // Estado para combos
  const [combos, setCombos] = useState<ComboProduct[]>([]);
  const [combosLoading, setCombosLoading] = useState(true);
  const [combosError, setCombosError] = useState<string | null>(null);
  
  // Estado para productos recomendados
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);

  // Estado para cervezas
  const [cervezas, setCervezas] = useState<WhiskyProduct[]>([]);
  const [cervezasLoading, setCervezasLoading] = useState(true);
  const [cervezasError, setCervezasError] = useState<string | null>(null);
  
  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WhiskyProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [allSearchResults, setAllSearchResults] = useState<WhiskyProduct[]>([]);

  // Estado global de loading para optimizar UX
  const [globalLoading, setGlobalLoading] = useState(true);


  // Función para cargar categorías
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamada al endpoint sin caché problemático
      const startTime = performance.now();
      const response = await fetch(getApiUrl('/api/v1/productos/categorias?limit=10'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Sin caché para evitar problemas en producción
        cache: 'no-store',
      });

      const endTime = performance.now();
      console.log(`🚀 Categorías cargadas en: ${(endTime - startTime).toFixed(2)}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setCategories(data.data);
        console.log(`⚡ Performance: ${data.performance.total_time}ms total, ${data.performance.db_execution_time}ms DB, Cache: ${data.performance.cache_hit}`);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // Fallback a categorías estáticas en caso de error
      setCategories([
        { Categoria: "CERVEZA", Sub_Categoria: "Cervezas", Sub_Categoria_Nivel: "1", total_productos: 153, productos_con_stock: 153 },
        { Categoria: "WHISKY", Sub_Categoria: "Whiskies", Sub_Categoria_Nivel: "2", total_productos: 78, productos_con_stock: 78 },
        { Categoria: "TRAGOS", Sub_Categoria: "Tragos", Sub_Categoria_Nivel: "3", total_productos: 76, productos_con_stock: 76 },
        { Categoria: "VODKA", Sub_Categoria: "Vodkas", Sub_Categoria_Nivel: "4", total_productos: 74, productos_con_stock: 74 },
        { Categoria: "PISCO", Sub_Categoria: "Piscos", Sub_Categoria_Nivel: "5", total_productos: 67, productos_con_stock: 67 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Función optimizada para cargar whiskies
  const loadWhiskies = async () => {
    try {
      setWhiskiesLoading(true);
      setWhiskiesError(null);

      // Llamada al endpoint de whiskies
      const startTime = performance.now();
      const response = await fetch(getApiUrl('/api/v1/productos/subcategoria/Whiskies'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'default',
        keepalive: true,
      });

      const endTime = performance.now();
      console.log(`🚀 Whiskies cargados en: ${(endTime - startTime).toFixed(2)}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WhiskyApiResponse = await response.json();
      
      if (data.success) {
        setWhiskies(data.data);
        console.log(`⚡ Performance whiskies: ${data.performance.total_time}ms total, ${data.performance.db_execution_time}ms DB, Cache: ${data.performance.cache_hit}`);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando whiskies:', err);
      setWhiskiesError(err instanceof Error ? err.message : 'Error desconocido');
      // Fallback a whiskies estáticos en caso de error
      setWhiskies([
        {
          id: 1,
          SKU: "WHISKY001",
          Nombre: "Johnnie Walker Red Label",
          Modelo: "Red Label",
          Tamaño: "750 ML",
          'Precio B': 890,
          'Precio J': 950,
          Categoria: "WHISKY",
          'Sub Categoria': "Premium",
          Stock: "Con Stock",
          'Sub Categoria Nivel': "Premium",
          'Al Por Mayor': "Sí",
          Top_S_Sku: "WHISKY001",
          Product_asig: "Asignado",
          Descripcion: "Whisky premium",
          Cantidad: 10,
          Photo: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"
        },
        {
          id: 2,
          SKU: "WHISKY002",
          Nombre: "Jack Daniel's Old No. 7",
          Modelo: "Old No. 7",
          Tamaño: "750 ML",
          'Precio B': 1200,
          'Precio J': 1280,
          Categoria: "WHISKY",
          'Sub Categoria': "Premium",
          Stock: "Con Stock",
          'Sub Categoria Nivel': "Premium",
          'Al Por Mayor': "Sí",
          Top_S_Sku: "WHISKY002",
          Product_asig: "Asignado",
          Descripcion: "Whisky premium",
          Cantidad: 8,
          Photo: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"
        }
      ]);
    } finally {
      setWhiskiesLoading(false);
    }
  };

  // Función optimizada para cargar combos
  const loadCombos = async () => {
    try {
      setCombosLoading(true);
      setCombosError(null);

      // Llamada al endpoint de combos con offset=5 para obtener diferentes combos
      const startTime = performance.now();
      const response = await fetch(getApiUrl('/api/v1/productos/subcategoria/Combos'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'default',
        keepalive: true,
      });

      const endTime = performance.now();
      console.log(`🚀 Combos cargados en: ${(endTime - startTime).toFixed(2)}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ComboApiResponse = await response.json();
      
      if (data.success) {
        setCombos(data.data);
        console.log(`⚡ Performance combos: ${data.performance.total_time}ms total, ${data.performance.db_execution_time}ms DB, Cache: ${data.performance.cache_hit}`);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando combos:', err);
      setCombosError(err instanceof Error ? err.message : 'Error desconocido');
      // Fallback a combos estáticos en caso de error
      setCombos([
        {
          id: 1,
          SKU: "COMBO001",
          Nombre: "Combo Cerveza + Snacks",
          Modelo: "Premium",
          Tamaño: "Combo",
          'Precio B': 280,
          'Precio J': 350,
          Categoria: "CERVEZA",
          'Sub Categoria': "Combos",
          Stock: "Con Stock",
          'Sub Categoria Nivel': "Premium",
          'Al Por Mayor': "Sí",
          Top_S_Sku: "COMBO001",
          Product_asig: "Asignado",
          Descripcion: "Combo premium de cerveza",
          Cantidad: 10,
          Photo: "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"
        },
        {
          id: 2,
          SKU: "COMBO002",
          Nombre: "Combo Whisky + Hielo",
          Modelo: "Premium",
          Tamaño: "Combo",
          'Precio B': 450,
          'Precio J': 520,
          Categoria: "WHISKY",
          'Sub Categoria': "Combos",
          Stock: "Con Stock",
          'Sub Categoria Nivel': "Premium",
          'Al Por Mayor': "Sí",
          Top_S_Sku: "COMBO002",
          Product_asig: "Asignado",
          Descripcion: "Combo premium de whisky",
          Cantidad: 8,
          Photo: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"
        }
      ]);
    } finally {
      setCombosLoading(false);
    }
  };

  // Función optimizada para cargar productos recomendados (piscos)
  const loadRecommendedProducts = async () => {
    try {
      setRecommendedLoading(true);
      setRecommendedError(null);

      // Llamada al endpoint de piscos con offset=10 para obtener diferentes productos
      const startTime = performance.now();
      const response = await fetch(getApiUrl('/api/v1/productos/subcategoria/Piscos'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'default',
        keepalive: true,
      });

      const endTime = performance.now();
      console.log(`🚀 Productos recomendados cargados en: ${(endTime - startTime).toFixed(2)}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RecommendedApiResponse = await response.json();
      
      if (data.success) {
        setRecommendedProducts(data.data);
        console.log(`⚡ Performance recomendados: ${data.performance.total_time}ms total, ${data.performance.db_execution_time}ms DB, Cache: ${data.performance.cache_hit}`);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando productos recomendados:', err);
      setRecommendedError(err instanceof Error ? err.message : 'Error desconocido');
      // Fallback a productos estáticos en caso de error
      setRecommendedProducts([
        {
          id: 1,
          SKU: "PISCO001",
          Nombre: "Pisco Premium",
          Modelo: "Premium",
          Tamaño: "750 ML",
          'Precio B': 120,
          'Precio J': 150,
          Categoria: "PISCO",
          'Sub Categoria': "piscos",
          Stock: "Con Stock",
          'Sub Categoria Nivel': "Premium",
          'Al Por Mayor': "Sí",
          Top_S_Sku: "PISCO001",
          Product_asig: "Asignado",
          Descripcion: "Pisco premium",
          Cantidad: 10,
          Photo: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"
        },
        {
          id: 2,
          SKU: "PISCO002",
          Nombre: "Pisco Especial",
          Modelo: "Especial",
          Tamaño: "750 ML",
          'Precio B': 150,
          'Precio J': 180,
          Categoria: "PISCO",
          'Sub Categoria': "piscos",
          Stock: "Con Stock",
          'Sub Categoria Nivel': "Premium",
          'Al Por Mayor': "Sí",
          Top_S_Sku: "PISCO002",
          Product_asig: "Asignado",
          Descripcion: "Pisco especial",
          Cantidad: 8,
          Photo: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"
        }
      ]);
    } finally {
      setRecommendedLoading(false);
    }
  };

  // Función optimizada para cargar cervezas
  const loadCervezas = async () => {
    try {
      setCervezasLoading(true);
      setCervezasError(null);

      // Llamada al endpoint de cervezas con offset=15 para obtener diferentes cervezas
      const startTime = performance.now();
      const response = await fetch(getApiUrl('/api/v1/productos/subcategoria/Cervezas'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const endTime = performance.now();
      console.log(`🍺 Cervezas cargadas en: ${(endTime - startTime).toFixed(2)}ms`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: WhiskyApiResponse = await response.json();

      if (data.success) {
        setCervezas(data.data);
        console.log(`⚡ Performance cervezas: ${data.performance.total_time}ms total, ${data.performance.db_execution_time}ms DB, Cache: ${data.performance.cache_hit}`);
      } else {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (err) {
      console.error('Error cargando cervezas:', err);
      setCervezasError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Fallback data para cervezas
      setCervezas([
        {
          id: 999,
          SKU: "CERVEZA-DEMO",
          Nombre: "Cerveza Demo",
          Modelo: "Premium",
          Tamaño: "355ml",
          'Precio B': 8,
          'Precio J': 7,
          Categoria: "CERVEZA",
          'Sub Categoria': "Lager",
          Stock: "Con Stock",
          'Sub Categoria Nivel': "",
          'Al Por Mayor': "",
          Top_S_Sku: "",
          Product_asig: "",
          Descripcion: "Cerveza de demostración",
          Cantidad: 12,
          Photo: "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"
        }
      ]);
    } finally {
      setCervezasLoading(false);
    }
  };

  // Cargar categorías primero (más importante) y luego el resto en paralelo
  useEffect(() => {
    const loadDataOptimized = async () => {
      console.log('🚀 Iniciando carga optimizada de datos...');
      
      try {
        // 1. Cargar categorías primero (contenido más importante)
        console.log('📋 Cargando categorías (prioridad alta)...');
        await loadCategories();
        console.log('✅ Categorías cargadas exitosamente');
        
        // 2. Cargar el resto de contenido en paralelo
        console.log('🔄 Cargando contenido secundario en paralelo...');
        await Promise.all([
          loadWhiskies(),
          loadCombos(),
          loadRecommendedProducts(),
          loadCervezas()
        ]);
        
        console.log('✅ Todo el contenido cargado exitosamente');
        setGlobalLoading(false);
        
      } catch (error) {
        console.error('❌ Error en la carga optimizada:', error);
        setGlobalLoading(false);
      }
    };

    loadDataOptimized();
  }, []);

  // Función para formatear categorías en formato título
  const formatCategoryName = (categoryName: string): string => {
    if (!categoryName) return '';
    
    // Convertir a formato título: primera letra mayúscula, resto minúsculas
    const formatted = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
    
    // Truncar si es muy largo y agregar puntos suspensivos
    if (formatted.length > 12) {
      return formatted.substring(0, 12) + '...';
    }
    
    return formatted;
  };

  // Mapeo optimizado de colores por categoría
  const getCategoryStyle = useMemo(() => {
    const colorMap: { [key: string]: { bgColor: string; image: string } } = {
      'CERVEZA': {
        bgColor: 'bg-yellow-100',
        image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'WHISKY': {
        bgColor: 'bg-amber-100',
        image: 'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'TRAGOS': {
        bgColor: 'bg-blue-100',
        image: 'https://images.pexels.com/photos/5947020/pexels-photo-5947020.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'GASEOSA': {
        bgColor: 'bg-green-100',
        image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'VODKA': {
        bgColor: 'bg-blue-100',
        image: 'https://images.pexels.com/photos/5947020/pexels-photo-5947020.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'PISCO': {
        bgColor: 'bg-purple-100',
        image: 'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'GOLOSINAS': {
        bgColor: 'bg-pink-100',
        image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'RON OSCURO': {
        bgColor: 'bg-amber-800',
        image: 'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'VINO TINTO': {
        bgColor: 'bg-red-100',
        image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'CIGARRO': {
        bgColor: 'bg-gray-100',
        image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      }
    };

    return (categoryName: string) => {
      return colorMap[categoryName] || {
        bgColor: 'bg-gray-100',
        image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      };
    };
  }, []);

  // Función de búsqueda GLOBAL de productos
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setAllSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setSearchLoading(true);
    trackSearch(query); // Track búsqueda en GA
    
    try {
      console.log(`🔍 Búsqueda global para: "${query}"`);
      
      // BÚSQUEDA GLOBAL: Usar solo la API para encontrar TODOS los productos
      const response = await fetch(getApiUrl(`/api/v1/productos/buscar/${encodeURIComponent(query)}?limit=100`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'default',
      });

      let searchData: WhiskyProduct[] = [];

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          searchData = data.data;
          console.log(`✅ API encontró ${searchData.length} productos`);
        } else {
          console.warn('⚠️ API respuesta sin datos válidos:', data);
        }
      } else {
        console.error(`❌ Error en API: ${response.status} ${response.statusText}`);
      }

      // Si la API no funciona, hacer búsqueda local como fallback (limitada)
      if (searchData.length === 0) {
        console.log('🔄 Fallback: Buscando en productos locales cargados...');
        const allLoadedProducts = [
          ...whiskies,
          ...combos,
          ...recommendedProducts,
          ...cervezas
        ];

        const searchTerm = query.toLowerCase().trim();
        
        searchData = allLoadedProducts.filter(product => {
          // Función de búsqueda inteligente
          const searchInField = (field: string) => {
            if (!field) return false;
            field = field.toLowerCase();
            
            // Búsqueda exacta
            if (field.includes(searchTerm)) return true;
            
            // Búsqueda por palabras múltiples
            const words = searchTerm.split(' ').filter(w => w.length > 0);
            if (words.length > 1) {
              return words.every(word => field.includes(word));
            }
            
            return false;
          };
          
          const nombre = product.Nombre || '';
          const modelo = product.Modelo || '';
          const tamaño = product.Tamaño || '';
          const categoria = product.Categoria || '';
          const subCategoria = product['Sub Categoria'] || '';
          const descripcion = product.Descripcion || '';
          
          return searchInField(nombre) ||
                 searchInField(modelo) ||
                 searchInField(tamaño) ||
                 searchInField(categoria) ||
                 searchInField(subCategoria) ||
                 searchInField(descripcion);
        });
        
        console.log(`🔄 Búsqueda local encontró ${searchData.length} productos (limitado a categorías cargadas)`);
      }

      console.log(`🎯 Búsqueda total "${query}": ${searchData.length} productos encontrados`);
      
      // Mostrar algunos productos encontrados para debugging
      if (searchData.length > 0) {
        console.log('📋 Primeros resultados:', searchData.slice(0, 3).map(p => ({
          nombre: p.Nombre,
          categoria: p.Categoria,
          subCategoria: p['Sub Categoria']
        })));
      }
      
      setSearchResults(searchData.slice(0, 10)); // Limitar a 10 para el dropdown
      setAllSearchResults(searchData); // Guardar todos los resultados
      setShowSearchDropdown(searchData.length > 0);
      
    } catch (error) {
      console.error('❌ Error completo en búsqueda:', error);
      setSearchResults([]);
      setAllSearchResults([]);
      setShowSearchDropdown(false);
    } finally {
      setSearchLoading(false);
    }
  }, [whiskies, combos, recommendedProducts, cervezas]);

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchProducts]);

  // Manejar clic en resultado de búsqueda
  const handleSearchResultClick = (productId: number) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    // Navegar al producto
    window.location.href = `/product/${productId}`;
  };

  // Datos estáticos de productos recomendados eliminados - ahora se cargan dinámicamente desde la API

  // Datos estáticos de combos eliminados - ahora se cargan dinámicamente desde la API

  // Datos estáticos eliminados - ahora se cargan dinámicamente desde la API

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Image 
            src="https://i.ibb.co/r2KwkMSR/ats-logo-azul.webp"
            alt="ATS Logo"
            width={100}
            height={40}
            className="object-contain"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <h1 className="text-sm sm:text-base font-medium text-gray-700 leading-tight">
              Tu Aliado para cada<br/>
              <span className="text-orange-600 font-semibold">Celebración</span>
            </h1>
          </div>
          <HamburgerMenu />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            placeholder="Buscar cerveza, whisky, vodka en San Juan de Lurigancho..."
            className="pl-10 py-3 rounded-xl border-gray-200 bg-white text-gray-600"
          />
          
          {/* Dropdown de resultados */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto z-20">
              {searchLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Buscando...
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSearchResultClick(product.id)}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                        <Image
                          src={product.Photo || "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"}
                          alt={product.Nombre}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{product.Nombre}</h4>
                        <p className="text-xs text-gray-500 truncate">
                          {product.Modelo && <>{product.Modelo}</>}
                          {product.Modelo && product.Tamaño && <> • </>}
                          {product.Tamaño && <>{product.Tamaño}</>}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">S/{product['Precio B']}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-2 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-500">Mostrando {searchResults.length} de {allSearchResults.length} resultados</p>
                  </div>
                  {/* Enlace para mostrar todos los resultados */}
                  {allSearchResults.length > 10 && (
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => {
                          setShowSearchDropdown(false);
                          // TODO: Navegar a página de resultados con searchQuery
                          console.log(`🔍 Mostrar todos los ${allSearchResults.length} resultados para: "${searchQuery}"`);
                          toast.success(`Búsqueda: "${searchQuery}"`, {
                            description: `${allSearchResults.length} productos encontrados`
                          });
                        }}
                        className="w-full p-3 text-center text-orange-600 hover:bg-orange-50 transition-colors duration-150 font-medium text-sm border-t border-gray-100"
                      >
                        Ver todos los resultados ({allSearchResults.length})
                      </button>
                    </div>
                  )}
                </>
              ) : searchQuery.length >= 2 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No se encontraron productos para &quot;{searchQuery}&quot;</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pb-6">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {loading ? (
            // Loading skeleton optimizado
            Array.from({ length: 5 }).map((_, index) => (
              <div key={`loading-${index}`} className="flex flex-col items-center space-y-2 min-w-[80px]">
                <Skeleton shape="rounded" width={64} height={64} />
                <Skeleton width={48} height={12} />
              </div>
            ))
          ) : error ? (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-red-500 text-sm">Error: {error}</p>
            </div>
          ) : (
            categories
              .filter(category => (category.productos_con_stock ?? 0) > 0) // Filtrar categorías sin stock
              .slice(0, 10) // Ya vienen ordenadas por Sub_Categoria_Nivel del backend
              .map((category, index) => (
              <Link 
                key={index} 
                href={`/categoria/${encodeURIComponent(category.Sub_Categoria)}`}
                className="flex flex-col items-center space-y-2 min-w-[80px] cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className={`w-16 h-16 ${getCategoryStyle(category.Sub_Categoria).bgColor} rounded-2xl flex items-center justify-center overflow-hidden`}>
                  <Image 
                    src={getCategoryStyle(category.Sub_Categoria).image}
                    alt={category.Sub_Categoria}
                    width={40}
                    height={40}
                    className="object-cover rounded-lg"
                  />
                </div>
                <span className="text-sm font-medium text-gray-800">{formatCategoryName(category.Sub_Categoria)}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Promotional Banners */}
      <div className="px-4 pb-6">
        <div className="flex space-x-3 overflow-x-auto">
          {/* Mike's Combo Banner */}
          <Link 
            href="/search?nombre=Mike%27s"
            className="min-w-[280px] block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Image 
              src="https://i.ibb.co/MDdGwqHk/MIKES-COMBO.webp"
              alt="Mike's Combo - Ofertas especiales"
              width={280}
              height={211}
              className="w-full h-[211px] object-cover"
              priority
            />
          </Link>

          {/* Pilsen Combo Banner */}
          <Link 
            href="/search?nombre=pilsen"
            className="min-w-[280px] block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Image 
              src="https://i.ibb.co/DHjSz427/pilsen-COMBO.webp"
              alt="Pilsen Combo - Ofertas especiales"
              width={280}
              height={211}
              className="w-full h-[211px] object-cover"
              priority
            />
          </Link>

          {/* Vodka Xtasis Combo Banner */}
          <Link 
            href="/search?nombre=xtasis"
            className="min-w-[280px] block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Image 
              src="https://i.ibb.co/Nd1DYNYf/VOKDACOMBO.webp"
              alt="Vodka Xtasis Combo - Ofertas especiales"
              width={280}
              height={211}
              className="w-full h-[211px] object-cover"
              priority
            />
          </Link>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="px-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Recomendado para ti</h3>
          <Link href="/categorias" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">
            Ver más
          </Link>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {recommendedLoading ? (
            <ProductRowSkeleton count={5} showPrice={false} />
          ) : recommendedError ? (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-red-500 text-sm">Error cargando recomendados: {recommendedError}</p>
            </div>
          ) : (
            recommendedProducts
              .filter(product => product['Precio B'] > 10) // Filtrar productos >S/10
              .slice(0, 10) // Garantizar máximo 10 productos
              .map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-[160px] flex-shrink-0 relative">
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative mb-3">
                    <div className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden">
                      <Image 
                        src={product.Photo || "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"}
                        alt={product.Nombre}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{product.Nombre}</h4>
                  <p className="text-xs text-gray-500 mt-1">{product.Modelo}</p>
                  <p className="text-lg font-bold text-gray-900 mt-2">S/{product['Precio B']}</p>
                </Link>
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 p-0 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: product.id,
                      SKU: product.SKU,
                      Nombre: product.Nombre,
                      Modelo: product.Modelo,
                      Tamaño: product.Tamaño,
                      'Precio B': product['Precio B'],
                      'Precio J': product['Precio J'],
                      Categoria: product.Categoria,
                      'Sub Categoria': product['Sub Categoria'],
                      Stock: product.Stock,
                      Photo: product.Photo,
                    }, 1);
                    toast.productAdded(product.Nombre, 1, product['Precio B']);
                    trackAddToCart(product.id, product.Nombre, product['Precio B'], 1);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Combos para ti Section */}
      <div className="px-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Combos para ti</h3>
          <Link href="/categoria/Combos" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">
            Ver más
          </Link>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {combosLoading ? (
            <ProductRowSkeleton count={5} showPrice={true} />
          ) : combosError ? (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-red-500 text-sm">Error cargando combos: {combosError}</p>
            </div>
          ) : (
            combos
              .filter(combo => combo['Precio B'] > 10) // Filtrar combos >S/10
              .slice(0, 10) // Garantizar máximo 10 combos
              .map((combo) => (
              <div key={combo.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-[160px] flex-shrink-0 relative">
                <Link href={`/product/${combo.id}`} className="block">
                  <div className="relative mb-3">
                    <div className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden">
                      <Image 
                        src={combo.Photo || "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"}
                        alt={combo.Nombre}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      COMBO
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{combo.Nombre}</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    {combo.Modelo && <>{combo.Modelo}</>}
                    {combo.Modelo && combo.Tamaño && <> • </>}
                    {combo.Tamaño && <>{combo.Tamaño}</>}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">S/{combo['Precio B']}</span>
                    <span className="text-sm text-gray-500 line-through">S/{combo['Precio J']}</span>
                  </div>
                </Link>
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 p-0 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: combo.id,
                      SKU: combo.SKU,
                      Nombre: combo.Nombre,
                      Modelo: combo.Modelo,
                      Tamaño: combo.Tamaño,
                      'Precio B': combo['Precio B'],
                      'Precio J': combo['Precio J'],
                      Categoria: combo.Categoria,
                      'Sub Categoria': combo['Sub Categoria'],
                      Stock: combo.Stock,
                      Photo: combo.Photo,
                    }, 1);
                    toast.productAdded(combo.Nombre, 1, combo['Precio B']);
                    trackAddToCart(combo.id, combo.Nombre, combo['Precio B'], 1);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Whiskies para ti Section */}
      <div className="px-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Whiskies para ti</h3>
          <Link href="/categoria/Whiskies" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">
            Ver más
          </Link>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {whiskiesLoading ? (
            <ProductRowSkeleton count={5} showPrice={true} />
          ) : whiskiesError ? (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-red-500 text-sm">Error cargando whiskies: {whiskiesError}</p>
            </div>
          ) : (
            whiskies
              .filter(whisky => whisky['Precio B'] > 10) // Filtrar whiskies >S/10
              .slice(0, 10) // Garantizar máximo 10 whiskies
              .map((whisky) => (
              <div key={whisky.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-[160px] flex-shrink-0 relative">
                <Link href={`/product/${whisky.id}`} className="block">
                  <div className="relative mb-3">
                    <div className="w-full h-40 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl overflow-hidden">
                      <Image 
                        src={whisky.Photo || "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"}
                        alt={whisky.Nombre}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{whisky.Nombre}</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    {whisky.Modelo && <>{whisky.Modelo}</>}
                    {whisky.Modelo && whisky.Tamaño && <> • </>}
                    {whisky.Tamaño && <>{whisky.Tamaño}</>}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">S/{whisky['Precio B']}</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-xs text-amber-600 font-medium">{whisky['Sub Categoria Nivel'] || 'Premium'}</span>
                    </div>
                  </div>
                </Link>
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 p-0 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: whisky.id,
                      SKU: whisky.SKU,
                      Nombre: whisky.Nombre,
                      Modelo: whisky.Modelo,
                      Tamaño: whisky.Tamaño,
                      'Precio B': whisky['Precio B'],
                      'Precio J': whisky['Precio J'],
                      Categoria: whisky.Categoria,
                      'Sub Categoria': whisky['Sub Categoria'],
                      Stock: whisky.Stock,
                      Photo: whisky.Photo,
                    }, 1);
                    toast.productAdded(whisky.Nombre, 1, whisky['Precio B']);
                    trackAddToCart(whisky.id, whisky.Nombre, whisky['Precio B'], 1);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cervezas para ti Section */}
      <div className="px-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Cervezas para ti</h3>
          <Link href="/categoria/Cervezas" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">
            Ver más
          </Link>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {cervezasLoading ? (
            <ProductRowSkeleton count={5} showPrice={true} />
          ) : cervezasError ? (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-red-500 text-sm">Error cargando cervezas: {cervezasError}</p>
            </div>
          ) : (
            cervezas
              .filter(cerveza => cerveza['Precio B'] > 10) // Filtrar cervezas >S/10
              .slice(0, 10) // Garantizar máximo 10 cervezas
              .map((cerveza) => (
              <div key={cerveza.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-[160px] flex-shrink-0 relative">
                <Link href={`/product/${cerveza.id}`} className="block">
                  <div className="relative mb-3">
                    <div className="w-full h-40 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl overflow-hidden">
                      <Image 
                        src={cerveza.Photo || "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"}
                        alt={cerveza.Nombre}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{cerveza.Nombre}</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    {cerveza.Modelo && <>{cerveza.Modelo}</>}
                    {cerveza.Modelo && cerveza.Tamaño && <> • </>}
                    {cerveza.Tamaño && <>{cerveza.Tamaño}</>}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">S/{cerveza['Precio B']}</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-xs text-yellow-600 font-medium">Fresca</span>
                    </div>
                  </div>
                </Link>
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 p-0 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: cerveza.id,
                      SKU: cerveza.SKU,
                      Nombre: cerveza.Nombre,
                      Modelo: cerveza.Modelo,
                      Tamaño: cerveza.Tamaño,
                      'Precio B': cerveza['Precio B'],
                      'Precio J': cerveza['Precio J'],
                      Categoria: cerveza.Categoria,
                      'Sub Categoria': cerveza['Sub Categoria'],
                      Stock: cerveza.Stock,
                      Photo: cerveza.Photo,
                    }, 1);
                    toast.productAdded(cerveza.Nombre, 1, cerveza['Precio B']);
                    trackAddToCart(cerveza.id, cerveza.Nombre, cerveza['Precio B'], 1);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-24"></div>
    </div>
  );
}