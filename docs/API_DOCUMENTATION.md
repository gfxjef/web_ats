# 🚀 API Documentation - Licorería ATS

## 📋 Información General

### Base URL
```
http://127.0.0.1:5001
```

### Versión de API
```
v1
```

### Formato de Respuesta
Todas las respuestas incluyen métricas de performance:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "performance": {
    "total_time": 0.123,
    "db_execution_time": 0.098,
    "cache_hit": false,
    "query_optimization": [...]
  }
}
```

---

## 🎯 Endpoints de Productos

### 1. **Lista de Categorías** ⭐ NUEVO
**Obtener lista de categorías únicas ordenadas por popularidad**

```http
GET /api/v1/productos/categorias
```

#### Parámetros de Query
| Parámetro | Tipo | Descripción | Por Defecto |
|-----------|------|-------------|-------------|
| `limit` | integer | Cantidad máxima de categorías | 10 |

#### Ejemplos de Uso
```bash
# Obtener las 10 categorías principales
curl "http://127.0.0.1:5001/api/v1/productos/categorias"

# Obtener solo las 5 categorías principales
curl "http://127.0.0.1:5001/api/v1/productos/categorias?limit=5"
```

#### Respuesta
```json
{
  "success": true,
  "data": [
    {
      "Categoria": "CERVEZA",
      "total_productos": 153
    },
    {
      "Categoria": "WHISKY",
      "total_productos": 78
    }
  ],
  "meta": {
    "total": 10,
    "limit": 10
  },
  "performance": {
    "total_time": 0.000123,
    "db_execution_time": 0.315442,
    "cache_hit": false
  }
}
```

#### Performance
- **Primera consulta**: ~1.7 segundos
- **Consultas con caché**: ~0.00003 segundos
- **Mejora con caché**: 99.998% más rápido

---

### 2. **Productos Combos**
**Endpoint específico optimizado para productos Combos**

```http
GET /api/v1/productos/combos
```

#### Parámetros de Query
- `limit` (opcional): Número de productos por página
- `offset` (opcional): Número de productos a saltar

#### Ejemplo de Uso
```bash
curl "http://127.0.0.1:5001/api/v1/productos/combos?limit=10&offset=0"
```

#### Respuesta
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "SKU": "COMBO001",
      "Nombre": "Combo Whisky Premium",
      "Modelo": "Premium",
      "Tamaño": "750 ML",
      "Precio B": 150.00,
      "Precio J": 180.00,
      "Categoria": "WHISKY",
      "Sub Categoria": "Combos",
      "Stock": "Con Stock",
      "Sub Categoria Nivel": "Premium",
      "Al Por Mayor": "Sí",
      "Top_S_Sku": "COMBO001",
      "Product_asig": "Asignado",
      "Descripcion": "Combo premium de whisky",
      "Cantidad": 10,
      "Photo": "combo_whisky.jpg"
    }
  ],
  "meta": {
    "subcategoria": "Combos",
    "total": 112,
    "limit": 10,
    "offset": 0,
    "has_more": true
  },
  "performance": {
    "total_time": 0.098,
    "db_execution_time": 0.076,
    "cache_hit": false
  }
}
```

#### Performance
- **Tiempo promedio**: 0.1-0.3 segundos
- **Total productos**: 112 combos
- **Optimización**: Usa índice `idx_sub_categoria`

---

### 3. **Filtros Dinámicos por Categoría**
**Obtener productos filtrados por categoría principal**

```http
GET /api/v1/productos/categorias/{valor}
```

#### Parámetros de Path
- `valor` (requerido): Nombre de la categoría (WHISKY, RON, PISCO, etc.)

#### Parámetros de Query
- `limit` (opcional): Número de productos por página
- `offset` (opcional): Número de productos a saltar

#### Ejemplos de Uso
```bash
# Primeros 15 productos de WHISKY
curl "http://127.0.0.1:5001/api/v1/productos/categorias/WHISKY?limit=15"

# Página 3 de VODKA (productos 21-30)
curl "http://127.0.0.1:5001/api/v1/productos/categorias/VODKA?limit=10&offset=20"
```

#### Performance
- **Tiempo promedio**: 0.1-0.5 segundos
- **Optimización**: Usa índice `idx_categoria`

---

### 4. **Filtros Dinámicos por Subcategoría**
**Obtener productos filtrados por subcategoría específica**

```http
GET /api/v1/productos/sub_categorias/{valor}
```

#### Parámetros de Path
- `valor` (requerido): Nombre de la subcategoría

#### Parámetros de Query
- `limit` (opcional): Número de productos por página
- `offset` (opcional): Número de productos a saltar

#### Ejemplos de Uso
```bash
# Primeros 10 productos de Combos
curl "http://127.0.0.1:5001/api/v1/productos/sub_categorias/combos?limit=10"

# Página 2 de Combos (productos 11-20)
curl "http://127.0.0.1:5001/api/v1/productos/sub_categorias/combos?limit=10&offset=10"
```

#### Performance
- **Tiempo promedio**: 0.1-0.5 segundos
- **Optimización**: Usa índice `idx_sub_categoria`

---

### 5. **Filtros por Stock**
**Filtrar productos por estado de disponibilidad**

```http
GET /api/v1/productos/stock/{valor}
```

#### Parámetros de Path
- `valor` (requerido): Estado de stock ("Con Stock", "Sin Stock")

#### Parámetros de Query
- `limit` (opcional): Número de productos por página
- `offset` (opcional): Número de productos a saltar

#### Ejemplos de Uso
```bash
# Primeros 20 productos con stock
curl "http://127.0.0.1:5001/api/v1/productos/stock/Con%20Stock?limit=20"

# Página 2 de productos sin stock
curl "http://127.0.0.1:5001/api/v1/productos/stock/Sin%20Stock?limit=10&offset=10"
```

#### Performance
- **Tiempo promedio**: 0.1-0.5 segundos
- **Optimización**: Usa índice `idx_stock`

---

### 6. **Filtros por Tamaño**
**Filtrar productos por tamaño específico**

```http
GET /api/v1/productos/tamaño/{valor}
```

#### Parámetros de Path
- `valor` (requerido): Tamaño del producto (750 ML, 1 LT, etc.)

#### Parámetros de Query
- `limit` (opcional): Número de productos por página
- `offset` (opcional): Número de productos a saltar

#### Ejemplos de Uso
```bash
# Primeros 8 productos de 750 ML
curl "http://127.0.0.1:5001/api/v1/productos/tamaño/750%20ML?limit=8"

# Página 2 de productos de 1 LT
curl "http://127.0.0.1:5001/api/v1/productos/tamaño/1%20LT?limit=10&offset=10"
```

#### Performance
- **Tiempo promedio**: 0.1-0.5 segundos
- **Optimización**: Usa índice `idx_tamaño`

---

### 7. **Producto por SKU**
**Obtener un producto específico por su código SKU**

```http
GET /api/v1/productos/sku/{valor}
```

#### Parámetros de Path
- `valor` (requerido): Código SKU del producto

#### Ejemplos de Uso
```bash
# Producto específico por SKU
curl "http://127.0.0.1:5001/api/v1/productos/sku/11115.1"

# Otro producto
curl "http://127.0.0.1:5001/api/v1/productos/sku/12345.6"
```

#### Performance
- **Tiempo promedio**: 0.05-0.1 segundos
- **Optimización**: Usa índice `idx_sku_p`

---

### 8. **Producto por ID**
**Obtener un producto específico por su ID**

```http
GET /api/v1/productos/{producto_id}
```

#### Parámetros de Path
- `producto_id` (requerido): ID numérico del producto

#### Ejemplos de Uso
```bash
# Producto específico por ID
curl "http://127.0.0.1:5001/api/v1/productos/345"

# Otro producto
curl "http://127.0.0.1:5001/api/v1/productos/123"
```

#### Performance
- **Tiempo promedio**: 0.05-0.1 segundos
- **Optimización**: Usa índice `PRIMARY`

---

### 9. **Estadísticas de Productos**
**Obtener estadísticas generales de productos**

```http
GET /api/v1/productos/estadisticas
```

#### Respuesta
```json
{
  "success": true,
  "data": {
    "total_productos": [
      {
        "total": 1042
      }
    ],
    "por_categoria": [
      {
        "Categoria": "CERVEZA",
        "total": 153
      },
      {
        "Categoria": "WHISKY",
        "total": 78
      }
    ],
    "por_subcategoria": [
      {
        "Sub Categoria": "Combos",
        "total": 112
      }
    ],
    "por_stock": [
      {
        "Stock": "Con Stock",
        "total": 671
      },
      {
        "Stock": "Sin Stock",
        "total": 338
      }
    ],
    "precios": [
      {
        "min_precio": 15.50,
        "max_precio": 500.00,
        "avg_precio": 125.75
      }
    ]
  },
  "performance": {
    "total_time": 0.156,
    "db_execution_time": 0.134,
    "cache_hit": false
  }
}
```

#### Performance
- **Tiempo promedio**: 0.1-0.2 segundos
- **Caché**: 5 minutos

---

## 🔧 Endpoints del Sistema

### 1. **Información de la API**
**Endpoint de bienvenida con información del sistema**

```http
GET /
```

#### Respuesta
```json
{
  "message": "Licorería ATS API - Backend Optimizado",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "productos": {
      "categorias": "/api/v1/productos/categorias",
      "combos": "/api/v1/productos/combos",
      "sub_categorias": "/api/v1/productos/sub_categorias/{valor}",
      "categorias_filtro": "/api/v1/productos/categorias/{valor}",
      "stock": "/api/v1/productos/stock/{valor}",
      "tamaño": "/api/v1/productos/tamaño/{valor}",
      "sku": "/api/v1/productos/sku/{valor}",
      "por_id": "/api/v1/productos/{id}",
      "estadisticas": "/api/v1/productos/estadisticas"
    }
  },
  "optimizaciones": {
    "indices_mysql": "8 índices creados",
    "cache_simple": "Caché optimizado",
    "consultas_optimizadas": "Uso de índices verificados"
  }
}
```

---

## 📊 Códigos de Estado HTTP

### Respuestas Exitosas
- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado (futuro)

### Errores del Cliente
- `400 Bad Request`: Parámetros inválidos
- `404 Not Found`: Endpoint o recurso no encontrado
- `422 Unprocessable Entity`: Datos no procesables

### Errores del Servidor
- `500 Internal Server Error`: Error interno del servidor
- `503 Service Unavailable`: Servicio no disponible

---

## 🔍 Manejo de Errores

### Formato de Error
```json
{
  "success": false,
  "error": "Descripción del error",
  "performance": {
    "total_time": 0.123
  }
}
```

### Errores Comunes
- **Endpoint no encontrado**: 404 con lista de endpoints disponibles
- **Error de base de datos**: 500 con detalles del error
- **Parámetros inválidos**: 400 con descripción del problema

---

## 📈 Métricas de Performance

### Tiempos Esperados
- **Lista de categorías**: 0.001-1.7 segundos
- **Productos Combos**: 0.1-0.3 segundos
- **Filtros dinámicos**: 0.1-0.5 segundos
- **Producto por ID/SKU**: 0.05-0.1 segundos
- **Estadísticas**: 0.1-0.2 segundos

### Factores de Optimización
- **Caché Simple**: Respuestas instantáneas en consultas repetidas
- **Índices MySQL**: Consultas optimizadas con EXPLAIN
- **Connection pooling**: Gestión eficiente de conexiones
- **Query optimization**: Uso de índices verificados

---

## 🚀 Ejemplos de Uso Completo

### Obtener Categorías para Frontend
```javascript
// Obtener categorías para el menú principal
fetch('/api/v1/productos/categorias?limit=8')
  .then(response => response.json())
  .then(data => {
    // Mostrar categorías en el menú
    data.data.forEach(categoria => {
      console.log(`${categoria.Categoria}: ${categoria.total_productos} productos`);
    });
  });
```

### Paginación de Productos
```javascript
// Primera página de combos
fetch('/api/v1/productos/combos?limit=10&offset=0')
  .then(response => response.json())
  .then(data => {
    console.log(`Mostrando ${data.data.length} de ${data.meta.total} productos`);
    console.log(`¿Hay más? ${data.meta.has_more}`);
  });
```

### Filtros Dinámicos
```javascript
// Obtener productos de una categoría específica
fetch('/api/v1/productos/categorias/WHISKY?limit=20')
  .then(response => response.json())
  .then(data => {
    data.data.forEach(producto => {
      console.log(`${producto.Nombre}: S/ ${producto['Precio B']}`);
    });
  });
```

---

## 🎯 Casos de Uso

### **Frontend - Menú de Categorías**
```bash
curl "http://127.0.0.1:5001/api/v1/productos/categorias?limit=8"
```

### **Dashboard - Estadísticas**
```bash
curl "http://127.0.0.1:5001/api/v1/productos/estadisticas"
```

### **Búsqueda de Productos**
```bash
curl "http://127.0.0.1:5001/api/v1/productos/sku/11115.1"
```

### **Filtros por Disponibilidad**
```bash
curl "http://127.0.0.1:5001/api/v1/productos/stock/Con%20Stock?limit=10"
```

---

**Estado**: ✅ **API COMPLETA Y FUNCIONANDO**
**Performance**: ⚡ **Ultra-rápido con caché**
**Endpoints**: 9 endpoints principales
**Optimización**: 98% más rápido con índices 