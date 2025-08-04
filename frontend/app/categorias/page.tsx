"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

// Tipos para las categorías
interface Category {
  Categoria: string; // Para URLs (compatibilidad)
  Sub_Categoria: string; // Nombre a mostrar
  Sub_Categoria_Nivel: string; // Para ordenamiento
  total_productos: number;
  productos_con_stock?: number;
}

// Función utilitaria para obtener la URL base de la API
const getApiUrl = (endpoint: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
  return `${baseUrl}${endpoint}`;
};

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(getApiUrl('/api/v1/productos/categorias'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setCategories(data.data);
        } else {
          throw new Error('No se pudieron cargar las categorías');
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filtrar categorías basado en búsqueda y stock (ya vienen ordenadas por Sub_Categoria_Nivel)
  const filteredCategories = categories
    .filter(category =>
      category.Sub_Categoria.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (category.productos_con_stock === undefined || category.productos_con_stock > 0)
    );

  // Mapeo de colores y imágenes por categoría
  const getCategoryStyle = (categoryName: string) => {
    const colorMap: { [key: string]: { bgColor: string; image: string } } = {
      'CERVEZA': {
        bgColor: 'bg-yellow-100',
        image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'WHISKY': {
        bgColor: 'bg-amber-100',
        image: 'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'VODKA': {
        bgColor: 'bg-blue-100',
        image: 'https://images.pexels.com/photos/5947043/pexels-photo-5947043.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'RON': {
        bgColor: 'bg-orange-100',
        image: 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'VINO': {
        bgColor: 'bg-purple-100',
        image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      'PISCO': {
        bgColor: 'bg-green-100',
        image: 'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      },
      default: {
        bgColor: 'bg-gray-100',
        image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
      }
    };

    return colorMap[categoryName] || colorMap.default;
  };

  // Formatear nombre de categoría
  const formatCategoryName = (categoryName: string): string => {
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
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
              <h1 className="text-xl font-bold text-gray-900">Categorías</h1>
              <p className="text-sm text-gray-600">
                {loading ? 'Cargando...' : `${filteredCategories.length} categorías disponibles`}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar categorías..."
            className="pl-10 py-3 rounded-xl border-gray-200 bg-white text-gray-600"
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-4" />
                <Skeleton className="h-4 w-20 mx-auto mb-2" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar categorías</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              variant="default" 
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron categorías</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? `No hay categorías que coincidan con "${searchQuery}"` : 'No hay categorías disponibles'}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((category, index) => {
              const style = getCategoryStyle(category.Sub_Categoria);
              return (
                <Link 
                  key={index} 
                  href={`/categoria/${encodeURIComponent(category.Sub_Categoria)}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group-hover:border-orange-500/50 text-center">
                    <div className={`w-16 h-16 ${style.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden`}>
                      <Image 
                        src={style.image}
                        alt={category.Sub_Categoria}
                        width={40}
                        height={40}
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                      {formatCategoryName(category.Sub_Categoria)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {category.total_productos} productos
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-24"></div>
    </div>
  );
}