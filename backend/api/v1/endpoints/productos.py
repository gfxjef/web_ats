from flask import Blueprint, request, jsonify
from services.producto_service import ProductoService
from flask_caching import Cache
import time

# Crear blueprint para productos
productos_bp = Blueprint('productos', __name__)

def create_productos_endpoints(cache: Cache):
    """Crear endpoints optimizados para productos"""
    
    producto_service = ProductoService(cache)
    
    @productos_bp.route('/sub_categorias/<valor>', methods=['GET'])
    def get_productos_por_sub_categoria(valor):
        """
        Obtener productos por subcategoría usando índice optimizado
        """
        start_time = time.time()
        
        # Parámetros de paginación
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', 0, type=int)
        
        try:
            result = producto_service.get_productos_por_subcategoria(
                valor, limit, offset
            )
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': result['productos'],
                'meta': {
                    'subcategoria': valor,
                    'total': result['total'],
                    'limit': limit,
                    'offset': offset,
                    'has_more': limit and result['total'] > offset + limit
                },
                'performance': {
                    'total_time': total_time,
                    'db_execution_time': result['performance']['execution_time'],
                    'cache_hit': result['cache']['hit'],
                    'query_optimization': result['performance']['query_optimization']
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
    
    @productos_bp.route('/categorias/<valor>', methods=['GET'])
    def get_productos_por_categoria(valor):
        """
        Obtener productos por categoría usando índice optimizado
        """
        start_time = time.time()
        
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', 0, type=int)
        
        try:
            result = producto_service.get_productos_por_categoria(
                valor, limit, offset
            )
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': result['productos'],
                'meta': {
                    'categoria': valor,
                    'total': result['total'],
                    'limit': limit,
                    'offset': offset,
                    'has_more': limit and result['total'] > offset + limit
                },
                'performance': {
                    'total_time': total_time,
                    'db_execution_time': result['performance']['execution_time'],
                    'cache_hit': result['cache']['hit'],
                    'query_optimization': result['performance']['query_optimization']
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
    
    @productos_bp.route('/sku/<valor>', methods=['GET'])
    def get_producto_por_sku(valor):
        """
        Obtener producto específico por SKU usando índice PRIMARY
        """
        start_time = time.time()
        
        try:
            result = producto_service.get_producto_por_sku(valor)
            
            total_time = time.time() - start_time
            
            if not result['producto']:
                return jsonify({
                    'success': False,
                    'error': 'Producto no encontrado',
                    'performance': {
                        'total_time': total_time
                    }
                }), 404
            
            response = {
                'success': True,
                'data': result['producto'],
                'performance': {
                    'total_time': total_time,
                    'db_execution_time': result['performance']['execution_time'],
                    'cache_hit': result['cache']['hit'],
                    'query_optimization': result['performance']['query_optimization']
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
    
    @productos_bp.route('/stock/<valor>', methods=['GET'])
    def get_productos_por_stock(valor):
        """
        Obtener productos por estado de stock usando índice optimizado
        """
        start_time = time.time()
        
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', 0, type=int)
        
        try:
            result = producto_service.get_productos_por_stock(
                valor, limit, offset
            )
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': result['productos'],
                'meta': {
                    'stock_status': valor,
                    'total': result['total'],
                    'limit': limit,
                    'offset': offset,
                    'has_more': limit and result['total'] > offset + limit
                },
                'performance': {
                    'total_time': total_time,
                    'db_execution_time': result['performance']['execution_time'],
                    'cache_hit': result['cache']['hit'],
                    'query_optimization': result['performance']['query_optimization']
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
    
    @productos_bp.route('/tamaño/<valor>', methods=['GET'])
    def get_productos_por_tamano(valor):
        """
        Obtener productos por tamaño usando índice optimizado
        """
        start_time = time.time()
        
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', 0, type=int)
        
        try:
            result = producto_service.get_productos_por_tamano(
                valor, limit, offset
            )
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': result['productos'],
                'meta': {
                    'tamaño': valor,
                    'total': result['total'],
                    'limit': limit,
                    'offset': offset,
                    'has_more': limit and result['total'] > offset + limit
                },
                'performance': {
                    'total_time': total_time,
                    'db_execution_time': result['performance']['execution_time'],
                    'cache_hit': result['cache']['hit'],
                    'query_optimization': result['performance']['query_optimization']
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
    
    @productos_bp.route('/<int:producto_id>', methods=['GET'])
    def get_producto_por_id(producto_id):
        """
        Obtener producto específico por ID usando índice PRIMARY
        """
        start_time = time.time()
        
        try:
            result = producto_service.get_producto_por_id(producto_id)
            
            total_time = time.time() - start_time
            
            if not result['producto']:
                return jsonify({
                    'success': False,
                    'error': 'Producto no encontrado',
                    'performance': {
                        'total_time': total_time
                    }
                }), 404
            
            response = {
                'success': True,
                'data': result['producto'],
                'performance': {
                    'total_time': total_time,
                    'db_execution_time': result['performance']['execution_time'],
                    'cache_hit': result['cache']['hit'],
                    'query_optimization': result['performance']['query_optimization']
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
    
    @productos_bp.route('/estadisticas', methods=['GET'])
    def get_estadisticas_productos():
        """
        Obtener estadísticas generales de productos
        """
        start_time = time.time()
        
        try:
            result = producto_service.get_estadisticas_productos()
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': result['estadisticas'],
                'performance': {
                    'total_time': total_time,
                    'db_execution_time': result['performance']['execution_time'],
                    'cache_hit': result['cache']['hit']
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
    
    @productos_bp.route('/combos', methods=['GET'])
    def get_productos_combos():
        """
        Endpoint específico para productos Combos (optimizado)
        """
        start_time = time.time()
        
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', 0, type=int)
        
        try:
            result = producto_service.get_productos_por_subcategoria(
                'Combos', limit, offset
            )
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': result['productos'],
                'meta': {
                    'subcategoria': 'Combos',
                    'total': result['total'],
                    'limit': limit,
                    'offset': offset,
                    'has_more': limit and result['total'] > offset + limit
                },
                'performance': {
                    'total_time': total_time,
                    'db_execution_time': result['performance']['execution_time'],
                    'cache_hit': result['cache']['hit'],
                    'query_optimization': result['performance']['query_optimization']
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
    
    @productos_bp.route('/categorias', methods=['GET'])
    def get_lista_categorias():
        """
        Obtener lista de categorías únicas (limitado a 10 por defecto)
        """
        start_time = time.time()
        
        # Parámetro opcional para limitar resultados
        limit = request.args.get('limit', 10, type=int)
        
        try:
            result = producto_service.get_categorias(limit)
            
            total_time = time.time() - start_time
            
            response = {
                'success': True,
                'data': result['categorias'],
                'meta': {
                    'total': result['total'],
                    'limit': result['limit']
                },
                'performance': {
                    'total_time': total_time,
                    'db_execution_time': result['performance']['execution_time'],
                    'cache_hit': result['cache']['hit'],
                    'query_optimization': result['performance']['query_optimization']
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
    
    return productos_bp 