import json
from pathlib import Path
from typing import Dict, List, Optional
import logging
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class VentasService:
    """Servicio para obtener datos de ventas analizados"""
    
    def __init__(self):
        self.analysis_file = Path("database") / "ventas_analysis.json"
        self.data = None
        self.last_loaded = None
        self._load_analysis()
    
    def _load_analysis(self):
        """Cargar análisis de ventas desde archivo"""
        try:
            if self.analysis_file.exists():
                with open(self.analysis_file, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
                self.last_loaded = datetime.now()
                logger.info(f"Análisis de ventas cargado: {len(self.data.get('top_por_categoria', {}))} categorías")
            else:
                logger.warning("Archivo de análisis no encontrado")
                self.data = {
                    'fecha_generacion': None,
                    'periodo_analisis': 'Sin datos',
                    'estadisticas': {},
                    'top_por_categoria': {},
                    'top_general': []
                }
        except Exception as e:
            logger.error(f"Error cargando análisis: {e}")
            self.data = None
    
    def get_top_por_categoria(self, categoria: str = None, limit: int = 10) -> List[Dict]:
        """Obtener productos más vendidos por categoría"""
        if not self.data:
            self._load_analysis()
        
        if categoria:
            # Buscar por categoría específica
            productos = self.data.get('top_por_categoria', {}).get(categoria, [])
            return productos[:limit]
        else:
            # Devolver todas las categorías con sus top productos
            result = {}
            for cat, productos in self.data.get('top_por_categoria', {}).items():
                result[cat] = productos[:limit]
            return result
    
    def get_top_general(self, limit: int = 20) -> List[Dict]:
        """Obtener productos más vendidos en general"""
        if not self.data:
            self._load_analysis()
        
        return self.data.get('top_general', [])[:limit]
    
    def get_estadisticas(self) -> Dict:
        """Obtener estadísticas del análisis"""
        if not self.data:
            self._load_analysis()
        
        return {
            'fecha_analisis': self.data.get('fecha_generacion'),
            'periodo': self.data.get('periodo_analisis'),
            'estadisticas': self.data.get('estadisticas', {}),
            'archivo_actualizado': self.analysis_file.stat().st_mtime if self.analysis_file.exists() else None
        }
    
    def get_categorias_con_ventas(self) -> List[str]:
        """Obtener lista de categorías que tienen ventas"""
        if not self.data:
            self._load_analysis()
        
        categorias = list(self.data.get('top_por_categoria', {}).keys())
        # Ordenar según el orden preferido
        orden_preferido = ['Combos', 'Cervezas', 'Whiskies', 'Piscos', 'Vodkas', 'Rones', 'Vinos', 'Tragos', 'Otros']
        
        # Ordenar según el orden preferido
        categorias_ordenadas = []
        for cat in orden_preferido:
            if cat in categorias:
                categorias_ordenadas.append(cat)
        
        # Agregar cualquier categoría que no esté en el orden preferido
        for cat in categorias:
            if cat not in categorias_ordenadas:
                categorias_ordenadas.append(cat)
        
        return categorias_ordenadas

# Instancia global del servicio
ventas_service = VentasService()