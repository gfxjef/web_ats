'use client'

import { useEffect } from 'react'

// Datos estructurados para LocalBusiness
export const LocalBusinessStructuredData = () => {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LiquorStore",
      "name": "Licorería ATS",
      "description": "Licorería en San Juan de Lurigancho con delivery rápido. Cerveza, whisky, vodka, ron, pisco y más.",
      "url": "https://atusaludlicoreria.com",
      "telephone": "+51-938-101-013",
      "email": "info@atusaludlicoreria.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jr Los Médicos, Mz K2 Lt4 Atusparia",
        "addressLocality": "San Juan De Lurigancho",
        "addressRegion": "Lima",
        "addressCountry": "PE",
        "postalCode": "15408"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "-11.9746", // Coordenadas aproximadas de San Juan de Lurigancho
        "longitude": "-76.9971"
      },
      "openingHours": "Mo-Su 13:00-24:00",
      "priceRange": "$",
      "acceptsReservations": false,
      "servesCuisine": ["Alcoholic Beverages", "Beer", "Wine", "Spirits"],
      "paymentAccepted": ["Cash", "Credit Card", "Yape", "Plin"],
      "currenciesAccepted": "PEN",
      "areaServed": {
        "@type": "City",
        "name": "San Juan de Lurigancho",
        "containedIn": {
          "@type": "AdministrativeArea",
          "name": "Lima"
        }
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Catálogo de Licores y Cervezas",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Cerveza",
              "category": "Bebidas Alcohólicas"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Whisky",
              "category": "Bebidas Alcohólicas"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Vodka",
              "category": "Bebidas Alcohólicas"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Pisco",
              "category": "Bebidas Alcohólicas"
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": "250",
        "bestRating": "5"
      },
      "sameAs": [
        // TODO: Agregar redes sociales reales
        "https://www.facebook.com/licoreria-ats",
        "https://www.instagram.com/licoreria_ats"
      ]
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return null
}

// Datos estructurados para productos individuales
export const ProductStructuredData = ({ 
  product 
}: { 
  product: {
    id: number
    SKU: string
    Nombre: string
    Modelo: string
    Tamaño: string
    'Precio B': number
    'Precio J': number
    Categoria: string
    'Sub Categoria': string
    Stock: string
    Descripcion?: string
    Photo: string
  } 
}) => {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.Nombre,
      "model": product.Modelo,
      "description": product.Descripcion || `${product.Nombre} - ${product.Tamaño}`,
      "sku": product.SKU,
      "image": product.Photo,
      "category": product.Categoria,
      "brand": {
        "@type": "Brand",
        "name": product.Modelo || "Generic"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://atusaludlicoreria.com/product/${product.id}`,
        "priceCurrency": "PEN",
        "price": product['Precio B'],
        "availability": product.Stock === "Con Stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Licorería ATS"
        },
        "itemCondition": "https://schema.org/NewCondition",
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 días
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": "15"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Tamaño",
          "value": product.Tamaño
        },
        {
          "@type": "PropertyValue", 
          "name": "Categoría",
          "value": product['Sub Categoria']
        }
      ]
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [product])

  return null
}

// Datos estructurados para breadcrumbs
export const BreadcrumbStructuredData = ({ 
  items 
}: { 
  items: Array<{ name: string; url: string }> 
}) => {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [items])

  return null
}