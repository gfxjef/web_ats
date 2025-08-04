"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Mail, 
  Calendar,
  MapPin,
  CreditCard,
  Download,
  Share2,
  Home,
  MessageCircle
} from "lucide-react";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'LIQ-12345-ABCD';

  // Datos simulados del pedido
  const orderData = {
    id: orderId,
    date: new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: 'confirmed',
    total: 2150.50,
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    shippingAddress: {
      name: 'Juan Pérez',
      address: 'Av. Reforma 123, Col. Centro',
      city: 'Ciudad de México',
      zipCode: '06000'
    },
    paymentMethod: 'Tarjeta terminada en ****1234',
    items: [
      { name: 'Whisky Premium Escocés', quantity: 1, price: 850 },
      { name: 'Cerveza Artesanal IPA', quantity: 6, price: 65 },
      { name: 'Vodka Premium', quantity: 1, price: 750 }
    ]
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Mi pedido en Licorería ATS',
          text: `¡Acabo de realizar un pedido! ID: ${orderId}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownloadReceipt = () => {
    // Simular descarga de comprobante
    const element = document.createElement('a');
    const file = new Blob([`
      LICORERÍA ATS - COMPROBANTE DE PEDIDO
      
      ID del Pedido: ${orderData.id}
      Fecha: ${orderData.date}
      Total: $${orderData.total.toFixed(2)}
      
      Productos:
      ${orderData.items.map(item => `- ${item.name} (${item.quantity}x) - $${item.price}`).join('\n')}
      
      Dirección de envío:
      ${orderData.shippingAddress.name}
      ${orderData.shippingAddress.address}
      ${orderData.shippingAddress.city}, ${orderData.shippingAddress.zipCode}
      
      Gracias por tu compra.
    `], { type: 'text/plain' });
    
    element.href = URL.createObjectURL(file);
    element.download = `comprobante-${orderData.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendWhatsApp = () => {
    // Generar mensaje para WhatsApp
    const whatsappMessage = `🛒 *NUEVO PEDIDO - LICORERÍA ATS*

📋 ID: ${orderData.id}
📅 Fecha: ${orderData.date}
👤 Cliente: ${orderData.shippingAddress.name}

🍾 *PRODUCTOS:*
${orderData.items.map(item => `• ${item.name} (${item.quantity}x) - S/${item.price}`).join('\n')}

💰 *Total: S/${orderData.total.toFixed(2)}*

📍 *Dirección:*
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.zipCode}

¡Pedido confirmado y listo para procesar!`;

    // Número de WhatsApp de la empresa (configurar según sea necesario)
    const whatsappNumber = '51987654321'; // Reemplazar con el número real
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header de confirmación */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Tu pedido ha sido procesado exitosamente
          </p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-500">ID del pedido:</span>
            <Badge variant="secondary" className="font-mono text-sm">
              {orderData.id}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información del pedido */}
          <div className="space-y-6">
            {/* Estado del pedido */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Estado del Pedido
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pedido confirmado</p>
                    <p className="text-sm text-gray-500">{orderData.date}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Preparando pedido</p>
                    <p className="text-sm text-gray-500">En las próximas 2-4 horas</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 opacity-50">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">En camino</p>
                    <p className="text-sm text-gray-400">Te notificaremos cuando salga</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 opacity-50">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Entregado</p>
                    <p className="text-sm text-gray-400">Estimado: {orderData.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de entrega */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Entrega
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Dirección de envío</p>
                    <p className="text-sm text-gray-600">
                      {orderData.shippingAddress.name}<br/>
                      {orderData.shippingAddress.address}<br/>
                      {orderData.shippingAddress.city}, {orderData.shippingAddress.zipCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Fecha estimada de entrega</p>
                    <p className="text-sm text-gray-600">{orderData.estimatedDelivery}</p>
                    <p className="text-xs text-gray-500 mt-1">1-3 días hábiles</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Método de pago</p>
                    <p className="text-sm text-gray-600">{orderData.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notificaciones */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">
                    Confirmación enviada por email
                  </h3>
                  <p className="text-sm text-blue-800">
                    Hemos enviado los detalles de tu pedido a tu correo electrónico. 
                    También recibirás actualizaciones sobre el estado de tu envío.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="space-y-6">
            {/* Productos */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Productos Pedidos
              </h2>
              
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      S/{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>S/{orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ¿Qué sigue?
              </h2>
              
              <div className="space-y-3">
                <Button onClick={handleSendWhatsApp} className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar pedido por WhatsApp
                </Button>

                <Button onClick={handleDownloadReceipt} variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar comprobante
                </Button>

                <Button onClick={handleShare} variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir pedido
                </Button>

                <Link href="/" className="block">
                  <Button variant="liquorOrange" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Continuar comprando
                  </Button>
                </Link>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h3 className="font-medium text-amber-900 mb-2">
                Información importante
              </h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Recibirás un email de confirmación en los próximos minutos</li>
                <li>• Te notificaremos cuando tu pedido salga para entrega</li>
                <li>• Puedes rastrear tu pedido usando el ID: {orderData.id}</li>
                <li>• Si tienes preguntas, contáctanos al 55-1234-5678</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Productos recomendados */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Para tu próximo pedido
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Whisky Premium", price: 850, image: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop" },
              { name: "Cerveza Artesanal", price: 65, image: "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop" },
              { name: "Vodka Premium", price: 750, image: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop" },
              { name: "Ron Añejo", price: 650, image: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop" },
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-sm font-bold text-gray-900 mb-3">S/{product.price}</p>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom padding to account for fixed navigation */}
      <div className="h-24"></div>
    </div>
  );
}