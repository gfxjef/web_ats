# Documentación de Endpoints de la API

Esta documentación detalla los endpoints disponibles en el backend, incluyendo los datos de entrada y salida esperados.

## Endpoints de Productos

Todos los endpoints de productos se encuentran bajo el prefijo `/api/v1/productos`.

---

### Obtener productos por subcategoría

- **Método:** `GET`
- **Ruta:** `/sub_categorias/<valor>`
- **Descripción:** Obtiene una lista de productos que pertenecen a una subcategoría específica.
- **Parámetros de URL:**
  - `valor` (string, requerido): El nombre de la subcategoría.
- **Parámetros de Query:**
  - `limit` (integer, opcional): Número máximo de productos a devolver.
  - `offset` (integer, opcional): Número de productos a omitir para la paginación.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "nombre": "Producto 1",
        "sku": "SKU001",
        "categoria": "Categoria A",
        "sub_categoria": "Sub A",
        "tamaño": "750ml",
        "stock": "in stock"
      }
    ],
    "meta": {
      "subcategoria": "Sub A",
      "total": 100,
      "limit": 10,
      "offset": 0,
      "has_more": true
    },
    "performance": {
      "total_time": 0.123,
      "db_execution_time": 0.050,
      "cache_hit": false,
      "query_optimization": "index_scan"
    }
  }
  ```
- **Respuesta de Error (500 Internal Server Error):**
  ```json
  {
    "success": false,
    "error": "Descripción del error.",
    "performance": {
      "total_time": 0.010
    }
  }
  ```

---

### Obtener productos por categoría

- **Método:** `GET`
- **Ruta:** `/categorias/<valor>`
- **Descripción:** Obtiene una lista de productos que pertenecen a una categoría específica.
- **Parámetros de URL:**
  - `valor` (string, requerido): El nombre de la categoría.
- **Parámetros de Query:**
  - `limit` (integer, opcional): Número máximo de productos a devolver.
  - `offset` (integer, opcional): Número de productos a omitir para la paginación.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "data": [
        {
            "id": 1,
            "nombre": "Producto 1",
            "sku": "SKU001",
            "categoria": "Categoria A",
            "sub_categoria": "Sub A",
            "tamaño": "750ml",
            "stock": "in stock"
        }
    ],
    "meta": {
        "categoria": "Categoria A",
        "total": 50,
        "limit": 10,
        "offset": 0,
        "has_more": true
    },
    "performance": {
        "total_time": 0.1,
        "db_execution_time": 0.04,
        "cache_hit": true,
        "query_optimization": "index_scan"
    }
  }
  ```

---

### Obtener producto por SKU

- **Método:** `GET`
- **Ruta:** `/sku/<valor>`
- **Descripción:** Obtiene un producto específico por su SKU.
- **Parámetros de URL:**
  - `valor` (string, requerido): El SKU del producto.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "nombre": "Producto 1",
      "sku": "SKU001",
      "categoria": "Categoria A",
      "sub_categoria": "Sub A",
      "tamaño": "750ml",
      "stock": "in stock"
    },
    "performance": {
      "total_time": 0.05,
      "db_execution_time": 0.02,
      "cache_hit": false,
      "query_optimization": "primary_key"
    }
  }
  ```
- **Respuesta de Error (404 Not Found):**
  ```json
  {
    "success": false,
    "error": "Producto no encontrado",
    "performance": {
      "total_time": 0.01
    }
  }
  ```

---

### Obtener productos por estado de stock

- **Método:** `GET`
- **Ruta:** `/stock/<valor>`
- **Descripción:** Obtiene productos según su estado de stock.
- **Parámetros de URL:**
  - `valor` (string, requerido): El estado del stock (ej. "in stock", "out of stock").
- **Parámetros de Query:**
  - `limit` (integer, opcional): Número máximo de productos a devolver.
  - `offset` (integer, opcional): Número de productos a omitir para la paginación.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "data": [
        {
            "id": 1,
            "nombre": "Producto 1",
            "sku": "SKU001",
            "categoria": "Categoria A",
            "sub_categoria": "Sub A",
            "tamaño": "750ml",
            "stock": "in stock"
        }
    ],
    "meta": {
        "stock_status": "in stock",
        "total": 200,
        "limit": 10,
        "offset": 0,
        "has_more": true
    },
    "performance": {
        "total_time": 0.2,
        "db_execution_time": 0.1,
        "cache_hit": false,
        "query_optimization": "index_scan"
    }
  }
  ```

---

### Obtener productos por tamaño

- **Método:** `GET`
- **Ruta:** `/tamaño/<valor>`
- **Descripción:** Obtiene productos de un tamaño específico.
- **Parámetros de URL:**
  - `valor` (string, requerido): El tamaño del producto (ej. "750ml").
- **Parámetros de Query:**
  - `limit` (integer, opcional): Número máximo de productos a devolver.
  - `offset` (integer, opcional): Número de productos a omitir para la paginación.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "data": [
        {
            "id": 1,
            "nombre": "Producto 1",
            "sku": "SKU001",
            "categoria": "Categoria A",
            "sub_categoria": "Sub A",
            "tamaño": "750ml",
            "stock": "in stock"
        }
    ],
    "meta": {
        "tamaño": "750ml",
        "total": 30,
        "limit": 10,
        "offset": 0,
        "has_more": true
    },
    "performance": {
        "total_time": 0.08,
        "db_execution_time": 0.03,
        "cache_hit": true,
        "query_optimization": "index_scan"
    }
  }
  ```

---

### Obtener producto por ID

- **Método:** `GET`
- **Ruta:** `/<producto_id>`
- **Descripción:** Obtiene un producto específico por su ID.
- **Parámetros de URL:**
  - `producto_id` (integer, requerido): El ID del producto.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "nombre": "Producto 1",
      "sku": "SKU001",
      "categoria": "Categoria A",
      "sub_categoria": "Sub A",
      "tamaño": "750ml",
      "stock": "in stock"
    },
    "performance": {
      "total_time": 0.04,
      "db_execution_time": 0.01,
      "cache_hit": true,
      "query_optimization": "primary_key"
    }
  }
  ```
- **Respuesta de Error (404 Not Found):**
  ```json
  {
    "success": false,
    "error": "Producto no encontrado",
    "performance": {
      "total_time": 0.01
    }
  }
  ```

---

### Obtener estadísticas de productos

- **Método:** `GET`
- **Ruta:** `/estadisticas`
- **Descripción:** Obtiene estadísticas generales sobre los productos.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "total_productos": 500,
      "productos_en_stock": 450,
      "categorias_unicas": 15
    },
    "performance": {
      "total_time": 0.3,
      "db_execution_time": 0.2,
      "cache_hit": false
    }
  }
  ```

---

### Obtener productos de tipo "Combos"

- **Método:** `GET`
- **Ruta:** `/combos`
- **Descripción:** Endpoint optimizado para obtener productos de la subcategoría "Combos".
- **Parámetros de Query:**
  - `limit` (integer, opcional): Número máximo de productos a devolver.
  - `offset` (integer, opcional): Número de productos a omitir para la paginación.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "data": [
        {
            "id": 10,
            "nombre": "Combo Fiesta",
            "sku": "SKU010",
            "categoria": "Promociones",
            "sub_categoria": "Combos",
            "tamaño": "N/A",
            "stock": "in stock"
        }
    ],
    "meta": {
        "subcategoria": "Combos",
        "total": 20,
        "limit": 10,
        "offset": 0,
        "has_more": true
    },
    "performance": {
        "total_time": 0.15,
        "db_execution_time": 0.07,
        "cache_hit": false,
        "query_optimization": "index_scan"
    }
  }
  ```

---

### Obtener lista de categorías

- **Método:** `GET`
- **Ruta:** `/categorias`
- **Descripción:** Obtiene una lista de todas las categorías de productos únicas.
- **Parámetros de Query:**
  - `limit` (integer, opcional, por defecto 10): Número máximo de categorías a devolver.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      "Categoria A",
      "Categoria B",
      "Promociones"
    ],
    "meta": {
      "total": 3,
      "limit": 10
    },
    "performance": {
      "total_time": 0.09,
      "db_execution_time": 0.04,
      "cache_hit": true,
      "query_optimization": "index_scan"
    }
  }
  ```