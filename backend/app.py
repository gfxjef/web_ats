from flask import Flask, jsonify
from flask_cors import CORS
from flask_caching import Cache
from config import Config
from api.v1.endpoints.productos import create_json_productos_endpoints
from api.v1.endpoints.ventas import ventas_bp
from json_database import start_json_database, json_db
import time

def create_app():
    """Crear aplicación Flask optimizada"""
    
    # Validar configuración antes de crear la app
    try:
        Config.validate_config()
        print("Configuración validada correctamente")
    except ValueError as e:
        print(f"Error en configuración: {e}")
        print("Asegúrate de que el archivo .env esté configurado correctamente")
        # En lugar de fallar, usar configuración por defecto
        print("Usando configuración por defecto...")
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configurar CORS para producción
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "https://web-ats.vercel.app",
                "https://www.atusaludlicoreria.com",
                "https://atusaludlicoreria.com",
                "https://web-ats-git-main-gfxjefs-projects.vercel.app",
                "http://localhost:3000"  # Para desarrollo local
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Configurar caché Redis
    cache = Cache(app)
    
    # Inicializar base de datos JSON ultra-rápida
    print("Iniciando base de datos JSON ultra-rápida...")
    start_json_database()
    
    # Registrar endpoints JSON ultra-optimizados (API principal)
    productos_json_bp = create_json_productos_endpoints()
    app.register_blueprint(productos_json_bp, url_prefix='/api/v1/productos')
    
    # Registrar endpoints de ventas
    app.register_blueprint(ventas_bp, url_prefix='/api/v1/ventas')
    
    @app.route('/')
    def home():
        """Endpoint de bienvenida"""
        return jsonify({
            'message': 'Licorería ATS API - Backend Optimizado',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'productos': {
                    'todos': '/api/v1/productos/',
                    'categoria': '/api/v1/productos/categoria/<categoria>',
                    'subcategoria': '/api/v1/productos/subcategoria/<subcategoria>',
                    'buscar': '/api/v1/productos/buscar/<query>',
                    'stock': '/api/v1/productos/stock/<stock_status>',
                    'por_id': '/api/v1/productos/<id>',
                    'por_sku': '/api/v1/productos/sku/<sku>',
                    'categorias': '/api/v1/productos/categorias',
                    'destacados': '/api/v1/productos/destacados',
                    'stats': '/api/v1/productos/stats'
                },
                'ventas': {
                    'top_general': '/api/v1/ventas/top_general',
                    'top_categoria': '/api/v1/ventas/top_categoria/<categoria>',
                    'top_todas': '/api/v1/ventas/top_todas_categorias',
                    'estadisticas': '/api/v1/ventas/estadisticas',
                    'categorias': '/api/v1/ventas/categorias_con_ventas'
                }
            },
            'optimizaciones': {
                'json_database': 'Base de datos JSON en memoria (ultra-rápida)',
                'indices_json': 'Índices construidos para consultas instantáneas',
                'auto_sync': 'Sincronización automática con MySQL cada 10 minutos',
                'performance': 'Respuestas en 0.0ms - Sin acceso a base de datos'
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
                'json_database': {
                    'status': 'active',
                    'stats': json_db.get_database_stats()
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
                'json_database_strategy': {
                    'sync_interval': '10 minutos',
                    'query_time': '0.0ms (instantáneo)',
                    'memory_usage': '~0.5MB para 1042 productos',
                    'indexes': '6 índices construidos automáticamente'
                },
                'query_optimization': {
                    'use_indexes': True,
                    'explain_queries': True,
                    'connection_pooling': True
                }
            },
            'endpoints_ultra_optimizados': [
                '/api/v1/productos/',
                '/api/v1/productos/categoria/*',
                '/api/v1/productos/subcategoria/*',
                '/api/v1/productos/buscar/*',
                '/api/v1/productos/stock/*',
                '/api/v1/productos/<id>',
                '/api/v1/productos/sku/<sku>',
                '/api/v1/productos/categorias',
                '/api/v1/productos/destacados',
                '/api/v1/productos/stats'
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
                '/api/v1/productos/',
                '/api/v1/productos/categoria/<categoria>',
                '/api/v1/productos/subcategoria/<subcategoria>',
                '/api/v1/productos/buscar/<query>',
                '/api/v1/productos/stock/<stock_status>',
                '/api/v1/productos/<id>',
                '/api/v1/productos/sku/<sku>',
                '/api/v1/productos/categorias',
                '/api/v1/productos/destacados',
                '/api/v1/productos/stats'
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