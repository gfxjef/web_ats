"use client";

import { ArrowLeft, Search, Share, Star, ChevronRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductDetailPage() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(2);
  const [currentImageIndex, setCurrentImageIndex] = useState(1);

  const productImages = [
    "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop"
  ];

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const totalPrice = 135 * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="flex items-center space-x-3">
          <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-5 h-5 text-gray-700" />
          </button>
          <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
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
              alt="Bira 91 Blonde Summer Larger"
              width={256}
              height={320}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Image Indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {productImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Bira 91 Blonde Summer Larger
          </h1>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">₹135.00</span>
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-gray-700 font-medium">5.0</span>
              <span className="text-gray-500">(1340 reviews)</span>
            </div>
          </div>

          {/* Brand Section */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Image 
                  src="https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop"
                  alt="Bira Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              </div>
              <span className="text-gray-700 font-medium">View all Bira Products</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          {/* Tasting Notes */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">Tasting Notes</h3>
            <p className="text-gray-600 leading-relaxed">
              Bud Light is a premium beer with incredible drinkability that has made it a top selling American beer that everybody knows and loves. This light beer is brewed using a combination of barley malts, rice and a blend of premium aroma hop varieties. Featuring a fresh, clean taste with subtle hop aromas, this light lager delivers ultimate refreshment with its delicate malt sweetness and crisp finish.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section with Quantity and Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 max-w-md mx-auto">
        <div className="flex items-center justify-between space-x-4">
          {/* Quantity Selector */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
            <button 
              onClick={() => handleQuantityChange(-1)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <span className="mx-4 text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
              {quantity}
            </span>
            <button 
              onClick={() => handleQuantityChange(1)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-full text-lg">
            Add to Cart
            <span className="ml-2">₹{totalPrice}.00</span>
          </Button>
        </div>
      </div>

      {/* Bottom padding to account for fixed section */}
      <div className="h-24"></div>
    </div>
  );
}