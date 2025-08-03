# AUDITORÍA DE PRODUCCIÓN - LICORERÍA ATS

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. BACKEND (Render)

#### ❌ Seguridad
- **CORS habilitado para todos los orígenes** (`"*"`) - CRÍTICO
- **SECRET_KEY con valor por defecto** si no está configurado
- **DEBUG habilitado en producción** según render.yaml
- **Sin autenticación/autorización** en endpoints

#### ❌ Configuración
- **Falta archivo wsgi.py** referenciado en render.yaml
- **Falta gunicorn.conf.py** referenciado en render.yaml
- **Variables de entorno sin validación estricta** en producción

#### ❌ Base de Datos
- **Credenciales MySQL sin cifrado**
- **Sin SSL/TLS para conexión a base de datos**
- **Sin límite de conexiones configurado**

### 2. FRONTEND (Vercel)

#### ❌ Build
- **TypeScript errors ignorados** (`ignoreBuildErrors: true`)
- **ESLint deshabilitado** (`ignoreDuringBuilds: true`)
- **Imágenes no optimizadas** (`unoptimized: true`)

#### ❌ Seguridad
- **API_URL hardcodeada** en .env
- **Sin validación de respuestas API**
- **Sin manejo de errores robusto**

#### ❌ Performance
- **Sin lazy loading implementado**
- **Sin optimización de bundle**
- **Sin configuración de caché**

## ✅ SOLUCIONES REQUERIDAS

### 1. BACKEND - Archivos Faltantes

#### wsgi.py
```python
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
```

#### gunicorn.conf.py
```python
import os

bind = f"0.0.0.0:{os.environ.get('PORT', 5001)}"
workers = int(os.environ.get('WEB_CONCURRENCY', 4))
worker_class = 'sync'
worker_connections = 1000
timeout = 120
keepalive = 2
threads = 4
max_requests = 1000
max_requests_jitter = 50
graceful_timeout = 30
accesslog = '-'
errorlog = '-'
loglevel = 'info'
```

### 2. BACKEND - Seguridad

#### Actualizar app.py (CORS)
```python
# Reemplazar línea 26:
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://tu-dominio-vercel.vercel.app",
            "https://tu-dominio-custom.com"
        ],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

#### Actualizar config.py
```python
class Config:
    # ... código existente ...
    
    # Agregar después de línea 28:
    # Configuración de Seguridad
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Configuración SSL Base de Datos
    DB_SSL = os.getenv('DB_SSL', 'False').lower() == 'true'
    DB_SSL_CA = os.getenv('DB_SSL_CA')
    
    @classmethod
    def validate_production_config(cls):
        """Validación estricta para producción"""
        if os.getenv('FLASK_ENV') == 'production':
            if cls.SECRET_KEY == 'dev-secret-key-change-in-production':
                raise ValueError("SECRET_KEY no puede usar valor por defecto en producción")
            if cls.DEBUG:
                raise ValueError("DEBUG debe estar deshabilitado en producción")
            if not cls.CORS_ORIGINS or cls.CORS_ORIGINS == ['']:
                raise ValueError("CORS_ORIGINS debe estar configurado en producción")
```

### 3. FRONTEND - Configuración de Producción

#### next.config.js actualizado
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Cambiar a false
  },
  typescript: {
    ignoreBuildErrors: false, // Cambiar a false
  },
  images: { 
    domains: ['images.pexels.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false,
      };
    }
    return config;
  },
  // Optimizaciones de producción
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};

module.exports = nextConfig;
```

#### Crear middleware.ts (seguridad)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Headers de seguridad
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https://images.pexels.com; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  );
  
  return response;
}

export const config = {
  matcher: '/:path*',
};
```

## 📋 CHECKLIST DE DESPLIEGUE

### Backend (Render)

1. [ ] Crear archivo wsgi.py
2. [ ] Crear archivo gunicorn.conf.py
3. [ ] Configurar variables de entorno en Render:
   ```
   DB_HOST=tu-mysql-host
   DB_USER=tu-mysql-user
   DB_PASSWORD=tu-mysql-password-segura
   DB_NAME=tu-database
   DB_PORT=3306
   SECRET_KEY=genera-una-clave-segura-de-64-caracteres
   FLASK_ENV=production
   FLASK_DEBUG=False
   CORS_ORIGINS=https://tu-dominio-vercel.vercel.app,https://tu-dominio.com
   ```
4. [ ] Actualizar render.yaml:
   ```yaml
   services:
     - type: web
       name: web-ats-backend
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: gunicorn wsgi:app -c gunicorn.conf.py
       envVars:
         - key: PYTHON_VERSION
           value: 3.9.0
         - key: FLASK_ENV
           value: production
         - key: FLASK_DEBUG
           value: False  # Cambiar a False
       healthCheckPath: /health
   ```

### Frontend (Vercel)

1. [ ] Corregir errores de TypeScript y ESLint
2. [ ] Configurar variables de entorno en Vercel:
   ```
   NEXT_PUBLIC_API_URL=https://web-ats-backend.onrender.com
   NODE_ENV=production
   ```
3. [ ] Crear archivo middleware.ts
4. [ ] Actualizar next.config.js
5. [ ] Implementar manejo de errores robusto

### Base de Datos

1. [ ] Habilitar SSL en MySQL
2. [ ] Crear usuario específico para la aplicación con permisos limitados
3. [ ] Configurar límites de conexión
4. [ ] Hacer backup antes del despliegue

### Monitoreo

1. [ ] Configurar alertas en Render
2. [ ] Configurar Analytics en Vercel
3. [ ] Implementar logging estructurado
4. [ ] Configurar monitoreo de uptime

## 🔐 VARIABLES DE ENTORNO REQUERIDAS

### Backend (Render)
```env
# Base de Datos
DB_HOST=mysql-production-host
DB_USER=ats_prod_user
DB_PASSWORD=contraseña-super-segura
DB_NAME=ats_production
DB_PORT=3306

# Seguridad
SECRET_KEY=genera-con-openssl-rand-hex-32
FLASK_ENV=production
FLASK_DEBUG=False
CORS_ORIGINS=https://licoreria-ats.vercel.app

# Redis (opcional)
REDIS_HOST=redis-production-host
REDIS_PORT=6379
REDIS_DB=0
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://web-ats-backend.onrender.com
NODE_ENV=production
```

## ⚠️ RECOMENDACIONES ADICIONALES

1. **Implementar Rate Limiting** en el backend
2. **Agregar autenticación JWT** para endpoints sensibles
3. **Configurar CDN** para assets estáticos
4. **Implementar compresión gzip** en respuestas
5. **Agregar health checks** más robustos
6. **Configurar backups automáticos** de la base de datos
7. **Implementar circuit breaker** para llamadas API
8. **Agregar métricas de rendimiento** (APM)

## 🚀 COMANDOS DE DESPLIEGUE

### Backend (local test antes de deploy)
```bash
cd backend
pip install -r requirements.txt
export FLASK_ENV=production
export FLASK_DEBUG=False
gunicorn wsgi:app -c gunicorn.conf.py
```

### Frontend (build local)
```bash
cd frontend
npm install
npm run build
npm start
```

## 📊 MÉTRICAS A MONITOREAR

1. **Response Time** < 200ms
2. **Error Rate** < 1%
3. **Uptime** > 99.9%
4. **Database Connection Pool** utilization
5. **Memory Usage** < 80%
6. **CPU Usage** < 70%