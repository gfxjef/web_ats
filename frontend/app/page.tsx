"use client";

import { Search, Home, Grid3X3, Percent, Package, ShoppingCart, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";

// Tipos para las categorías
interface Category {
  Categoria: string;
  total_productos: number;
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

// Caché local para categorías
let categoriesCache: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  // Estado global de loading para optimizar UX
  const [globalLoading, setGlobalLoading] = useState(true);

  // Función optimizada para cargar categorías
  const loadCategories = async () => {
    try {
      // Verificar caché local
      const now = Date.now();
      if (categoriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
        setCategories(categoriesCache);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Llamada al endpoint optimizada
      const startTime = performance.now();
      const response = await fetch('http://127.0.0.1:5001/api/v1/productos/categorias?limit=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Optimizaciones para velocidad
        cache: 'default',
        keepalive: true,
      });

      const endTime = performance.now();
      console.log(`🚀 Categorías cargadas en: ${(endTime - startTime).toFixed(2)}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        // Actualizar caché local
        categoriesCache = data.data;
        cacheTimestamp = now;
        
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
        { Categoria: "CERVEZA", total_productos: 153 },
        { Categoria: "WHISKY", total_productos: 78 },
        { Categoria: "TRAGOS", total_productos: 76 },
        { Categoria: "VODKA", total_productos: 74 },
        { Categoria: "PISCO", total_productos: 67 }
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
      const response = await fetch('http://127.0.0.1:5001/api/v1/productos/categorias/WHISKY?limit=5', {
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
      const response = await fetch('http://127.0.0.1:5001/api/v1/productos/sub_categorias/combos?limit=10&offset=5', {
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
      const response = await fetch('http://127.0.0.1:5001/api/v1/productos/sub_categorias/piscos?limit=10&offset=10', {
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
          loadRecommendedProducts()
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

  // Datos estáticos de productos recomendados eliminados - ahora se cargan dinámicamente desde la API

  // Datos estáticos de combos eliminados - ahora se cargan dinámicamente desde la API

  // Datos estáticos eliminados - ahora se cargan dinámicamente desde la API

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-lg">Home</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <p className="text-sm text-gray-600">C-56/23, Sector 62, Noida</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-3 py-1 rounded-full flex items-center space-x-1">
            <span className="text-xs font-medium">⚡</span>
            <span className="text-xs font-medium">FAST DELIVERY</span>
          </div>
          <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
            <span className="text-lg">👨🏾</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Search for Beer, Wine, Liquor & More"
            className="pl-10 py-3 rounded-xl border-gray-200 bg-white text-gray-600"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pb-6">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {loading ? (
            // Loading skeleton optimizado
            Array.from({ length: 5 }).map((_, index) => (
              <div key={`loading-${index}`} className="flex flex-col items-center space-y-2 min-w-[80px]">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))
          ) : error ? (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-red-500 text-sm">Error: {error}</p>
            </div>
          ) : (
            categories.map((category, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 min-w-[80px]">
                <div className={`w-16 h-16 ${getCategoryStyle(category.Categoria).bgColor} rounded-2xl flex items-center justify-center overflow-hidden`}>
                  <Image 
                    src={getCategoryStyle(category.Categoria).image}
                    alt={category.Categoria}
                    width={40}
                    height={40}
                    className="object-cover rounded-lg"
                  />
                </div>
                <span className="text-sm font-medium text-gray-800">{formatCategoryName(category.Categoria)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Promotional Banners */}
      <div className="px-4 pb-6">
        <div className="flex space-x-3 overflow-x-auto">
          {/* Orange Banner */}
          <div className="min-w-[300px] bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-1">UP TO</h2>
              <h2 className="text-3xl font-bold mb-2">30% OFF*</h2>
              <p className="text-sm mb-4 opacity-90">Don't Miss Out Order Today!</p>
              <Button className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-6 py-2 rounded-full">
                SHOP NOW
              </Button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-white opacity-20">
              <div className="w-6 h-1 bg-white rounded-full mb-2"></div>
              <div className="w-4 h-1 bg-white rounded-full mb-2"></div>
              <div className="w-8 h-1 bg-white rounded-full"></div>
            </div>
            
            {/* Beer can image */}
            <div className="absolute -right-4 -top-2 w-32 h-40">
              <Image 
                src="https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop"
                alt="Beer can"
                width={120}
                height={160}
                className="object-cover transform rotate-12"
              />
            </div>
          </div>

          {/* Purple Banner */}
          <div className="min-w-[200px] bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-6 text-white relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-2">UP TO</h2>
            <h2 className="text-2xl font-bold mb-2">35% OFF</h2>
            <p className="text-sm mb-4 opacity-90">Don't...</p>
            <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-4 py-2 rounded-full text-sm">
              SHOP NOW
            </Button>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="px-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Recommended For You</h3>
          <span className="text-gray-500 text-sm">See All</span>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {recommendedLoading ? (
            // Loading skeleton para productos recomendados
            Array.from({ length: 5 }).map((_, index) => (
              <div key={`recommended-loading-${index}`} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[160px] flex-shrink-0">
                <div className="relative mb-3">
                  <div className="w-full h-40 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : recommendedError ? (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-red-500 text-sm">Error cargando recomendados: {recommendedError}</p>
            </div>
          ) : (
            recommendedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[160px] flex-shrink-0">
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
                  <Button 
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm leading-tight">{product.Nombre}</h4>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Combos para ti Section */}
      <div className="px-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Combos para ti</h3>
          <span className="text-gray-500 text-sm">See All</span>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {combosLoading ? (
            // Loading skeleton para combos
            Array.from({ length: 5 }).map((_, index) => (
              <div key={`combo-loading-${index}`} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[160px] flex-shrink-0">
                <div className="relative mb-3">
                  <div className="w-full h-40 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="absolute top-2 left-2 bg-gray-200 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">COMBO</div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1/2 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-1/3 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : combosError ? (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-red-500 text-sm">Error cargando combos: {combosError}</p>
            </div>
          ) : (
            combos.map((combo) => (
              <div key={combo.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[160px] flex-shrink-0">
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
                  <Button 
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2">{combo.Nombre}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">₹{combo['Precio B']}</span>
                  <span className="text-sm text-gray-500 line-through">₹{combo['Precio J']}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Whiskies para ti Section */}
      <div className="px-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Whiskies para ti</h3>
          <span className="text-gray-500 text-sm">See All</span>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {whiskiesLoading ? (
            // Loading skeleton para whiskies
            Array.from({ length: 5 }).map((_, index) => (
              <div key={`whisky-loading-${index}`} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[160px] flex-shrink-0">
                <div className="relative mb-3">
                  <div className="w-full h-40 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-1/2 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : whiskiesError ? (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-red-500 text-sm">Error cargando whiskies: {whiskiesError}</p>
            </div>
          ) : (
            whiskies.map((whisky) => (
              <div key={whisky.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[160px] flex-shrink-0">
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
                  <Button 
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2">{whisky.Nombre}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">₹{whisky['Precio B']}</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-xs text-amber-600 font-medium">{whisky['Sub Categoria Nivel'] || 'Premium'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 max-w-md mx-auto">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex flex-col items-center space-y-1"
          >
            <Home className={`w-6 h-6 ${activeTab === 'home' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span className={`text-xs ${activeTab === 'home' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className="flex flex-col items-center space-y-1"
          >
            <Grid3X3 className={`w-6 h-6 ${activeTab === 'categories' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span className={`text-xs ${activeTab === 'categories' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Categories</span>
          </button>
          <button 
            onClick={() => setActiveTab('offers')}
            className="flex flex-col items-center space-y-1"
          >
            <Percent className={`w-6 h-6 ${activeTab === 'offers' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span className={`text-xs ${activeTab === 'offers' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Offers</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className="flex flex-col items-center space-y-1"
          >
            <Package className={`w-6 h-6 ${activeTab === 'orders' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span className={`text-xs ${activeTab === 'orders' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Orders</span>
          </button>
          <button 
            onClick={() => setActiveTab('cart')}
            className="flex flex-col items-center space-y-1"
          >
            <ShoppingCart className={`w-6 h-6 ${activeTab === 'cart' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span className={`text-xs ${activeTab === 'cart' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Cart</span>
          </button>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-24"></div>
    </div>
  );
}