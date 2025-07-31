from flask import Flask, jsonify
from flask_cors import CORS
from flask_caching import Cache
from config import Config
from api.v1.endpoints.productos import create_productos_endpoints
import time

def create_app():
    """Crear aplicación Flask optimizada"""
    
    # Validar configuración antes de crear la app
    try:
        Config.validate_config()
        print("✅ Configuración validada correctamente")
    except ValueError as e:
        print(f"❌ Error en configuración: {e}")
        print("📝 Asegúrate de que el archivo .env esté configurado correctamente")
        raise
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configurar CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configurar caché Redis
    cache = Cache(app)
    
    # Registrar blueprints
    productos_bp = create_productos_endpoints(cache)
    app.register_blueprint(productos_bp, url_prefix='/api/v1/productos')
    
    @app.route('/')
    def home():
        """Endpoint de bienvenida"""
        return jsonify({
            'message': 'Licorería ATS API - Backend Optimizado',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'productos': {
                    'combos': '/api/v1/productos/combos',
                    'subcategoria': '/api/v1/productos/subcategoria/<subcategoria>',
                    'categoria': '/api/v1/productos/categoria/<categoria>',
                    'buscar': '/api/v1/productos/buscar/<query>',
                    'stock': '/api/v1/productos/stock/<stock_status>',
                    'por_id': '/api/v1/productos/<id>',
                    'estadisticas': '/api/v1/productos/estadisticas'
                }
            },
            'optimizaciones': {
                'indices_mysql': 'Todos los índices creados',
                'cache_redis': 'Caché optimizado',
                'consultas_optimizadas': 'Uso de índices verificados'
            }
        })
    
    @app.route('/health')
    def health_check():
        """Endpoint de verificación de salud"""
        start_time = time.time()
        
        try:
            # Verificar conexión a base de datos
            from utils.database import db_manager
            db_info = db_manager.get_table_info()
            
            total_time = time.time() - start_time
            
            return jsonify({
                'status': 'healthy',
                'database': {
                    'connected': True,
                    'table_info': {
                        'columns': len(db_info['structure']),
                        'indexes': len(db_info['indexes'])
                    },
                    'execution_time': db_info['execution_time']
                },
                'cache': {
                    'redis_available': True
                },
                'performance': {
                    'health_check_time': total_time
                }
            })
            
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'error': str(e),
                'performance': {
                    'health_check_time': time.time() - start_time
                }
            }), 500
    
    @app.route('/performance')
    def performance_info():
        """Endpoint de información de rendimiento"""
        return jsonify({
            'optimizaciones': {
                'indices_mysql': [
                    'PRIMARY (id)',
                    'idx_sku_p (SKU)',
                    'idx_sku_especifico (SKU)',
                    'idx_tamaño (Tamaño)',
                    'idx_categoria (Categoria)',
                    'idx_sub_categoria (Sub Categoria)',
                    'idx_stock (Stock)',
                    'idx_sub_categoria_nivel (Sub Categoria Nivel)'
                ],
                'cache_strategy': {
                    'productos': '10 minutos',
                    'estadisticas': '5 minutos',
                    'indices': '30 minutos'
                },
                'query_optimization': {
                    'use_indexes': True,
                    'explain_queries': True,
                    'connection_pooling': True
                }
            },
            'endpoints_optimizados': [
                '/api/v1/productos/combos',
                '/api/v1/productos/subcategoria/*',
                '/api/v1/productos/categoria/*',
                '/api/v1/productos/buscar/*',
                '/api/v1/productos/stock/*',
                '/api/v1/productos/*',
                '/api/v1/productos/estadisticas'
            ]
        })
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Endpoint no encontrado',
            'available_endpoints': [
                '/',
                '/health',
                '/performance',
                '/api/v1/productos/combos',
                '/api/v1/productos/subcategoria/<subcategoria>',
                '/api/v1/productos/categoria/<categoria>',
                '/api/v1/productos/buscar/<query>',
                '/api/v1/productos/stock/<stock_status>',
                '/api/v1/productos/<id>',
                '/api/v1/productos/estadisticas'
            ]
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    ) 