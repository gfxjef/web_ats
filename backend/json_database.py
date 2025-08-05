import json
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
import logging
from pathlib import Path
from threading import Thread, Lock
import schedule
import re

from utils.database import get_db_connection, close_db_connection
import json as json_lib

# Configuración
JSON_DB_FILE = Path("database") / "productos_db.json"
UPDATE_INTERVAL = 10  # minutos
BACKUP_INTERVAL = 60  # minutos para backup

# Crear directorio si no existe
JSON_DB_FILE.parent.mkdir(exist_ok=True)

# Lock para operaciones thread-safe
db_lock = Lock()

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JSONDatabase:
    """Base de datos JSON en memoria para consultas ultra-rápidas"""
    
    def __init__(self):
        self.data = []
        self.indexes = {}
        self.last_update = None
        self.stats = {
            'total_products': 0,
            'categories': {},
            'brands': {},
            'last_query_time': 0
        }
        self.ventas_data = {}
        self._load_ventas_data()
    
    def _load_ventas_data(self):
        """Cargar datos de análisis de ventas"""
        try:
            ventas_file = Path("database") / "ventas_analysis.json"
            if ventas_file.exists():
                with open(ventas_file, 'r', encoding='utf-8') as f:
                    data = json_lib.load(f)
                    # Crear diccionario SKU -> total_vendido
                    for categoria, productos in data.get('top_por_categoria', {}).items():
                        for producto in productos:
                            self.ventas_data[producto['SKU']] = producto.get('total_vendido', 0)
                logger.info(f"Datos de ventas cargados: {len(self.ventas_data)} productos")
        except Exception as e:
            logger.warning(f"No se pudieron cargar datos de ventas: {e}")
            self.ventas_data = {}
        
    def load_from_mysql(self):
        """Cargar todos los datos desde MySQL"""
        try:
            logger.info("🔄 Intentando cargar datos desde MySQL...")
            start_time = time.time()
            
            # En producción sin MySQL, usar datos de respaldo
            if os.getenv('FLASK_ENV') == 'production' and not os.getenv('DB_HOST'):
                logger.warning("⚠️ No hay configuración MySQL en producción, usando datos de respaldo")
                return self._load_backup_data()
            
            connection = get_db_connection()
            if not connection:
                logger.warning("⚠️ No se pudo conectar a MySQL, usando datos de respaldo")
                return self._load_backup_data()
            
            cursor = connection.cursor(dictionary=True)
            
            # Query optimizado para obtener todos los productos
            query = """
            SELECT 
                id, SKU, Nombre, Modelo, Tamaño, 
                `Precio B`, `Precio J`, Categoria, `Sub Categoria`, 
                Stock, `Sub Categoria Nivel`, `Al Por Mayor`, 
                Top_S_Sku, Product_asig, Descripcion, Cantidad, Photo
            FROM productos 
            ORDER BY id
            """
            
            cursor.execute(query)
            products = cursor.fetchall()
            
            # Procesar datos
            processed_products = []
            for product in products:
                # Convertir None a valores por defecto
                processed_product = {
                    'id': product.get('id', 0),
                    'SKU': product.get('SKU', ''),
                    'Nombre': product.get('Nombre', ''),
                    'Modelo': product.get('Modelo', ''),
                    'Tamaño': product.get('Tamaño', ''),
                    'Precio B': float(product.get('Precio B', 0)),
                    'Precio J': float(product.get('Precio J', 0)),
                    'Categoria': product.get('Categoria', ''),
                    'Sub Categoria': product.get('Sub Categoria', ''),
                    'Stock': product.get('Stock', 'Sin Stock'),
                    'Sub Categoria Nivel': str(product.get('Sub Categoria Nivel', '999')),
                    'Al Por Mayor': product.get('Al Por Mayor', 'No'),
                    'Top_S_Sku': product.get('Top_S_Sku', ''),
                    'Product_asig': product.get('Product_asig', ''),
                    'Descripcion': product.get('Descripcion', ''),
                    'Cantidad': int(product.get('Cantidad', 0)),
                    'Photo': product.get('Photo', '')
                }
                processed_products.append(processed_product)
            
            cursor.close()
            close_db_connection(connection)
            
            # Actualizar datos en memoria
            with db_lock:
                self.data = processed_products
                self.last_update = datetime.now()
                self._build_indexes()
                self._calculate_stats()
            
            # Guardar en archivo
            self._save_to_file()
            
            load_time = time.time() - start_time
            logger.info(f"✅ {len(processed_products)} productos cargados desde MySQL en {load_time:.2f}s")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error cargando desde MySQL: {e}")
            # Fallback a datos de respaldo
            return self._load_backup_data()
    
    def _load_backup_data(self):
        """Cargar datos de respaldo cuando MySQL no está disponible"""
        logger.info("📦 Cargando datos de respaldo...")
        
        backup_products = [
            {
                'id': 1,
                'SKU': 'DEMO-001',
                'Nombre': 'Producto Demo - Configure MySQL',
                'Modelo': 'DEMO',
                'Tamaño': '750ml',
                'Categoria': 'DEMO',
                'Sub Categoria': 'demo',
                'Sub Categoria Nivel': '',
                'Precio B': 0.00,
                'Precio J': 0.00,
                'Stock': 'Sin Stock',
                'Product_asig': '',
                'Cantidad': 0,
                'Descripcion': 'Configure las variables de MySQL en Render para ver productos reales',
                'Photo': ''
            }
        ]
        
        with db_lock:
            self.data = backup_products
            self.last_update = datetime.now()
            self._build_indexes()
            self._calculate_stats()
        
        logger.info("✅ Datos de respaldo cargados")
        return True
    
    def _save_to_file(self):
        """Guardar datos en archivo JSON"""
        try:
            file_data = {
                'products': self.data,
                'last_update': self.last_update.isoformat(),
                'stats': self.stats,
                'total_products': len(self.data)
            }
            
            with open(JSON_DB_FILE, 'w', encoding='utf-8') as f:
                json.dump(file_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"💾 Base de datos guardada: {JSON_DB_FILE}")
            
        except Exception as e:
            logger.error(f"❌ Error guardando archivo: {e}")
    
    def _build_indexes(self):
        """Construir índices para búsquedas rápidas"""
        self.indexes = {
            'by_id': {},
            'by_sku': {},
            'by_categoria': {},
            'by_sub_categoria': {},
            'by_stock': {},
            'by_nombre': {}
        }
        
        for product in self.data:
            # Índice por ID
            self.indexes['by_id'][product['id']] = product
            
            # Índice por SKU
            self.indexes['by_sku'][product['SKU']] = product
            
            # Índice por categoría
            categoria = product['Categoria']
            if categoria not in self.indexes['by_categoria']:
                self.indexes['by_categoria'][categoria] = []
            self.indexes['by_categoria'][categoria].append(product)
            
            # Índice por subcategoría
            sub_categoria = product['Sub Categoria']
            if sub_categoria not in self.indexes['by_sub_categoria']:
                self.indexes['by_sub_categoria'][sub_categoria] = []
            self.indexes['by_sub_categoria'][sub_categoria].append(product)
            
            # Índice por stock
            stock = product['Stock']
            if stock not in self.indexes['by_stock']:
                self.indexes['by_stock'][stock] = []
            self.indexes['by_stock'][stock].append(product)
            
            # Índice por nombre (para búsquedas)
            nombre = product['Nombre'].lower()
            if nombre not in self.indexes['by_nombre']:
                self.indexes['by_nombre'][nombre] = []
            self.indexes['by_nombre'][nombre].append(product)
    
    def _calculate_stats(self):
        """Calcular estadísticas de la base de datos"""
        self.stats = {
            'total_products': len(self.data),
            'categories': {},
            'brands': {},
            'last_query_time': 0
        }
        
        for product in self.data:
            categoria = product['Categoria']
            if categoria in self.stats['categories']:
                self.stats['categories'][categoria] += 1
            else:
                self.stats['categories'][categoria] = 1
    
    # MÉTODOS DE CONSULTA (COMO SQL)
    
    def get_all(self, limit: Optional[int] = None, offset: int = 0) -> List[Dict]:
        """SELECT * FROM productos LIMIT ? OFFSET ?"""
        start_time = time.time()
        
        with db_lock:
            if limit:
                result = self.data[offset:offset + limit]
            else:
                result = self.data[offset:]
        
        self.stats['last_query_time'] = time.time() - start_time
        return result
    
    def get_by_id(self, product_id: int) -> Optional[Dict]:
        """SELECT * FROM productos WHERE id = ?"""
        start_time = time.time()
        
        with db_lock:
            result = self.indexes['by_id'].get(product_id)
        
        self.stats['last_query_time'] = time.time() - start_time
        return result
    
    def get_by_sku(self, sku: str) -> Optional[Dict]:
        """SELECT * FROM productos WHERE SKU = ?"""
        start_time = time.time()
        
        with db_lock:
            result = self.indexes['by_sku'].get(sku)
        
        self.stats['last_query_time'] = time.time() - start_time
        return result
    
    def get_by_categoria(self, categoria: str, limit: Optional[int] = None, offset: int = 0, order_by_sales: bool = True) -> List[Dict]:
        """SELECT * FROM productos WHERE Categoria = ? ORDER BY ventas DESC LIMIT ? OFFSET ?"""
        start_time = time.time()
        
        with db_lock:
            products = self.indexes['by_categoria'].get(categoria, []).copy()
            
            # Ordenar por ventas si está habilitado
            if order_by_sales and self.ventas_data:
                products.sort(key=lambda p: self.ventas_data.get(p['SKU'], 0), reverse=True)
            
            if limit:
                result = products[offset:offset + limit]
            else:
                result = products[offset:]
        
        self.stats['last_query_time'] = time.time() - start_time
        return result
    
    def get_by_sub_categoria(self, sub_categoria: str, limit: Optional[int] = None, offset: int = 0, order_by_sales: bool = True) -> List[Dict]:
        """SELECT * FROM productos WHERE `Sub Categoria` = ? ORDER BY ventas DESC LIMIT ? OFFSET ?"""
        start_time = time.time()
        
        with db_lock:
            products = self.indexes['by_sub_categoria'].get(sub_categoria, []).copy()
            
            # Ordenar por ventas si está habilitado
            if order_by_sales and self.ventas_data:
                # Primero los más vendidos, luego los demás
                products.sort(key=lambda p: self.ventas_data.get(p['SKU'], 0), reverse=True)
            
            if limit:
                result = products[offset:offset + limit]
            else:
                result = products[offset:]
        
        self.stats['last_query_time'] = time.time() - start_time
        return result
    
    def get_by_stock(self, stock: str, limit: Optional[int] = None, offset: int = 0) -> List[Dict]:
        """SELECT * FROM productos WHERE Stock = ? LIMIT ? OFFSET ?"""
        start_time = time.time()
        
        with db_lock:
            products = self.indexes['by_stock'].get(stock, [])
            if limit:
                result = products[offset:offset + limit]
            else:
                result = products[offset:]
        
        self.stats['last_query_time'] = time.time() - start_time
        return result
    
    def search_products(self, query: str, limit: Optional[int] = None, offset: int = 0) -> List[Dict]:
        """Búsqueda optimizada por nombre"""
        start_time = time.time()
        
        with db_lock:
            results = []
            query_lower = query.lower()
            
            for product in self.data:
                if (query_lower in product['Nombre'].lower() or 
                    query_lower in product['Modelo'].lower() or
                    query_lower in product['Categoria'].lower() or
                    query_lower in product['Sub Categoria'].lower()):
                    results.append(product)
                    
                if limit and len(results) >= limit + offset:
                    break
        
        self.stats['last_query_time'] = time.time() - start_time
        return results
    
    def get_categories(self) -> List[Dict]:
        """SELECT Sub Categoria, COUNT(*) as total FROM productos GROUP BY Sub Categoria ORDER BY Sub Categoria Nivel"""
        start_time = time.time()
        
        with db_lock:
            # Agrupar por Sub Categoria y obtener información de Sub Categoria Nivel
            sub_categories = {}
            for product in self.data:
                sub_categoria = product['Sub Categoria']
                categoria = product['Categoria']  # Mantener para URLs
                nivel = product.get('Sub Categoria Nivel', '999')  # Default si no existe
                
                if sub_categoria not in sub_categories:
                    sub_categories[sub_categoria] = {
                        'Categoria': categoria,  # Para URLs (mantener compatibilidad)
                        'Sub_Categoria': sub_categoria,  # Nombre a mostrar
                        'Sub_Categoria_Nivel': nivel,
                        'total_productos': 0,
                        'productos_con_stock': 0
                    }
                
                sub_categories[sub_categoria]['total_productos'] += 1
                if product['Stock'] == 'Con Stock':
                    sub_categories[sub_categoria]['productos_con_stock'] += 1
            
            # Convertir a lista y ordenar por Sub Categoria Nivel
            categories = list(sub_categories.values())
            categories.sort(key=lambda x: int(x['Sub_Categoria_Nivel']) if x['Sub_Categoria_Nivel'].isdigit() else 999)
        
        self.stats['last_query_time'] = time.time() - start_time
        return categories
    
    def get_featured_products(self, limit: int = 20) -> List[Dict]:
        """SELECT * FROM productos WHERE Stock = 'Con Stock' ORDER BY RANDOM() LIMIT ?"""
        import random
        
        start_time = time.time()
        
        with db_lock:
            available_products = self.indexes['by_stock'].get('Con Stock', [])
            if available_products:
                shuffled = available_products.copy()
                random.shuffle(shuffled)
                result = shuffled[:limit]
            else:
                result = []
        
        self.stats['last_query_time'] = time.time() - start_time
        return result
    
    def count_total(self) -> int:
        """SELECT COUNT(*) FROM productos"""
        with db_lock:
            return len(self.data)
    
    def count_by_categoria(self, categoria: str) -> int:
        """SELECT COUNT(*) FROM productos WHERE Categoria = ?"""
        with db_lock:
            return len(self.indexes['by_categoria'].get(categoria, []))
    
    def count_by_sub_categoria(self, sub_categoria: str) -> int:
        """SELECT COUNT(*) FROM productos WHERE `Sub Categoria` = ?"""
        with db_lock:
            return len(self.indexes['by_sub_categoria'].get(sub_categoria, []))
    
    def get_database_stats(self) -> Dict:
        """Obtener estadísticas de la base de datos"""
        return {
            'total_products': self.stats['total_products'],
            'categories_count': len(self.stats['categories']),
            'last_update': self.last_update.isoformat() if self.last_update else None,
            'last_query_time': self.stats['last_query_time'],
            'indexes_built': len(self.indexes) > 0
        }

# Instancia global
json_db = JSONDatabase()

def init_database():
    """Inicializar la base de datos JSON"""
    logger.info("🚀 Inicializando JSONDatabase...")
    
    # Cargar datos iniciales
    json_db.load_from_mysql()
    
    # Programar actualizaciones automáticas (comentado para desarrollo)
    # def update_database():
    #     logger.info("⏰ Actualizando base de datos JSON...")
    #     json_db.load_from_mysql()
    
    # schedule.every(UPDATE_INTERVAL).minutes.do(update_database)
    
    # def run_scheduler():
    #     while True:
    #         schedule.run_pending()
    #         time.sleep(1)
    
    # scheduler_thread = Thread(target=run_scheduler, daemon=True)
    # scheduler_thread.start()
    
    logger.info("✅ JSONDatabase inicializada correctamente")

def start_json_database():
    """Iniciar el sistema de base de datos JSON"""
    # Cargar datos iniciales desde archivo o MySQL
    if JSON_DB_FILE.exists():
        logger.info("📂 Archivo de base de datos encontrado, cargando...")
        json_db.load_from_file()
    else:
        logger.info("📂 No hay archivo de BD, cargando desde MySQL...")
        json_db.load_from_mysql()
    
    # Iniciar actualizador en background (comentado para desarrollo)
    # def update_database_periodically():
    #     schedule.every(UPDATE_INTERVAL).minutes.do(json_db.load_from_mysql)
    #     while True:
    #         schedule.run_pending()
    #         time.sleep(60)
    
    # updater_thread = Thread(target=update_database_periodically, daemon=True)
    # updater_thread.start()
    
    logger.info(f"🚀 Base de datos JSON iniciada con {json_db.count_total()} productos")

def load_from_file(self):
    """Cargar datos desde archivo JSON"""
    try:
        if not JSON_DB_FILE.exists():
            logger.info("📂 Archivo de base de datos no existe...")
            return self.load_from_mysql()
        
        with open(JSON_DB_FILE, 'r', encoding='utf-8') as f:
            file_data = json.load(f)
        
        with db_lock:
            self.data = file_data.get('products', [])
            self.last_update = datetime.fromisoformat(file_data.get('last_update', datetime.now().isoformat()))
            self._build_indexes()
            self._calculate_stats()
        
        logger.info(f"📚 Datos cargados desde archivo: {len(self.data)} productos")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error cargando desde archivo: {e}")
        return self.load_from_mysql()

# Agregar método load_from_file a la clase JSONDatabase
JSONDatabase.load_from_file = load_from_file

if __name__ == "__main__":
    init_database()