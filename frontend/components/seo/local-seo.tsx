'use client'

import { useEffect } from 'react'

// Componente para SEO local específico
export const LocalSEOData = () => {
  useEffect(() => {
    // Datos estructurados específicos para SEO local en Lima
    const localSEOData = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Licorería ATS",
      "alternateName": "ATS Licorería",
      "description": "La mejor licorería en San Juan de Lurigancho con delivery rápido. Especialistas en cerveza, whisky, vodka, ron, pisco y más bebidas alcohólicas.",
      "url": "https://atusaludlicoreria.com",
      "image": "https://atusaludlicoreria.com/og-image.jpg",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jr Los Médicos, Mz K2 Lt4 Atusparia",
        "addressLocality": "San Juan De Lurigancho",
        "addressRegion": "Lima",
        "addressCountry": "Perú",
        "postalCode": "15408"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -11.9746,
        "longitude": -76.9971
      },
      "openingHours": [
        "Mo 13:00-24:00",
        "Tu 13:00-24:00", 
        "We 13:00-24:00",
        "Th 13:00-24:00",
        "Fr 13:00-24:00",
        "Sa 13:00-24:00",
        "Su 13:00-24:00"
      ],
      "telephone": "+51-938-101-013",
      "email": "info@atusaludlicoreria.com",
      "priceRange": "$-$$",
      "paymentAccepted": [
        "Cash",
        "Credit Card", 
        "Debit Card",
        "Yape",
        "Plin"
      ],
      "currenciesAccepted": "PEN",
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": -11.9746,
          "longitude": -76.9971
        },
        "geoRadius": "10000"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": "San Juan de Lurigancho"
        },
        {
          "@type": "City", 
          "name": "Lima"
        }
      ],
      "hasMap": "https://maps.google.com/?q=Jr+Los+Medicos+Mz+K2+Lt4+Atusparia+San+Juan+De+Lurigancho+Lima",
      "potentialAction": {
        "@type": "OrderAction",
        "deliveryMethod": "DeliveryModeDirectDelivery",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://atusaludlicoreria.com/checkout"
        }
      },
      "keywords": "licorería san juan de lurigancho, cerveza delivery, whisky lima, licores baratos, entrega rápida, pisco peruano, vodka premium, ron oscuro",
      "foundingDate": "2020",
      "slogan": "Tu Aliado para cada Celebración"
    }

    // Datos específicos para delivery en Lima
    const deliveryServiceData = {
      "@context": "https://schema.org",
      "@type": "DeliveryService", 
      "name": "Delivery Licorería ATS",
      "description": "Servicio de delivery rápido de licores y cervezas en San Juan de Lurigancho y Lima",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Licorería ATS"
      },
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
        "name": "Catálogo Delivery",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Delivery de Cerveza",
              "description": "Entrega rápida de cervezas frías a domicilio"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Service",
              "name": "Delivery de Whisky",
              "description": "Entrega de whisky premium y nacional"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service", 
              "name": "Delivery de Pisco",
              "description": "Entrega de pisco peruano acholado y puro"
            }
          }
        ]
      },
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday", 
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "13:00",
        "closes": "24:00"
      }
    }

    // Insertar datos estructurados en el DOM
    const localScript = document.createElement('script')
    localScript.type = 'application/ld+json'
    localScript.textContent = JSON.stringify(localSEOData)
    document.head.appendChild(localScript)

    const deliveryScript = document.createElement('script')
    deliveryScript.type = 'application/ld+json'
    deliveryScript.textContent = JSON.stringify(deliveryServiceData)
    document.head.appendChild(deliveryScript)

    return () => {
      document.head.removeChild(localScript)
      document.head.removeChild(deliveryScript)
    }
  }, [])

  return null
}

// Hook personalizado para geolocalización y SEO local
export const useLocalSEO = () => {
  useEffect(() => {
    // Detectar ubicación del usuario para personalizar contenido local
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          
          // Verificar si está en Lima/San Juan de Lurigancho
          const isInDeliveryArea = 
            latitude >= -12.1 && latitude <= -11.8 && // Rango de latitud para Lima
            longitude >= -77.1 && longitude <= -76.8   // Rango de longitud para Lima
          
          if (isInDeliveryArea) {
            console.log('👨‍💻 Usuario en zona de delivery - Lima/SJL')
            // Se podría personalizar el contenido para usuarios locales
          }
        },
        (error) => {
          console.log('🌍 Geolocalización no disponible:', error.message)
        },
        { timeout: 5000, maximumAge: 300000 } // Cache por 5 minutos
      )
    }
  }, [])
}