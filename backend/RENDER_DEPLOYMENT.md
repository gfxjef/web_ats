# Despliegue en Render - Backend Web ATS

## Configuración Actualizada

### Archivos de Configuración

1. **Procfile**: Configuración de Gunicorn optimizada
2. **gunicorn.conf.py**: Configuración detallada de Gunicorn
3. **render.yaml**: Configuración de Render (opcional)
4. **start.py**: Script de inicio alternativo

### Variables de Entorno Requeridas

Configura estas variables en Render:

```bash
# Base de Datos
DB_HOST=tu_host_mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_de_datos
DB_PORT=3306

# Flask
SECRET_KEY=tu_clave_secreta_muy_segura
FLASK_ENV=production
FLASK_DEBUG=false

# Redis (opcional)
REDIS_HOST=tu_host_redis
REDIS_PORT=6379
REDIS_DB=0
```

### Comandos de Inicio

**Opción 1 (Recomendada):**
```bash
gunicorn wsgi:app -c gunicorn.conf.py
```

**Opción 2:**
```bash
python start.py
```

**Opción 3:**
```bash
python wsgi.py
```

### Solución de Problemas

#### Error: Worker Timeout
- ✅ Configurado timeout de 300 segundos
- ✅ Un solo worker para evitar conflictos
- ✅ Preload habilitado

#### Error: Variables de Entorno
- ✅ Valores por defecto configurados
- ✅ Manejo de errores mejorado
- ✅ Logs detallados

#### Error: Conexión a Base de Datos
- ✅ Validación de configuración
- ✅ Fallback a valores por defecto
- ✅ Health check endpoint

### Endpoints Disponibles

- `/` - Información de la API
- `/health` - Health check
- `/performance` - Información de rendimiento
- `/api/v1/productos/*` - Endpoints de productos

### Monitoreo

El endpoint `/health` proporciona información sobre:
- Estado de la base de datos
- Tiempo de respuesta
- Disponibilidad del caché
- Performance general

### Logs

Los logs incluyen:
- Inicialización de workers
- Errores detallados
- Métricas de performance
- Estado de la aplicación 