# CHECKLIST DE DESPLIEGUE - LICORERÍA ATS

## ✅ Configuraciones Aplicadas

### Backend (Render)
- [x] CORS configurado para: `web-ats.vercel.app` y `www.atusaludlicoreria.com`
- [x] DEBUG deshabilitado en producción
- [x] Archivos wsgi.py y gunicorn.conf.py verificados
- [x] Configuración de seguridad agregada en config.py
- [x] render.yaml actualizado con FLASK_DEBUG=False

### Frontend (Vercel)
- [x] next.config.js actualizado con configuración de producción
- [x] ESLint y TypeScript habilitados para builds
- [x] Headers de seguridad configurados
- [x] Middleware con CSP configurado
- [x] Variables de entorno de producción creadas

## 📋 PASOS PARA DESPLEGAR

### 1. Backend en Render

1. **Configurar variables de entorno en Render Dashboard:**
   ```
   DB_HOST=tu-mysql-host
   DB_USER=tu-mysql-user
   DB_PASSWORD=tu-mysql-password-segura
   DB_NAME=tu-database
   DB_PORT=3306
   SECRET_KEY=[generar con: openssl rand -hex 32]
   FLASK_ENV=production
   FLASK_DEBUG=False
   ```

2. **Hacer push de los cambios:**
   ```bash
   cd backend
   git add .
   git commit -m "feat: configuración de producción para Render"
   git push origin main
   ```

3. **En Render Dashboard:**
   - El deploy se iniciará automáticamente
   - Verificar logs para asegurar que no hay errores
   - Probar endpoint: `https://web-ats-backend.onrender.com/health`

### 2. Frontend en Vercel

1. **Configurar variables de entorno en Vercel Dashboard:**
   ```
   NEXT_PUBLIC_API_URL=https://web-ats-backend.onrender.com
   NODE_ENV=production
   ```

2. **Hacer push de los cambios:**
   ```bash
   cd frontend
   git add .
   git commit -m "feat: configuración de producción para Vercel"
   git push origin main
   ```

3. **En Vercel Dashboard:**
   - El deploy se iniciará automáticamente
   - Revisar build logs por posibles errores de TypeScript/ESLint
   - Si hay errores, corregirlos antes de continuar

## ⚠️ IMPORTANTE ANTES DE DESPLEGAR

### Verificaciones Locales

1. **Backend:**
   ```bash
   cd backend
   # Probar configuración de producción localmente
   export FLASK_ENV=production
   export FLASK_DEBUG=False
   python app.py
   ```

2. **Frontend:**
   ```bash
   cd frontend
   # Verificar que el build pasa sin errores
   npm run build
   ```

### Posibles Errores y Soluciones

1. **Error de TypeScript en Frontend:**
   - Si hay errores de tipos, corregirlos antes del deploy
   - Temporalmente puedes volver a `ignoreBuildErrors: true` si es urgente

2. **Error de CORS:**
   - Verificar que la URL de Render está correcta en las variables de Vercel
   - Asegurarse que el backend está corriendo antes de probar el frontend

3. **Error de Base de Datos:**
   - Verificar credenciales MySQL en Render
   - Asegurar que la IP de Render está en whitelist de MySQL

## 🔐 SEGURIDAD POST-DEPLOY

1. **Generar SECRET_KEY segura:**
   ```bash
   openssl rand -hex 32
   ```

2. **Verificar headers de seguridad:**
   - Usar https://securityheaders.com con tu dominio
   - Deberías obtener al menos calificación B

3. **Monitorear logs:**
   - Revisar logs en Render por errores 500
   - Revisar Analytics en Vercel por errores del cliente

## 📊 VERIFICACIÓN FINAL

### Backend:
- [ ] `/health` endpoint responde correctamente
- [ ] `/api/v1/productos/` devuelve productos
- [ ] No hay errores en logs de Render
- [ ] Tiempo de respuesta < 500ms

### Frontend:
- [ ] Página carga sin errores de consola
- [ ] Productos se muestran correctamente
- [ ] Navegación funciona sin problemas
- [ ] No hay errores 404 de API

## 🚀 URLs DE PRODUCCIÓN

- **Frontend**: https://web-ats.vercel.app
- **Backend API**: https://web-ats-backend.onrender.com
- **Dominio Custom**: https://www.atusaludlicoreria.com (configurar DNS)

## 📞 SOPORTE

Si encuentras problemas:
1. Revisar logs en Render/Vercel
2. Verificar variables de entorno
3. Probar endpoints manualmente con curl/Postman
4. Revisar configuración de CORS si hay errores de acceso