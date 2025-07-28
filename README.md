# 🍷 Web ATS - Licorería Digital

Sistema completo de licorería digital con backend optimizado en Flask y frontend moderno en Next.js.

## 🚀 Características Principales

### Backend (Flask + MySQL)
- **API RESTful optimizada** con endpoints dinámicos
- **Conexión MySQL** con índices optimizados para búsquedas rápidas
- **Sistema de caché** para mejorar performance
- **Endpoints dinámicos** con filtros por categoría, subcategoría, tamaño, etc.
- **Paginación** con `limit` y `offset`
- **Performance monitoring** en tiempo real

### Frontend (Next.js + TypeScript)
- **Interfaz moderna** con Tailwind CSS
- **Carga secuencial optimizada** (categorías primero, luego contenido secundario)
- **Integración real-time** con backend API
- **Skeleton loading** para mejor UX
- **Responsive design** para móviles
- **Caché local** para categorías

## 📊 Performance Metrics

### Backend
- **Categorías**: ~0.3ms (con caché)
- **Productos por filtro**: ~8-30ms
- **Estadísticas**: ~5ms
- **Cache hit rate**: >90%

### Frontend
- **Tiempo hasta primer contenido**: ~10ms
- **Carga completa**: ~90ms
- **Carga secuencial optimizada**: Categorías → Contenido secundario

## 🛠️ Tecnologías

### Backend
- **Python 3.9+**
- **Flask 2.3.3**
- **MySQL 8.0**
- **Flask-CORS**
- **Flask-Caching**

### Frontend
- **Next.js 13.5.1**
- **TypeScript**
- **Tailwind CSS**
- **Radix UI / shadcn/ui**
- **React Hooks**

## 🚀 Instalación

### Prerrequisitos
- Python 3.9+
- Node.js 18+
- MySQL 8.0+

### Backend
```bash
# Clonar repositorio
git clone https://github.com/gfxjef/web_ats.git
cd web_ats

# Configurar entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Instalar dependencias
cd backend
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales de MySQL

# Ejecutar backend
python app.py
```

### Frontend
```bash
# Instalar dependencias
cd frontend
npm install

# Ejecutar en desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
web_ats/
├── backend/
│   ├── api/v1/endpoints/
│   │   └── productos.py          # Endpoints dinámicos
│   ├── services/
│   │   └── producto_service.py   # Lógica de negocio
│   ├── utils/
│   │   └── database.py           # Gestión de DB
│   ├── config.py                 # Configuración
│   ├── app.py                    # Aplicación principal
│   └── requirements.txt          # Dependencias Python
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Página principal
│   │   └── product/[id]/page.tsx # Detalle de producto
│   ├── components/
│   └── package.json              # Dependencias Node.js
├── docs/
│   ├── API_DOCUMENTATION.md      # Documentación de API
│   ├── DATABASE_OPTIMIZATION.md  # Optimización de DB
│   ├── FRONTEND_INTEGRATION.md   # Integración Frontend
│   └── README.md                 # Documentación principal
└── README.md                     # Este archivo
```

## 🔗 Endpoints Principales

### Categorías
- `GET /api/v1/productos/categorias?limit=10` - Lista de categorías

### Productos por Filtro
- `GET /api/v1/productos/categorias/{valor}?limit=5` - Por categoría
- `GET /api/v1/productos/sub_categorias/{valor}?limit=10&offset=5` - Por subcategoría
- `GET /api/v1/productos/tamaño/{valor}?limit=10` - Por tamaño
- `GET /api/v1/productos/stock/{valor}?limit=10` - Por stock

### Estadísticas
- `GET /api/v1/productos/estadisticas` - Estadísticas generales

## 🎯 Características Destacadas

### Carga Secuencial Optimizada
```typescript
// 1. Cargar categorías primero (prioridad alta)
await loadCategories();

// 2. Cargar contenido secundario en paralelo
await Promise.all([
  loadWhiskies(),
  loadCombos(),
  loadRecommendedProducts()
]);
```

### Endpoints Dinámicos
- Filtros por valor en URL path
- Paginación con `limit` y `offset`
- Performance monitoring integrado
- Cache automático

### Optimización de Base de Datos
- Índices específicos para filtros
- Consultas optimizadas
- Connection pooling
- EXPLAIN plan analysis

## 📈 Métricas de Performance

### Backend (Promedio)
- **Categorías**: 0.3ms
- **Whiskies**: 11ms
- **Combos**: 29ms
- **Recomendados**: 8ms

### Frontend (Carga Secuencial)
- **Tiempo total**: ~90ms
- **Categorías**: ~10ms
- **Contenido secundario**: ~80ms (paralelo)

## 🔧 Configuración

### Variables de Entorno (Backend)
```env
DB_HOST=atusaludlicoreria.com
DB_USER=atusalud_atusalud
DB_PASSWORD=kmachin1
DB_NAME=atusalud_base1
DB_PORT=3306
SECRET_KEY=licoreria_ats_secret_key_2024
FLASK_DEBUG=True
```

### Variables de Entorno (Frontend)
```env
# Desarrollo
NEXT_PUBLIC_API_URL=http://127.0.0.1:5001
NODE_ENV=development

# Producción
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NODE_ENV=production
```

**Nota**: Para cambiar entre desarrollo y producción, solo modifica `NEXT_PUBLIC_API_URL` en el archivo `frontend/.env`

## 🚀 Despliegue

### Backend (Producción)
```bash
# Usar Gunicorn para producción
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

### Frontend (Producción)
```bash
# Build para producción
npm run build

# Servir archivos estáticos
npm start
```

## 📚 Documentación

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Database Optimization](./docs/DATABASE_OPTIMIZATION.md)
- [Frontend Integration](./docs/FRONTEND_INTEGRATION.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**GFXJEF** - [GitHub](https://github.com/gfxjef)

---

⭐ **¡Dale una estrella si te gusta el proyecto!**
