from flask import Blueprint, request, jsonify
import time
from json_database import json_db

# Crear blueprint para productos optimizado con JSON
productos_json_bp = Blueprint('productos_json', __name__)

def create_json_productos_endpoints():
    """Crear endpoints ultra-optimizados usando base de datos JSON"""
    
    @productos_json_bp.route('/', methods=['GET'])
    def get_todos_productos():
        """
        GET /api/v2/productos - Obtener todos los productos (ultra-rápido)
        """
        start_time = time.time()
        
        try:
            # Parámetros de consulta
            limit = request.args.get('limit', type=int)
            offset = request.args.get('offset', 0, type=int)
            categoria = request.args.get('categoria')
            
            # Ejecutar consulta JSON
            if categoria and categoria != '*':
                products = json_db.get_by_categoria(categoria, limit, offset)
                total = json_db.count_by_categoria(categoria)
            else:
                products = json_db.get_all(limit, offset)
                total = json_db.count_total()
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': products,
                'meta': {
                    'total': total,
                    'limit': limit,
                    'offset': offset,
                    'has_more': limit and total > offset + limit,
                    'categoria': categoria
                },
                'performance': {
                    'total_time': total_time,
                    'db_query_time': json_db.stats['last_query_time'],
                    'source': 'json_database',
                    'cache_hit': True,
                    'optimization': 'in_memory_json'
                }
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'performance': {
                    'total_time': time.time() - start_time,
                    'source': 'json_database'
                }
            }), 500
    
    @productos_json_bp.route('/<int:producto_id>', methods=['GET'])
    def get_producto_por_id(producto_id):
        """
        GET /api/v2/productos/123 - Obtener producto por ID (ultra-rápido)
        """
        start_time = time.time()
        
        try:
            product = json_db.get_by_id(producto_id)
            
            if not product:
                return jsonify({
                    'success': False,
                    'error': 'Producto no encontrado',
                    'performance': {
                        'total_time': time.time() - start_time,
                        'source': 'json_database'
                    }
                }), 404
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': product,
                'performance': {
                    'total_time': total_time,
                    'db_query_time': json_db.stats['last_query_time'],
                    'source': 'json_database',
                    'cache_hit': True,
                    'optimization': 'indexed_lookup'
                }
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'performance': {
                    'total_time': time.time() - start_time
                }
            }), 500
    
    @productos_json_bp.route('/categoria/<categoria>', methods=['GET'])
    def get_productos_por_categoria(categoria):
        """
        GET /api/v2/productos/categoria/CERVEZA - Productos por categoría (ultra-rápido)
        """
        start_time = time.time()
        
        try:
            limit = request.args.get('limit', type=int)
            offset = request.args.get('offset', 0, type=int)
            
            products = json_db.get_by_categoria(categoria, limit, offset)
            total = json_db.count_by_categoria(categoria)
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': products,
                'meta': {
                    'categoria': categoria,
                    'total': total,
                    'limit': limit,
                    'offset': offset,
                    'has_more': limit and total > offset + limit
                },
                'performance': {
                    'total_time': total_time,
                    'db_query_time': json_db.stats['last_query_time'],
                    'source': 'json_database',
                    'cache_hit': True,
                    'optimization': 'indexed_category_lookup'
                }
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'performance': {
                    'total_time': time.time() - start_time
                }
            }), 500
    
    @productos_json_bp.route('/subcategoria/<subcategoria>', methods=['GET'])
    def get_productos_por_subcategoria(subcategoria):
        """
        GET /api/v2/productos/subcategoria/Cervezas - Productos por subcategoría
        """
        start_time = time.time()
        
        try:
            limit = request.args.get('limit', type=int)
            offset = request.args.get('offset', 0, type=int)
            
            products = json_db.get_by_sub_categoria(subcategoria, limit, offset)
            total = json_db.count_by_sub_categoria(subcategoria)
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': products,
                'meta': {
                    'subcategoria': subcategoria,
                    'total': total,
                    'limit': limit,
                    'offset': offset,
                    'has_more': limit and total > offset + limit
                },
                'performance': {
                    'total_time': total_time,
                    'db_query_time': json_db.stats['last_query_time'],
                    'source': 'json_database',
                    'cache_hit': True,
                    'optimization': 'indexed_subcategory_lookup'
                }
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'performance': {
                    'total_time': time.time() - start_time
                }
            }), 500
    
    @productos_json_bp.route('/sku/<sku>', methods=['GET'])
    def get_producto_por_sku(sku):
        """
        GET /api/v2/productos/sku/123456 - Producto por SKU (ultra-rápido)
        """
        start_time = time.time()
        
        try:
            product = json_db.get_by_sku(sku)
            
            if not product:
                return jsonify({
                    'success': False,
                    'error': 'Producto no encontrado',
                    'performance': {
                        'total_time': time.time() - start_time,
                        'source': 'json_database'
                    }
                }), 404
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': product,
                'performance': {
                    'total_time': total_time,
                    'db_query_time': json_db.stats['last_query_time'],
                    'source': 'json_database',
                    'cache_hit': True,
                    'optimization': 'indexed_sku_lookup'
                }
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'performance': {
                    'total_time': time.time() - start_time
                }
            }), 500
    
    @productos_json_bp.route('/buscar/<query>', methods=['GET'])
    def buscar_productos(query):
        """
        GET /api/v2/productos/buscar/pilsen - Búsqueda de productos (ultra-rápido)
        """
        start_time = time.time()
        
        try:
            limit = request.args.get('limit', 20, type=int)
            
            products = json_db.search_by_name(query, limit)
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': products,
                'meta': {
                    'query': query,
                    'total': len(products),
                    'limit': limit
                },
                'performance': {
                    'total_time': total_time,
                    'db_query_time': json_db.stats['last_query_time'],
                    'source': 'json_database',
                    'cache_hit': True,
                    'optimization': 'in_memory_text_search'
                }
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'performance': {
                    'total_time': time.time() - start_time
                }
            }), 500
    
    @productos_json_bp.route('/stock/<stock_status>', methods=['GET'])
    def get_productos_por_stock(stock_status):
        """
        GET /api/v2/productos/stock/Con%20Stock - Productos por estado de stock
        """
        start_time = time.time()
        
        try:
            limit = request.args.get('limit', type=int)
            offset = request.args.get('offset', 0, type=int)
            
            products = json_db.get_by_stock(stock_status, limit, offset)
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': products,
                'meta': {
                    'stock_status': stock_status,
                    'total': len(products),
                    'limit': limit,
                    'offset': offset
                },
                'performance': {
                    'total_time': total_time,
                    'db_query_time': json_db.stats['last_query_time'],
                    'source': 'json_database',
                    'cache_hit': True,
                    'optimization': 'indexed_stock_lookup'
                }
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'performance': {
                    'total_time': time.time() - start_time
                }
            }), 500
    
    @productos_json_bp.route('/categorias', methods=['GET'])
    def get_categorias():
        """
        GET /api/v2/productos/categorias - Lista de categorías (ultra-rápido)
        """
        start_time = time.time()
        
        try:
            categories = json_db.get_categories()
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': categories,
                'meta': {
                    'total': len(categories)
                },
                'performance': {
                    'total_time': total_time,
                    'db_query_time': json_db.stats['last_query_time'],
                    'source': 'json_database',
                    'cache_hit': True,
                    'optimization': 'pre_calculated_stats'
                }
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'performance': {
                    'total_time': time.time() - start_time
                }
            }), 500
    
    @productos_json_bp.route('/destacados', methods=['GET'])
    def get_productos_destacados():
        """
        GET /api/v2/productos/destacados - Productos destacados (ultra-rápido)
        """
        start_time = time.time()
        
        try:
            limit = request.args.get('limit', 20, type=int)
            
            products = json_db.get_featured_products(limit)
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': products,
                'meta': {
                    'total': len(products),
                    'type': 'featured',
                    'limit': limit
                },
                'performance': {
                    'total_time': total_time,
                    'db_query_time': json_db.stats['last_query_time'],
                    'source': 'json_database',
                    'cache_hit': True,
                    'optimization': 'random_sampling_from_index'
                }
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'performance': {
                    'total_time': time.time() - start_time
                }
            }), 500
    
    @productos_json_bp.route('/stats', methods=['GET'])
    def get_database_stats():
        """
        GET /api/v2/productos/stats - Estadísticas de la base de datos JSON
        """
        start_time = time.time()
        
        try:
            stats = json_db.get_database_stats()
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': stats,
                'performance': {
                    'total_time': total_time,
                    'source': 'json_database'
                }
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'performance': {
                    'total_time': time.time() - start_time
                }
            }), 500
    
    return productos_json_bp