'use client';

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export function useAnalytics() {
  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackProductView = (productId: number, productName: string, price: number) => {
    trackEvent('view_item', 'engagement', productName, price);
  };

  const trackAddToCart = (productId: number, productName: string, price: number, quantity: number) => {
    trackEvent('add_to_cart', 'ecommerce', productName, price * quantity);
  };

  const trackCheckout = (totalAmount: number) => {
    trackEvent('begin_checkout', 'ecommerce', 'checkout', totalAmount);
  };

  const trackPurchase = (orderId: string, totalAmount: number) => {
    trackEvent('purchase', 'ecommerce', orderId, totalAmount);
  };

  const trackSearch = (searchTerm: string) => {
    trackEvent('search', 'engagement', searchTerm);
  };

  return {
    trackEvent,
    trackProductView,
    trackAddToCart,
    trackCheckout,
    trackPurchase,
    trackSearch,
  };
}