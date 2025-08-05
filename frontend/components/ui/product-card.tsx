"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCartContext } from "@/contexts/cart-context";
import { useLiquorToast } from "@/hooks/use-liquor-toast";
import { useAnalytics } from "@/hooks/use-analytics";

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
  Photo: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartContext();
  const toast = useLiquorToast();
  const { trackAddToCart } = useAnalytics();

  const handleAddToCart = (e: React.MouseEvent) => {
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
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative group hover:shadow-lg transition-shadow">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative mb-3">
          <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
            <Image 
              src={product.Photo || "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop"}
              alt={product.Nombre}
              width={200}
              height={200}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          {product.Stock === "Sin Stock" && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">Sin Stock</span>
            </div>
          )}
        </div>
        <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
          {product.Nombre}
        </h4>
        <p className="text-xs text-gray-500 mb-2">{product.Modelo}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">S/{product['Precio B']}</p>
            {product['Precio J'] > product['Precio B'] && (
              <p className="text-xs text-gray-500 line-through">S/{product['Precio J']}</p>
            )}
          </div>
        </div>
      </Link>
      <Button 
        size="sm"
        className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 p-0 z-10"
        onClick={handleAddToCart}
        disabled={product.Stock === "Sin Stock"}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}