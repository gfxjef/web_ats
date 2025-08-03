"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGridSkeleton } from "@/components/ui/product-card-skeleton";
import { RefreshCw, Plus, Eye, Heart, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRelatedProducts, type RelatedProduct } from "@/hooks/use-related-products";
import { useLiquorToast } from "@/hooks/use-liquor-toast";

export interface RelatedProductsProps {
  currentProduct: RelatedProduct | null;
  maxProducts?: number;
  title?: string;
  subtitle?: string;
  showCategories?: boolean;
  showRefresh?: boolean;
  variant?: "default" | "horizontal" | "vertical" | "grid";
  cardSize?: "sm" | "md" | "lg";
  showPrices?: boolean;
  showStock?: boolean;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  className?: string;
  onProductClick?: (product: RelatedProduct) => void;
  onAddToCart?: (product: RelatedProduct) => void;
  onAddToWishlist?: (product: RelatedProduct) => void;
}

const RelatedProducts = React.forwardRef<HTMLDivElement, RelatedProductsProps>(
  ({
    currentProduct,
    maxProducts = 8,
    title = "Productos Relacionados",
    subtitle = "Descubre productos similares que podrían interesarte",
    showCategories = true,
    showRefresh = true,
    variant = "default",
    cardSize = "md",
    showPrices = true,
    showStock = true,
    showAddToCart = true,
    showWishlist = false,
    className,
    onProductClick,
    onAddToCart,
    onAddToWishlist,
  }, ref) => {
    const toast = useLiquorToast();
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const {
      products,
      loading,
      error,
      hasProducts,
      isEmpty,
      categories,
      refreshRelated,
      getByCategory,
    } = useRelatedProducts(currentProduct, {
      maxProducts,
      includeCategories: true,
      includeSubcategories: true,
      includePriceRange: true,
      enableCache: true,
    });

    // Filtrar productos por categoría seleccionada
    const displayProducts = selectedCategory ? getByCategory(selectedCategory) : products;

    // Manejar click en producto
    const handleProductClick = (product: RelatedProduct) => {
      onProductClick?.(product);
    };

    // Manejar agregar al carrito
    const handleAddToCart = (product: RelatedProduct, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      onAddToCart?.(product);
      toast.productAdded(product.Nombre, 1, product['Precio B']);
    };

    // Manejar agregar a favoritos
    const handleAddToWishlist = (product: RelatedProduct, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      onAddToWishlist?.(product);
      toast.success('Agregado a favoritos', {
        description: product.Nombre
      });
    };

    // Manejar refrescar productos
    const handleRefresh = async () => {
      await refreshRelated();
      toast.success('Productos actualizados', {
        description: 'Se encontraron nuevas recomendaciones'
      });
    };

    // Configurar clases CSS según variante
    const containerClasses = cn(
      "w-full space-y-6",
      className
    );

    const gridClasses = cn(
      "gap-4",
      {
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4": variant === "default" || variant === "grid",
        "flex overflow-x-auto space-x-4 pb-4": variant === "horizontal",
        "space-y-4": variant === "vertical",
      }
    );

    const cardClasses = cn(
      "group bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-liquor-orange/50",
      {
        "p-3": cardSize === "sm",
        "p-4": cardSize === "md",
        "p-6": cardSize === "lg",
        "min-w-[200px]": variant === "horizontal",
      }
    );

    const imageClasses = cn(
      "bg-gray-100 rounded-xl overflow-hidden mb-3",
      {
        "w-full h-32": cardSize === "sm",
        "w-full h-40": cardSize === "md",
        "w-full h-48": cardSize === "lg",
        "w-32 h-32": variant === "vertical",
      }
    );

    // Si no hay producto actual, no mostrar nada
    if (!currentProduct) {
      return null;
    }

    return (
      <div ref={ref} className={containerClasses}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          
          {showRefresh && hasProducts && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              <span>Actualizar</span>
            </Button>
          )}
        </div>

        {/* Filtros por categoría */}
        {showCategories && categories.length > 1 && (
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Button
              variant={selectedCategory === '' ? "liquorOrange" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory('')}
              className="whitespace-nowrap"
            >
              Todos ({products.length})
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "liquorOrange" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category} ({getByCategory(category).length})
              </Button>
            ))}
          </div>
        )}

        {/* Contenido */}
        {loading ? (
          <ProductGridSkeleton 
            count={maxProducts} 
            variant="default" 
            showPrice={showPrices}
            className={gridClasses.replace('gap-4', 'gap-4')}
          />
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Error al cargar productos relacionados
            </h4>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button 
              variant="liquorOrange" 
              size="sm"
              onClick={handleRefresh}
            >
              Reintentar
            </Button>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-4h-8m4-2v.01M9 7v.01" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              No hay productos relacionados
            </h4>
            <p className="text-gray-600 text-sm">
              No se encontraron productos similares en este momento
            </p>
          </div>
        ) : (
          <div className={gridClasses}>
            {displayProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="block"
                onClick={() => handleProductClick(product)}
              >
                <div className={cardClasses}>
                  {/* Imagen del producto */}
                  <div className="relative">
                    <div className={imageClasses}>
                      <Image
                        src={product.Photo || "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"}
                        alt={product.Nombre}
                        width={cardSize === "sm" ? 128 : cardSize === "md" ? 160 : 192}
                        height={cardSize === "sm" ? 128 : cardSize === "md" ? 160 : 192}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Badge de stock */}
                    {showStock && product.Stock === 'Sin Stock' && (
                      <Badge variant="destructive" className="absolute top-2 left-2 text-xs">
                        Agotado
                      </Badge>
                    )}

                    {/* Botones de acción flotantes */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {showWishlist && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-8 h-8 rounded-full"
                          onClick={(e) => handleAddToWishlist(product, e)}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-8 h-8 rounded-full"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Botón de agregar al carrito */}
                    {showAddToCart && variant !== "vertical" && (
                      <Button
                        size="sm"
                        variant="liquorOrange"
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 z-10"
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.Stock === 'Sin Stock'}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className={variant === "vertical" ? "flex-1" : ""}>
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                      {product.Nombre}
                    </h4>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      {product.Tamaño} • {product['Sub Categoria']}
                    </p>
                    
                    {showPrices && (
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
                        
                        {showAddToCart && variant === "vertical" && (
                          <Button
                            variant="liquorOrange"
                            size="sm"
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={product.Stock === 'Sin Stock'}
                          >
                            Agregar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer con enlace para ver más */}
        {hasProducts && displayProducts.length >= 4 && (
          <div className="text-center">
            <Link href={`/categoria/${encodeURIComponent(currentProduct.Categoria)}`}>
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Ver más productos de {currentProduct.Categoria}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }
);

RelatedProducts.displayName = "RelatedProducts";

export { RelatedProducts };