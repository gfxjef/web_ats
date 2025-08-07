import { Metadata } from 'next'

export function generatePageMetadata({
  title,
  description,
  keywords,
  path = '/',
  image = '/og-image.jpg'
}: {
  title: string
  description: string
  keywords: string
  path?: string
  image?: string
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atusaludlicoreria.com'
  const fullUrl = `${baseUrl}${path}`

  return {
    title: `${title} | Licorería ATS - San Juan de Lurigancho`,
    description,
    keywords,
    openGraph: {
      title: `${title} | Licorería ATS`,
      description,
      url: fullUrl,
      siteName: 'Licorería ATS',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
        }
      ],
      locale: 'es_PE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Licorería ATS`,
      description,
      images: [image],
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

// Metadatos específicos por página
export const homePageMetadata = generatePageMetadata({
  title: 'Delivery Rápido de Licores y Cervezas',
  description: 'Licorería en San Juan de Lurigancho con delivery rápido. Cerveza, whisky, vodka, ron, pisco y más. Entrega a domicilio de 1pm a 12am. Los mejores precios de Lima.',
  keywords: 'licoreria san juan de lurigancho, cerveza san juan de lurigancho, whisky lima, delivery licores, cerveza barato lima, licores a domicilio, pisco peru, vodka lima'
})

export const categoriasPageMetadata = generatePageMetadata({
  title: 'Categorías de Licores y Bebidas',
  description: 'Explora todas nuestras categorías: cerveza, whisky, vodka, ron, pisco, vino y más. Licorería ATS en San Juan de Lurigancho con delivery rápido.',
  keywords: 'categorias licores, tipos cerveza, variedades whisky, vodka premium, ron peruano, pisco acholado, vino tinto',
  path: '/categorias'
})

export const checkoutPageMetadata = generatePageMetadata({
  title: 'Finalizar Compra - Delivery Rápido',
  description: 'Finaliza tu compra de licores y cervezas. Delivery rápido en San Juan de Lurigancho. Métodos de pago seguros y entrega garantizada.',
  keywords: 'checkout licoreria, comprar cerveza online, pago seguro delivery, entrega rapida san juan lurigancho',
  path: '/checkout'
})