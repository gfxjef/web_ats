import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/contexts/cart-context';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { LocalBusinessStructuredData } from '@/components/seo/structured-data';
import { LocalSEOData } from '@/components/seo/local-seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Licorería ATS - Delivery Rápido | San Juan de Lurigancho, Lima',
  description: 'Licorería en San Juan de Lurigancho con delivery rápido. Cerveza, whisky, vodka, ron, pisco y más. Entrega a domicilio de 1pm a 12am. Los mejores precios de Lima.',
  keywords: 'licoreria san juan de lurigancho, cerveza san juan de lurigancho, whisky lima, delivery licores, cerveza barato lima, licores a domicilio',
  authors: [{ name: 'Licorería ATS' }],
  creator: 'Licorería ATS',
  publisher: 'Licorería ATS',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: 'https://atusaludlicoreria.com',
    title: 'Licorería ATS - Delivery Rápido | San Juan de Lurigancho',
    description: 'Licorería en San Juan de Lurigancho con delivery rápido. Los mejores precios en cerveza, whisky y licores.',
    siteName: 'Licorería ATS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Licorería ATS - Delivery Rápido | San Juan de Lurigancho',
    description: 'Licorería en San Juan de Lurigancho con delivery rápido. Los mejores precios en cerveza, whisky y licores.',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  category: 'business',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Licorería ATS" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || ''} />
      </head>
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
        {/* Google Analytics - Reemplazar GA_MEASUREMENT_ID con tu ID real */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        
        {/* Datos estructurados para LocalBusiness */}
        <LocalBusinessStructuredData />
        
        {/* SEO Local específico para Lima */}
        <LocalSEOData />
      </body>
    </html>
  );
}