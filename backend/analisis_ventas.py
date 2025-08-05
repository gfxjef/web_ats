import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from collections import defaultdict
import logging
from pathlib import Path
from decimal import Decimal

from utils.database import get_db_connection, close_db_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VentasAnalyzer:
    """Analizador de ventas para obtener productos más vendidos"""
    
    def __init__(self):
        self.productos_db_path = Path("database") / "productos_db.json"
        self.productos_data = {}
        self.load_productos()
    
    def load_productos(self):
        """Cargar información de productos desde el archivo JSON"""
        try:
            with open(self.productos_db_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                productos = data.get('products', [])
                # Crear diccionario SKU -> producto para búsqueda rápida
                self.productos_data = {p['SKU']: p for p in productos}
                logger.info(f"Cargados {len(self.productos_data)} productos")
        except Exception as e:
            logger.error(f"Error cargando productos: {e}")
    
    def get_ventas_ultimos_meses(self, meses: int = 6) -> List[Dict]:
        """Obtener ventas de los últimos N meses"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Calcular fecha de inicio (hace 6 meses)
            fecha_inicio = datetime.now() - timedelta(days=meses * 30)
            
            # Query para obtener ventas
            query = """
                SELECT 
                    SKU,
                    Marca,
                    Modelo,
                    tamano,
                    SUM(Cantidad) as total_vendido,
                    COUNT(*) as num_ventas,
                    AVG(Precio) as precio_promedio
                FROM ventas_totales_2024
                WHERE Timestamp >= %s
                    AND Status = 'Subido'
                GROUP BY SKU, Marca, Modelo, tamano
                ORDER BY total_vendido DESC
            """
            
            cursor.execute(query, (fecha_inicio,))
            ventas = cursor.fetchall()
            
            close_db_connection(conn)
            
            logger.info(f"Obtenidas {len(ventas)} ventas unicas desde {fecha_inicio.strftime('%Y-%m-%d')}")
            return ventas
            
        except Exception as e:
            logger.error(f"Error obteniendo ventas: {e}")
            return []
    
    def analizar_ventas_por_categoria(self, meses: int = 6) -> Dict[str, List[Dict]]:
        """Analizar las ventas agrupadas por categoría"""
        ventas = self.get_ventas_ultimos_meses(meses)
        
        # Agrupar por categoría
        ventas_por_categoria = defaultdict(list)
        
        for venta in ventas:
            sku = venta['SKU']
            
            # Buscar producto en la base de datos
            if sku in self.productos_data:
                producto = self.productos_data[sku]
                sub_categoria = producto['Sub Categoria']
                
                # Agregar información del producto a la venta
                venta_completa = {
                    **venta,
                    'Nombre': producto['Nombre'],
                    'Categoria': producto['Categoria'],
                    'Sub_Categoria': sub_categoria,
                    'Precio_B': producto['Precio B'],
                    'Precio_J': producto['Precio J'],
                    'Stock': producto['Stock'],
                    'Photo': producto['Photo']
                }
                
                ventas_por_categoria[sub_categoria].append(venta_completa)
            else:
                logger.warning(f"SKU {sku} no encontrado en productos_db")
        
        # Ordenar cada categoría por total vendido y tomar top 10
        resultado = {}
        for categoria, ventas in ventas_por_categoria.items():
            ventas_ordenadas = sorted(ventas, key=lambda x: x['total_vendido'], reverse=True)
            resultado[categoria] = ventas_ordenadas[:10]
        
        return resultado
    
    def get_top_productos_general(self, limit: int = 20) -> List[Dict]:
        """Obtener los productos más vendidos en general"""
        ventas = self.get_ventas_ultimos_meses(6)
        
        # Enriquecer con datos de productos
        ventas_completas = []
        for venta in ventas:
            sku = venta['SKU']
            if sku in self.productos_data:
                producto = self.productos_data[sku]
                venta_completa = {
                    **venta,
                    'Nombre': producto['Nombre'],
                    'Categoria': producto['Categoria'],
                    'Sub_Categoria': producto['Sub Categoria'],
                    'Precio_B': producto['Precio B'],
                    'Precio_J': producto['Precio J'],
                    'Stock': producto['Stock'],
                    'Photo': producto['Photo']
                }
                ventas_completas.append(venta_completa)
        
        # Ordenar por total vendido
        ventas_ordenadas = sorted(ventas_completas, key=lambda x: x['total_vendido'], reverse=True)
        return ventas_ordenadas[:limit]
    
    def generar_reporte(self) -> Dict:
        """Generar reporte completo de ventas"""
        logger.info("Generando reporte de ventas...")
        
        # Obtener top por categoría
        ventas_por_categoria = self.analizar_ventas_por_categoria()
        
        # Obtener top general
        top_general = self.get_top_productos_general(20)
        
        # Estadísticas
        total_productos_vendidos = sum(len(ventas) for ventas in ventas_por_categoria.values())
        
        reporte = {
            'fecha_generacion': datetime.now().isoformat(),
            'periodo_analisis': 'Últimos 6 meses',
            'estadisticas': {
                'total_categorias': len(ventas_por_categoria),
                'total_productos_analizados': total_productos_vendidos
            },
            'top_por_categoria': ventas_por_categoria,
            'top_general': top_general
        }
        
        # Guardar reporte
        output_path = Path("database") / "ventas_analysis.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            # Convertir Decimals a float para JSON
            json.dump(reporte, f, ensure_ascii=False, indent=2, default=lambda x: float(x) if isinstance(x, Decimal) else x)
        
        logger.info(f"Reporte guardado en: {output_path}")
        
        return reporte
    
    def mostrar_resumen(self):
        """Mostrar resumen de los productos más vendidos"""
        reporte = self.generar_reporte()
        
        print("\n" + "="*60)
        print("REPORTE DE PRODUCTOS MAS VENDIDOS (ULTIMOS 6 MESES)")
        print("="*60)
        
        # Mostrar top por categoría
        for categoria, productos in reporte['top_por_categoria'].items():
            if productos:  # Solo mostrar categorías con ventas
                print(f"\n{categoria.upper()}")
                print("-" * 40)
                for i, producto in enumerate(productos[:5], 1):  # Top 5 de cada categoría
                    print(f"{i}. {producto['Nombre']}")
                    print(f"   SKU: {producto['SKU']} | Vendidos: {producto['total_vendido']} unidades")
                    print(f"   Precio promedio: ${producto['precio_promedio']:.2f}")
        
        # Mostrar top general
        print(f"\n\nTOP 10 PRODUCTOS MAS VENDIDOS (GENERAL)")
        print("=" * 60)
        for i, producto in enumerate(reporte['top_general'][:10], 1):
            print(f"{i}. {producto['Nombre']} ({producto['Sub_Categoria']})")
            print(f"   SKU: {producto['SKU']} | Vendidos: {producto['total_vendido']} unidades")
            print(f"   {producto['num_ventas']} ventas | Precio promedio: ${producto['precio_promedio']:.2f}")
            print()

if __name__ == "__main__":
    # Ejecutar análisis
    analyzer = VentasAnalyzer()
    
    # Primero, veamos algunos registros de ejemplo
    print("Obteniendo registros de muestra de ventas...")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Ver estructura de la tabla y estadísticas
        cursor.execute("SELECT * FROM ventas_totales_2024 LIMIT 5")
        muestra = cursor.fetchall()
        
        # Ver rango de fechas
        cursor.execute("SELECT MIN(Timestamp) as fecha_min, MAX(Timestamp) as fecha_max, COUNT(*) as total FROM ventas_totales_2024")
        stats = cursor.fetchone()
        
        print("\nEstructura de registros de ventas:")
        if muestra:
            print(f"Columnas: {list(muestra[0].keys())}")
            print(f"\nEstadísticas de ventas:")
            print(f"- Total registros: {stats['total']}")
            print(f"- Fecha más antigua: {stats['fecha_min']}")
            print(f"- Fecha más reciente: {stats['fecha_max']}")
            print("\nPrimeros 5 registros:")
            for i, registro in enumerate(muestra, 1):
                print(f"\n{i}. SKU: {registro['SKU']}, Modelo: {registro['Modelo']}, Cantidad: {registro['Cantidad']}")
                print(f"   Fecha: {registro['Timestamp']}, Status: {registro['Status']}")
        
        close_db_connection(conn)
        
    except Exception as e:
        print(f"Error: {e}")
    
    # Ejecutar análisis completo
    print("\n" + "="*60)
    print("Iniciando analisis completo de ventas...")
    analyzer.mostrar_resumen()