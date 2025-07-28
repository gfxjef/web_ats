# 🔧 Configuración de Variables de Entorno

## 📋 Descripción

Este documento explica cómo configurar las variables de entorno para el proyecto web_ats, permitiendo cambiar fácilmente entre entornos de desarrollo y producción.

## 🎯 Variables de Entorno del Frontend

### Archivo: `frontend/.env`

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:5001

# Environment
NODE_ENV=development

# Production Example:
# NEXT_PUBLIC_API_URL=https://api.tudominio.com
# NODE_ENV=production
```

### Variables Disponibles

| Variable | Descripción | Desarrollo | Producción |
|----------|-------------|------------|------------|
| `NEXT_PUBLIC_API_URL` | URL base de la API backend | `http://127.0.0.1:5001` | `https://api.tudominio.com` |
| `NODE_ENV` | Entorno de ejecución | `development` | `production` |

## 🚀 Cómo Cambiar Entre Entornos

### Desarrollo → Producción

1. **Editar el archivo `frontend/.env`:**
   ```env
   # Cambiar de:
   NEXT_PUBLIC_API_URL=http://127.0.0.1:5001
   
   # A:
   NEXT_PUBLIC_API_URL=https://api.tudominio.com
   ```

2. **Reiniciar el servidor de desarrollo:**
   ```bash
   cd frontend
   npm run dev
   ```

### Producción → Desarrollo

1. **Editar el archivo `frontend/.env`:**
   ```env
   # Cambiar de:
   NEXT_PUBLIC_API_URL=https://api.tudominio.com
   
   # A:
   NEXT_PUBLIC_API_URL=http://127.0.0.1:5001
   ```

2. **Reiniciar el servidor de desarrollo:**
   ```bash
   cd frontend
   npm run dev
   ```

## 🔧 Implementación Técnica

### Función Utilitaria

El frontend usa una función utilitaria para construir URLs:

```typescript
// Función utilitaria para obtener la URL base de la API
const getApiUrl = (endpoint: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
  return `${baseUrl}${endpoint}`;
};
```

### Uso en el Código

```typescript
// En lugar de URLs hardcodeadas:
const response = await fetch('http://127.0.0.1:5001/api/v1/productos/categorias?limit=10');

// Usar la función utilitaria:
const response = await fetch(getApiUrl('/api/v1/productos/categorias?limit=10'));
```

## 📊 Endpoints Configurados

Todos los endpoints del frontend usan la variable de entorno:

| Endpoint | Descripción |
|----------|-------------|
| `/api/v1/productos/categorias?limit=10` | Lista de categorías |
| `/api/v1/productos/categorias/WHISKY?limit=5` | Productos de whisky |
| `/api/v1/productos/sub_categorias/combos?limit=10&offset=5` | Combos con paginación |
| `/api/v1/productos/sub_categorias/piscos?limit=10&offset=10` | Productos recomendados |

## 🧪 Pruebas

### Script de Prueba

Ejecutar el script de prueba para verificar la configuración:

```bash
# Probar con URL de desarrollo
node test_env_config.js

# Probar con URL de producción
NEXT_PUBLIC_API_URL=https://api.tudominio.com node test_env_config.js
```

### Salida Esperada

```
🧪 PROBANDO CONFIGURACIÓN DE VARIABLES DE ENTORNO
================================================

🔧 Configuración actual:
   NEXT_PUBLIC_API_URL: https://api.tudominio.com
   NODE_ENV: development

🔗 URLs generadas:
   1. /api/v1/productos/categorias?limit=10
      → https://api.tudominio.com/api/v1/productos/categorias?limit=10
   2. /api/v1/productos/categorias/WHISKY?limit=5
      → https://api.tudominio.com/api/v1/productos/categorias/WHISKY?limit=5
   ...

✅ Configuración de variables de entorno funcionando correctamente!
```

## 🔒 Seguridad

### Variables Públicas vs Privadas

- **`NEXT_PUBLIC_*`**: Variables accesibles en el cliente (frontend)
- **Variables sin `NEXT_PUBLIC_`**: Solo accesibles en el servidor

### Archivos de Configuración

| Archivo | Propósito | Git |
|---------|-----------|-----|
| `.env` | Variables reales | ❌ No subir |
| `.env.example` | Template/documentación | ✅ Subir |
| `.env.local` | Variables locales | ❌ No subir |

## 🚀 Despliegue

### Vercel

1. **Configurar variables en Vercel Dashboard:**
   - `NEXT_PUBLIC_API_URL`: `https://api.tudominio.com`
   - `NODE_ENV`: `production`

2. **Deploy automático:**
   ```bash
   vercel --prod
   ```

### Netlify

1. **Configurar variables en Netlify Dashboard:**
   - `NEXT_PUBLIC_API_URL`: `https://api.tudominio.com`
   - `NODE_ENV`: `production`

2. **Deploy automático:**
   ```bash
   netlify deploy --prod
   ```

## 📝 Notas Importantes

1. **Reinicio necesario**: Después de cambiar `.env`, reiniciar el servidor de desarrollo
2. **Prefijo `NEXT_PUBLIC_`**: Requerido para variables accesibles en el cliente
3. **Fallback**: Si no se encuentra la variable, usa `http://127.0.0.1:5001` por defecto
4. **Caché**: Next.js puede cachear las variables, reiniciar si no se ven cambios

## 🔍 Troubleshooting

### Problema: Variables no se cargan
```bash
# Solución: Reiniciar servidor
npm run dev
```

### Problema: URLs incorrectas
```bash
# Verificar archivo .env
cat frontend/.env

# Verificar variable en runtime
console.log(process.env.NEXT_PUBLIC_API_URL);
```

### Problema: CORS en producción
```bash
# Asegurar que el backend permita el dominio de producción
# Configurar CORS en backend/config.py
``` 