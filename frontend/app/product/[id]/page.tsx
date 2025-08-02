"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Share, Star, ChevronRight, Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RelatedProducts } from "@/components/ui/related-products";
import { useLiquorToast } from "@/hooks/use-liquor-toast";
import { useCartContext } from "@/contexts/cart-context";
import Image from "next/image";
import Link from "next/link";

// Tipos para el producto
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
  data: Product;
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const toast = useLiquorToast();
  const { addItem } = useCartContext();
  
  // Estados principales
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de UI
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Estados para galería
  const [productImages, setProductImages] = useState<string[]>([]);
  
  // Función para cargar producto
  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startTime = performance.now();
      const response = await fetch(
        getApiUrl(`/api/v1/productos/${productId}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'default',
        }
      );
      
      const endTime = performance.now();
      console.log(`🚀 Producto ${productId} cargado en: ${(endTime - startTime).toFixed(2)}ms`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        setProduct(data.data);
        
        // Configurar galería de imágenes
        const images = data.data.Photo 
          ? [data.data.Photo] 
          : ["https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&fit=crop"];
        
        setProductImages(images);
        
        console.log(`⚡ Performance: ${data.performance.total_time}ms total, Cache: ${data.performance.cache_hit}`);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error cargando producto:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar producto', {
        description: 'No se pudo cargar la información del producto'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar producto al montar el componente
  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);
  
  // Manejar cambio de cantidad
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };
  
  // Manejar agregar al carrito
  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.Stock === 'Sin Stock') {
      toast.outOfStock(product.Nombre);
      return;
    }
    
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
    }, quantity);
    
    toast.productAdded(product.Nombre, quantity, product['Precio B']);
  };

  // Manejar toggle de wishlist
  const handleWishlistToggle = () => {
    if (!product) return;
    
    setIsWishlisted(!isWishlisted);
    
    if (!isWishlisted) {
      toast.success('Agregado a favoritos', {
        description: product.Nombre
      });
    } else {
      toast.info('Removido de favoritos', {
        description: product.Nombre
      });
    }
  };

  // Manejar compartir producto
  const handleShare = async () => {
    if (!product) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.Nombre,
          text: `Mira este producto: ${product.Nombre}`,
          url: window.location.href,
        });
      } else {
        // Fallback para navegadores sin Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado', {
          description: 'El enlace del producto se copió al portapapeles'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error al compartir', {
        description: 'No se pudo compartir el producto'
      });
    }
  };
  
  // Calcular precio total
  const totalPrice = product ? product['Precio B'] * quantity : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 py-3 flex items-center justify-between">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        
        <div className="bg-white px-4 py-8">
          <div className="flex justify-center mb-6">
            <Skeleton className="w-64 h-80" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar producto</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              variant="liquorOrange" 
              onClick={loadProduct}
              className="mr-4"
            >
              Reintentar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
            >
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-4h-8m4-2v.01M9 7v.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-600 mb-6">El producto que buscas no existe o ha sido removido</p>
          <Button 
            variant="liquorOrange" 
            onClick={() => router.back()}
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleWishlistToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isWishlisted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleShare}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Share className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Product Image Section */}
      <div className="bg-white px-4 py-8">
        <div className="flex justify-center mb-6">
          <div className="w-64 h-80 relative">
            <Image 
              src={productImages[currentImageIndex]}
              alt={product.Nombre}
              width={256}
              height={320}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Image Indicators */}
        {productImages.length > 1 && (
          <div className="flex justify-center space-x-2 mb-8">
            {productImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-liquor-orange' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Product Info */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href={`/categoria/${encodeURIComponent(product.Categoria)}`} className="hover:text-liquor-orange">
              {product.Categoria}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>{product['Sub Categoria']}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {product.Nombre}
          </h1>

          {/* Price and Stock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                S/{product['Precio B']}
              </span>
              {product['Precio J'] !== product['Precio B'] && (
                <span className="text-lg text-gray-500 line-through">
                  S/{product['Precio J']}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {product.Stock === 'Sin Stock' ? (
                <span className="text-red-600 font-medium">Sin Stock</span>
              ) : (
                <span className="text-green-600 font-medium">Disponible</span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">SKU:</span>
              <span className="font-medium">{product.SKU}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tamaño:</span>
              <span className="font-medium">{product.Tamaño}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Modelo:</span>
              <span className="font-medium">{product.Modelo}</span>
            </div>
            {product['Al Por Mayor'] === 'Si' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Disponible al por mayor:</span>
                <span className="font-medium text-liquor-orange">Sí</span>
              </div>
            )}
          </div>


          {/* Description */}
          {product.Descripcion && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.Descripcion}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="bg-white px-4 py-8 border-t border-gray-100">
        <RelatedProducts
          currentProduct={product}
          maxProducts={6}
          title="Productos Relacionados"
          subtitle="Otros productos que podrían interesarte"
          showCategories={true}
          showRefresh={false}
          variant="horizontal"
          cardSize="md"
          showPrices={true}
          showStock={true}
          showAddToCart={true}
          showWishlist={false}
          onProductClick={(relatedProduct) => {
            // Navegar al producto relacionado
            router.push(`/product/${relatedProduct.id}`);
          }}
          onAddToCart={(relatedProduct) => {
            addItem({
              id: relatedProduct.id,
              SKU: relatedProduct.SKU,
              Nombre: relatedProduct.Nombre,
              Modelo: relatedProduct.Modelo,
              Tamaño: relatedProduct.Tamaño,
              'Precio B': relatedProduct['Precio B'],
              'Precio J': relatedProduct['Precio J'],
              Categoria: relatedProduct.Categoria,
              'Sub Categoria': relatedProduct['Sub Categoria'],
              Stock: relatedProduct.Stock,
              Photo: relatedProduct.Photo,
            }, 1);
            toast.productAdded(relatedProduct.Nombre, 1, relatedProduct['Precio B']);
          }}
        />
      </div>

      {/* Bottom Section with Quantity and Add to Cart */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-10 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between space-x-4">
            {/* Quantity Selector */}
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="mx-4 text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                {quantity}
              </span>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                disabled={quantity >= 99}
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button 
              onClick={handleAddToCart}
              disabled={product.Stock === 'Sin Stock'}
              className="flex-1 bg-liquor-orange hover:bg-liquor-orange/90 text-white font-semibold py-4 px-6 rounded-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.Stock === 'Sin Stock' ? 'Sin Stock' : 'Agregar'}
              {product.Stock !== 'Sin Stock' && (
                <span className="ml-2">S/{totalPrice}</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom padding to account for fixed sections (product actions + navigation) */}
      <div className="h-36"></div>
    </div>
  );
}