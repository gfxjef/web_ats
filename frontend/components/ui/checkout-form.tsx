"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/components/ui/cart-item";
import { 
  CreditCard, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Calendar,
  Package,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartContext } from "@/contexts/cart-context";
import { useLiquorToast } from "@/hooks/use-liquor-toast";

export interface CheckoutFormProps {
  onOrderComplete?: (orderId: string) => void;
  className?: string;
}

interface FormData {
  // Información personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Dirección de envío
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Información de pago
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

interface FormErrors {
  [key: string]: string;
}

const CheckoutForm = React.forwardRef<HTMLDivElement, CheckoutFormProps>(
  ({ onOrderComplete, className }, ref) => {
    const toast = useLiquorToast();
    const cart = useCartContext();
    const { items, summary, isEmpty } = cart;

    const [formData, setFormData] = useState<FormData>({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'México',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolderName: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Shipping, 3: Payment
    const [paymentMethod, setPaymentMethod] = useState('card'); // card, paypal, transfer

    // Validar formulario
    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      // Validar información personal
      if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido';
      if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido';
      if (!formData.email.trim()) {
        newErrors.email = 'Email es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email no es válido';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Teléfono es requerido';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Teléfono debe tener 10 dígitos';
      }

      // Validar dirección de envío
      if (!formData.address.trim()) newErrors.address = 'Dirección es requerida';
      if (!formData.city.trim()) newErrors.city = 'Ciudad es requerida';
      if (!formData.state.trim()) newErrors.state = 'Estado es requerido';
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = 'Código postal es requerido';
      } else if (!/^\d{5}$/.test(formData.zipCode)) {
        newErrors.zipCode = 'Código postal debe tener 5 dígitos';
      }

      // Validar información de pago (solo si es tarjeta)
      if (paymentMethod === 'card') {
        if (!formData.cardNumber.trim()) {
          newErrors.cardNumber = 'Número de tarjeta es requerido';
        } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
          newErrors.cardNumber = 'Número de tarjeta debe tener 16 dígitos';
        }
        
        if (!formData.expiryDate.trim()) {
          newErrors.expiryDate = 'Fecha de expiración es requerida';
        } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
          newErrors.expiryDate = 'Formato debe ser MM/YY';
        }
        
        if (!formData.cvv.trim()) {
          newErrors.cvv = 'CVV es requerido';
        } else if (!/^\d{3,4}$/.test(formData.cvv)) {
          newErrors.cvv = 'CVV debe tener 3 o 4 dígitos';
        }
        
        if (!formData.cardHolderName.trim()) {
          newErrors.cardHolderName = 'Nombre del titular es requerido';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Manejar cambio de input
    const handleInputChange = (field: keyof FormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Limpiar error cuando el usuario corrige
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

    // Formatear número de tarjeta
    const formatCardNumber = (value: string) => {
      const numbers = value.replace(/\D/g, '');
      return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').substr(0, 19);
    };

    // Formatear fecha de expiración
    const formatExpiryDate = (value: string) => {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length >= 2) {
        return numbers.substr(0, 2) + '/' + numbers.substr(2, 2);
      }
      return numbers;
    };

    // Procesar pedido
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isEmpty) {
        toast.error('El carrito está vacío', {
          description: 'Agrega productos antes de proceder'
        });
        return;
      }

      if (!validateForm()) {
        toast.error('Por favor corrige los errores', {
          description: 'Revisa los campos marcados en rojo'
        });
        return;
      }

      setIsSubmitting(true);

      try {
        // Simular procesamiento de pago
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Generar ID de pedido
        const orderId = `LIQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Limpiar carrito
        cart.clearCart();

        // Notificar éxito
        toast.success('¡Pedido realizado con éxito!', {
          description: `ID del pedido: ${orderId}`
        });

        // Callback de finalización
        onOrderComplete?.(orderId);

      } catch (error) {
        console.error('Error procesando pedido:', error);
        toast.error('Error al procesar el pedido', {
          description: 'Inténtalo de nuevo o contacta soporte'
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    // Avanzar al siguiente paso
    const handleNextStep = () => {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    };

    // Retroceder al paso anterior
    const handlePrevStep = () => {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    };

    if (isEmpty) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600">
            Agrega productos antes de proceder al checkout
          </p>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("max-w-4xl mx-auto", className)}>
        {/* Indicador de pasos */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, name: 'Información', icon: User },
              { step: 2, name: 'Envío', icon: Truck },
              { step: 3, name: 'Pago', icon: CreditCard },
            ].map(({ step, name, icon: Icon }) => (
              <div key={step} className="flex items-center space-x-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  currentStep >= step 
                    ? "bg-liquor-orange border-liquor-orange text-white" 
                    : "border-gray-300 text-gray-400"
                )}>
                  {currentStep > step ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  currentStep >= step ? "text-liquor-orange" : "text-gray-400"
                )}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-8">
            {/* Paso 1: Información Personal */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <User className="w-5 h-5 text-liquor-orange" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Información Personal
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Tu nombre"
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Tu apellido"
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="tu@email.com"
                        className={cn("pl-10", errors.email ? 'border-red-500' : '')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="55 1234 5678"
                        className={cn("pl-10", errors.phone ? 'border-red-500' : '')}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleNextStep} type="button">
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 2: Información de Envío */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <MapPin className="w-5 h-5 text-liquor-orange" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Dirección de Envío
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Calle, número, colonia"
                      className={errors.address ? 'border-red-500' : ''}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Ciudad"
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                      </label>
                      <Input
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Estado"
                        className={errors.state ? 'border-red-500' : ''}
                      />
                      {errors.state && (
                        <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal *
                      </label>
                      <Input
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="12345"
                        className={errors.zipCode ? 'border-red-500' : ''}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <Input
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button onClick={handlePrevStep} variant="outline" type="button">
                    Atrás
                  </Button>
                  <Button onClick={handleNextStep} type="button">
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 3: Información de Pago */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard className="w-5 h-5 text-liquor-orange" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Método de Pago
                  </h2>
                </div>

                {/* Selección de método de pago */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "p-4 border-2 rounded-lg text-center transition-colors",
                      paymentMethod === 'card' 
                        ? "border-liquor-orange bg-liquor-orange/5" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Tarjeta</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={cn(
                      "p-4 border-2 rounded-lg text-center transition-colors",
                      paymentMethod === 'paypal' 
                        ? "border-liquor-orange bg-liquor-orange/5" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="w-6 h-6 mx-auto mb-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                      PP
                    </div>
                    <span className="text-sm font-medium">PayPal</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={cn(
                      "p-4 border-2 rounded-lg text-center transition-colors",
                      paymentMethod === 'transfer' 
                        ? "border-liquor-orange bg-liquor-orange/5" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Package className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Transferencia</span>
                  </button>
                </div>

                {/* Formulario de tarjeta */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Tarjeta *
                      </label>
                      <Input
                        value={formatCardNumber(formData.cardNumber)}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={errors.cardNumber ? 'border-red-500' : ''}
                      />
                      {errors.cardNumber && (
                        <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          MM/YY *
                        </label>
                        <Input
                          value={formatExpiryDate(formData.expiryDate)}
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                          placeholder="12/25"
                          maxLength={5}
                          className={errors.expiryDate ? 'border-red-500' : ''}
                        />
                        {errors.expiryDate && (
                          <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="password"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            placeholder="123"
                            maxLength={4}
                            className={cn("pl-10", errors.cvv ? 'border-red-500' : '')}
                          />
                        </div>
                        {errors.cvv && (
                          <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Titular *
                      </label>
                      <Input
                        value={formData.cardHolderName}
                        onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                        placeholder="Como aparece en la tarjeta"
                        className={errors.cardHolderName ? 'border-red-500' : ''}
                      />
                      {errors.cardHolderName && (
                        <p className="text-sm text-red-600 mt-1">{errors.cardHolderName}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Métodos alternativos */}
                {paymentMethod === 'paypal' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-blue-600 font-bold text-lg">PP</div>
                    </div>
                    <p className="text-gray-600">
                      Serás redirigido a PayPal para completar el pago
                    </p>
                  </div>
                )}

                {paymentMethod === 'transfer' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">
                          Transferencia Bancaria
                        </h4>
                        <p className="text-sm text-blue-800">
                          Recibirás los datos bancarios por email para realizar la transferencia. 
                          Tu pedido se procesará una vez confirmado el pago.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button onClick={handlePrevStep} variant="outline" type="button">
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-liquor-orange hover:bg-liquor-orange/90"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Confirmar Pedido
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen del Pedido
              </h3>

              {/* Items del carrito */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    variant="compact"
                    showActions={false}
                    showRemove={false}
                    showLink={false}
                    readonly={true}
                  />
                ))}
              </div>

              {/* Resumen de precios */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>S/{summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>{summary.shipping === 0 ? 'GRATIS' : `S/${summary.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuestos</span>
                  <span>S/{summary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>S/{summary.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Información de entrega */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Entrega estimada</span>
                </div>
                <p className="text-sm text-green-800">
                  1-3 días hábiles
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
);

CheckoutForm.displayName = "CheckoutForm";

export { CheckoutForm };