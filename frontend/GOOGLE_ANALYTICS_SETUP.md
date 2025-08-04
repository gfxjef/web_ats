# Configuración de Google Analytics

## Pasos para configurar Google Analytics:

1. **Crear una cuenta de Google Analytics**
   - Ve a https://analytics.google.com
   - Crea una nueva propiedad para tu sitio web
   - Obtén tu ID de medición (formato: G-XXXXXXXXXX)

2. **Configurar la variable de entorno**
   - Crea o edita el archivo `.env.local` en la carpeta `frontend`
   - Agrega tu ID de Google Analytics:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

3. **Verificar la instalación**
   - Reinicia el servidor de desarrollo
   - Abre las herramientas de desarrollo del navegador
   - Ve a la pestaña Network y busca solicitudes a `google-analytics.com`

## Eventos que se rastrean automáticamente:

- **Búsquedas**: Cuando un usuario busca productos
- **Agregar al carrito**: Cuando se agrega un producto al carrito
- **Vista de productos**: En la página de detalles del producto
- **Inicio de checkout**: Cuando se abre el formulario de pedido
- **Compra completada**: Cuando se envía un pedido

## Personalización adicional:

Para agregar más eventos, usa el hook `useAnalytics`:

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

const { trackEvent } = useAnalytics();

// Ejemplo de evento personalizado
trackEvent('click_banner', 'engagement', 'banner_name');
```