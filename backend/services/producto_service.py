import time
from flask import current_app
from utils.database import db_manager
from flask_caching import Cache

class ProductoService:
    """Servicio optimizado para operaciones con productos"""
    
    def __init__(self, cache: Cache):
        self.cache = cache
    
    def get_productos_por_subcategoria(self, subcategoria, limit=None, offset=0):
        """
        Obtener productos por subcategoría usando índice optimizado
        """
        cache_key = f"productos_subcategoria_{subcategoria}_{limit}_{offset}"
        
        # Intentar obtener del caché
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Consulta optimizada usando el índice idx_sub_categoria
        query = """
        SELECT 
            id, SKU, Nombre, Modelo, Tamaño, `Precio B`, `Precio J`,
            Categoria, `Sub Categoria`, Stock, `Sub Categoria Nivel`,
            `Al Por Mayor`, Top_S_Sku, Product_asig, Descripcion,
            Cantidad, Photo
        FROM productos 
        WHERE `Sub Categoria` = %s
        ORDER BY Nombre
        """
        
        params = [subcategoria]
        
        if limit:
            query += f" LIMIT {limit}"
            if offset:
                query += f" OFFSET {offset}"
        
        # Ejecutar consulta
        result = db_manager.execute_query(query, params)
        
        # Verificar optimización
        explain_result = db_manager.execute_explain(query, params)
        
        response = {
            'productos': result['data'],
            'total': len(result['data']),
            'subcategoria': subcategoria,
            'performance': {
                'execution_time': result['execution_time'],
                'query_optimization': explain_result['data']
            },
            'cache': {
                'hit': False,
                'key': cache_key
            }
        }
        
        # Guardar en caché por 10 minutos
        self.cache.set(cache_key, response, timeout=600)
        
        return response
    
    def get_productos_por_categoria(self, categoria, limit=None, offset=0):
        """
        Obtener productos por categoría usando índice optimizado
        """
        cache_key = f"productos_categoria_{categoria}_{limit}_{offset}"
        
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Consulta optimizada usando el índice idx_categoria
        query = """
        SELECT 
            id, SKU, Nombre, Modelo, Tamaño, `Precio B`, `Precio J`,
            Categoria, `Sub Categoria`, Stock, `Sub Categoria Nivel`,
            `Al Por Mayor`, Top_S_Sku, Product_asig, Descripcion,
            Cantidad, Photo
        FROM productos 
        WHERE Categoria = %s
        ORDER BY Nombre
        """
        
        params = [categoria]
        
        if limit:
            query += f" LIMIT {limit}"
            if offset:
                query += f" OFFSET {offset}"
        
        result = db_manager.execute_query(query, params)
        explain_result = db_manager.execute_explain(query, params)
        
        response = {
            'productos': result['data'],
            'total': len(result['data']),
            'categoria': categoria,
            'performance': {
                'execution_time': result['execution_time'],
                'query_optimization': explain_result['data']
            },
            'cache': {
                'hit': False,
                'key': cache_key
            }
        }
        
        self.cache.set(cache_key, response, timeout=600)
        return response
    
    def buscar_productos(self, query, limit=None, offset=0):
        """
        Búsqueda optimizada por nombre o SKU
        """
        cache_key = f"busqueda_{query}_{limit}_{offset}"
        
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Búsqueda usando índices de nombre y SKU
        search_query = """
        SELECT 
            id, SKU, Nombre, Modelo, Tamaño, `Precio B`, `Precio J`,
            Categoria, `Sub Categoria`, Stock, `Sub Categoria Nivel`,
            `Al Por Mayor`, Top_S_Sku, Product_asig, Descripcion,
            Cantidad, Photo
        FROM productos 
        WHERE Nombre LIKE %s OR SKU LIKE %s
        ORDER BY 
            CASE 
                WHEN Nombre LIKE %s THEN 1
                WHEN SKU LIKE %s THEN 2
                ELSE 3
            END,
            Nombre
        """
        
        search_param = f"%{query}%"
        exact_param = f"{query}%"
        params = [search_param, search_param, exact_param, exact_param]
        
        if limit:
            search_query += f" LIMIT {limit}"
            if offset:
                search_query += f" OFFSET {offset}"
        
        result = db_manager.execute_query(search_query, params)
        explain_result = db_manager.execute_explain(search_query, params)
        
        response = {
            'productos': result['data'],
            'total': len(result['data']),
            'query': query,
            'performance': {
                'execution_time': result['execution_time'],
                'query_optimization': explain_result['data']
            },
            'cache': {
                'hit': False,
                'key': cache_key
            }
        }
        
        self.cache.set(cache_key, response, timeout=300)  # 5 minutos para búsquedas
        return response
    
    def get_productos_por_stock(self, stock_status, limit=None, offset=0):
        """
        Obtener productos por estado de stock usando índice optimizado
        """
        cache_key = f"productos_stock_{stock_status}_{limit}_{offset}"
        
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Consulta optimizada usando el índice idx_stock
        query = """
        SELECT 
            id, SKU, Nombre, Modelo, Tamaño, `Precio B`, `Precio J`,
            Categoria, `Sub Categoria`, Stock, `Sub Categoria Nivel`,
            `Al Por Mayor`, Top_S_Sku, Product_asig, Descripcion,
            Cantidad, Photo
        FROM productos 
        WHERE Stock = %s
        ORDER BY Nombre
        """
        
        params = [stock_status]
        
        if limit:
            query += f" LIMIT {limit}"
            if offset:
                query += f" OFFSET {offset}"
        
        result = db_manager.execute_query(query, params)
        explain_result = db_manager.execute_explain(query, params)
        
        response = {
            'productos': result['data'],
            'total': len(result['data']),
            'stock_status': stock_status,
            'performance': {
                'execution_time': result['execution_time'],
                'query_optimization': explain_result['data']
            },
            'cache': {
                'hit': False,
                'key': cache_key
            }
        }
        
        self.cache.set(cache_key, response, timeout=600)
        return response
    
    def get_productos_por_tamano(self, tamano, limit=None, offset=0):
        """
        Obtener productos por tamaño usando índice optimizado
        """
        cache_key = f"productos_tamano_{tamano}_{limit}_{offset}"
        
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Consulta optimizada usando el índice idx_tamano
        query = """
        SELECT 
            id, SKU, Nombre, Modelo, Tamaño, `Precio B`, `Precio J`,
            Categoria, `Sub Categoria`, Stock, `Sub Categoria Nivel`,
            `Al Por Mayor`, Top_S_Sku, Product_asig, Descripcion,
            Cantidad, Photo
        FROM productos 
        WHERE Tamaño = %s
        ORDER BY Nombre
        """
        
        params = [tamano]
        
        if limit:
            query += f" LIMIT {limit}"
            if offset:
                query += f" OFFSET {offset}"
        
        result = db_manager.execute_query(query, params)
        explain_result = db_manager.execute_explain(query, params)
        
        response = {
            'productos': result['data'],
            'total': len(result['data']),
            'tamano': tamano,
            'performance': {
                'execution_time': result['execution_time'],
                'query_optimization': explain_result['data']
            },
            'cache': {
                'hit': False,
                'key': cache_key
            }
        }
        
        self.cache.set(cache_key, response, timeout=600)
        return response
    
    def get_producto_por_sku(self, sku):
        """
        Obtener producto específico por SKU usando índice PRIMARY
        """
        cache_key = f"producto_sku_{sku}"
        
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        query = """
        SELECT 
            id, SKU, Nombre, Modelo, Tamaño, `Precio B`, `Precio J`,
            Categoria, `Sub Categoria`, Stock, `Sub Categoria Nivel`,
            `Al Por Mayor`, Top_S_Sku, Product_asig, Descripcion,
            Cantidad, Photo
        FROM productos 
        WHERE SKU = %s
        """
        
        result = db_manager.execute_query(query, [sku], fetch_all=False)
        explain_result = db_manager.execute_explain(query, [sku])
        
        response = {
            'producto': result['data'],
            'performance': {
                'execution_time': result['execution_time'],
                'query_optimization': explain_result['data']
            },
            'cache': {
                'hit': False,
                'key': cache_key
            }
        }
        
        self.cache.set(cache_key, response, timeout=1800)  # 30 minutos para productos individuales
        return response

    def get_producto_por_id(self, producto_id):
        """
        Obtener producto específico por ID (usando índice PRIMARY)
        """
        cache_key = f"producto_id_{producto_id}"
        
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        query = """
        SELECT 
            id, SKU, Nombre, Modelo, Tamaño, `Precio B`, `Precio J`,
            Categoria, `Sub Categoria`, Stock, `Sub Categoria Nivel`,
            `Al Por Mayor`, Top_S_Sku, Product_asig, Descripcion,
            Cantidad, Photo
        FROM productos 
        WHERE id = %s
        """
        
        result = db_manager.execute_query(query, [producto_id], fetch_all=False)
        explain_result = db_manager.execute_explain(query, [producto_id])
        
        response = {
            'producto': result['data'],
            'performance': {
                'execution_time': result['execution_time'],
                'query_optimization': explain_result['data']
            },
            'cache': {
                'hit': False,
                'key': cache_key
            }
        }
        
        self.cache.set(cache_key, response, timeout=1800)  # 30 minutos para productos individuales
        return response
    
    def get_estadisticas_productos(self):
        """
        Obtener estadísticas generales de productos
        """
        cache_key = "estadisticas_productos"
        
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Consultas optimizadas para estadísticas
        queries = {
            'total_productos': "SELECT COUNT(*) as total FROM productos",
            'por_categoria': "SELECT Categoria, COUNT(*) as total FROM productos GROUP BY Categoria",
            'por_subcategoria': "SELECT `Sub Categoria`, COUNT(*) as total FROM productos GROUP BY `Sub Categoria`",
            'por_stock': "SELECT Stock, COUNT(*) as total FROM productos GROUP BY Stock",
            'precios': "SELECT MIN(`Precio B`) as min_precio, MAX(`Precio B`) as max_precio, AVG(`Precio B`) as avg_precio FROM productos WHERE `Precio B` IS NOT NULL"
        }
        
        results = {}
        total_time = 0
        
        for key, query in queries.items():
            result = db_manager.execute_query(query)
            results[key] = result['data']
            total_time += result['execution_time']
        
        response = {
            'estadisticas': results,
            'performance': {
                'execution_time': total_time
            },
            'cache': {
                'hit': False,
                'key': cache_key
            }
        }
        
        self.cache.set(cache_key, response, timeout=300)  # 5 minutos
        return response
    
    def get_categorias(self, limit=10):
        """
        Obtener lista de categorías únicas (limitado a 10 por defecto)
        """
        cache_key = f"categorias_lista_{limit}"
        
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Consulta optimizada para obtener categorías únicas
        query = """
        SELECT DISTINCT Categoria, COUNT(*) as total_productos
        FROM productos 
        WHERE Categoria IS NOT NULL AND Categoria != ''
        GROUP BY Categoria
        ORDER BY total_productos DESC
        LIMIT %s
        """
        
        result = db_manager.execute_query(query, [limit])
        explain_result = db_manager.execute_explain(query, [limit])
        
        response = {
            'categorias': result['data'],
            'total': len(result['data']),
            'limit': limit,
            'performance': {
                'execution_time': result['execution_time'],
                'query_optimization': explain_result['data']
            },
            'cache': {
                'hit': False,
                'key': cache_key
            }
        }
        
        # Guardar en caché por 30 minutos (las categorías no cambian frecuentemente)
        self.cache.set(cache_key, response, timeout=1800)
        
        return response 