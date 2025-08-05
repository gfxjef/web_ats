from flask import Blueprint, jsonify, request
from services.ventas_service import ventas_service
import logging

logger = logging.getLogger(__name__)

# Crear blueprint
ventas_bp = Blueprint('ventas', __name__)

@ventas_bp.route('/top_general', methods=['GET'])
def get_top_general():
    """Obtener productos más vendidos en general"""
    try:
        limit = request.args.get('limit', 20, type=int)
        productos = ventas_service.get_top_general(limit=limit)
        
        return jsonify({
            'success': True,
            'data': productos,
            'total': len(productos)
        })
    except Exception as e:
        logger.error(f"Error obteniendo top general: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ventas_bp.route('/top_categoria/<categoria>', methods=['GET'])
def get_top_by_categoria(categoria):
    """Obtener productos más vendidos por categoría"""
    try:
        limit = request.args.get('limit', 10, type=int)
        productos = ventas_service.get_top_por_categoria(categoria=categoria, limit=limit)
        
        return jsonify({
            'success': True,
            'data': productos,
            'categoria': categoria,
            'total': len(productos)
        })
    except Exception as e:
        logger.error(f"Error obteniendo top por categoría: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ventas_bp.route('/top_todas_categorias', methods=['GET'])
def get_top_todas_categorias():
    """Obtener productos más vendidos de todas las categorías"""
    try:
        limit = request.args.get('limit', 10, type=int)
        categorias = ventas_service.get_top_por_categoria(limit=limit)
        
        return jsonify({
            'success': True,
            'data': categorias,
            'total_categorias': len(categorias)
        })
    except Exception as e:
        logger.error(f"Error obteniendo top todas categorías: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ventas_bp.route('/estadisticas', methods=['GET'])
def get_estadisticas_ventas():
    """Obtener estadísticas del análisis de ventas"""
    try:
        stats = ventas_service.get_estadisticas()
        
        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ventas_bp.route('/categorias_con_ventas', methods=['GET'])
def get_categorias_con_ventas():
    """Obtener lista de categorías que tienen ventas"""
    try:
        categorias = ventas_service.get_categorias_con_ventas()
        
        return jsonify({
            'success': True,
            'data': categorias,
            'total': len(categorias)
        })
    except Exception as e:
        logger.error(f"Error obteniendo categorías: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500