"use client";

import { useRouter } from "next/navigation";
import { CheckoutForm } from "@/components/ui/checkout-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();

  const handleOrderComplete = (orderId: string) => {
    // Redirigir a página de confirmación
    router.push(`/order-confirmation?orderId=${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-600">
                Completa tu pedido de forma segura
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="py-8 px-4">
        <CheckoutForm onOrderComplete={handleOrderComplete} />
      </div>
      
      {/* Bottom padding to account for fixed navigation */}
      <div className="h-24"></div>
    </div>
  );
}