import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/contexts/cart-context';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '🍷 Licorería ATS - Delivery Rápido',
  description: 'Entrega rápida de cerveza, vino, whisky y más. La mejor licorería online.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
          <div className="max-w-md mx-auto bg-white min-h-screen">
            {children}
            <BottomNavigation />
          </div>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}