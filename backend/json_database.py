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
        
    def load_from_mysql(self):
        """Cargar todos los datos desde MySQL"""
        try:
            logger.info("🔄 Intentando cargar datos desde MySQL...")
            start_time = time.time()
            
            # En producción sin MySQL, usar datos de respaldo
            if os.getenv('FLASK_ENV') == 'production' and not os.getenv('DB_HOST'):
                logger.warning("⚠️ MySQL no configurado en producción, usando datos de respaldo")
                return self._load_backup_data()
            
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Obtener TODOS los productos
            cursor.execute("SELECT * FROM productos ORDER BY id")
            products = cursor.fetchall()
            
            # Convertir valores None a cadenas vacías y limpiar datos
            cleaned_products = []
            for product in products:
                cleaned_product = {}
                for key, value in product.items():
                    if value is None:
                        cleaned_product[key] = ""
                    elif isinstance(value, (int, float)):
                        cleaned_product[key] = value
                    else:
                        cleaned_product[key] = str(value).strip()
                cleaned_products.append(cleaned_product)
            
            with db_lock:
                self.data = cleaned_products
                self.last_update = datetime.now()
                self._build_indexes()
                self._calculate_stats()
            
            close_db_connection(conn)
            
            load_time = time.time() - start_time
            logger.info(f"✅ Datos cargados: {len(self.data)} productos en {load_time:.2f}s")
            
            # Guardar en archivo JSON
            self._save_to_file()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error cargando desde MySQL: {e}")
            return False
    
    def load_from_file(self):
        """Cargar datos desde archivo JSON"""
        try:
            if not JSON_DB_FILE.exists():
                logger.info("📂 Archivo de base de datos no existe...")
                # En producción, usar datos de respaldo si no hay MySQL
                if os.getenv('FLASK_ENV') == 'production':
                    logger.info("🔄 Usando datos de respaldo para producción")
                    return self._load_backup_data()
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
            # En producción, usar datos de respaldo
            if os.getenv('FLASK_ENV') == 'production':
                return self._load_backup_data()
            return self.load_from_mysql()
    
    def _load_backup_data(self):
        """Cargar datos de respaldo para producción sin MySQL"""
        logger.info("📦 Cargando datos de respaldo...")
        
        # Datos de ejemplo para producción
        backup_products = [
            {
                'id': 1,
                'SKU': 'DEMO001',
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
    
    def get_by_categoria(self, categoria: str, limit: Optional[int] = None, offset: int = 0) -> List[Dict]:
        """SELECT * FROM productos WHERE Categoria = ? LIMIT ? OFFSET ?"""
        start_time = time.time()
        
        with db_lock:
            products = self.indexes['by_categoria'].get(categoria, [])
            if limit:
                result = products[offset:offset + limit]
            else:
                result = products[offset:]
        
        self.stats['last_query_time'] = time.time() - start_time
        return result
    
    def get_by_sub_categoria(self, sub_categoria: str, limit: Optional[int] = None, offset: int = 0) -> List[Dict]:
        """SELECT * FROM productos WHERE `Sub Categoria` = ? LIMIT ? OFFSET ?"""
        start_time = time.time()
        
        with db_lock:
            products = self.indexes['by_sub_categoria'].get(sub_categoria, [])
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
    
    def search_by_name(self, query: str, limit: Optional[int] = None) -> List[Dict]:
        """SELECT * FROM productos WHERE Nombre LIKE '%query%'"""
        start_time = time.time()
        
        query = query.lower()
        results = []
        
        with db_lock:
            for product in self.data:
                if query in product['Nombre'].lower():
                    results.append(product)
                    if limit and len(results) >= limit:
                        break
        
        self.stats['last_query_time'] = time.time() - start_time
        return results
    
    def get_categories(self) -> List[Dict]:
        """SELECT Categoria, COUNT(*) as total FROM productos GROUP BY Categoria"""
        start_time = time.time()
        
        with db_lock:
            categories = []
            for categoria, count in self.stats['categories'].items():
                categories.append({
                    'Categoria': categoria,
                    'total_productos': count
                })
        
        self.stats['last_query_time'] = time.time() - start_time
        return categories
    
    def get_featured_products(self, limit: int = 20) -> List[Dict]:
        """SELECT * FROM productos WHERE Stock = 'Con Stock' ORDER BY RANDOM() LIMIT ?"""
        import random
        
        start_time = time.time()
        
        with db_lock:
            stock_products = self.indexes['by_stock'].get('Con Stock', [])
            if len(stock_products) <= limit:
                result = stock_products.copy()
            else:
                result = random.sample(stock_products, limit)
        
        self.stats['last_query_time'] = time.time() - start_time
        return result
    
    def count_total(self) -> int:
        """SELECT COUNT(*) FROM productos"""
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
            'last_query_time_ms': self.stats['last_query_time'] * 1000,
            'file_size_mb': JSON_DB_FILE.stat().st_size / 1024 / 1024 if JSON_DB_FILE.exists() else 0,
            'indexes_built': len(self.indexes)
        }

# Instancia global
json_db = JSONDatabase()

def update_database_periodically():
    """Actualizar la base de datos periódicamente"""
    schedule.every(UPDATE_INTERVAL).minutes.do(json_db.load_from_mysql)
    
    # Carga inicial
    json_db.load_from_file()
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Verificar cada minuto

def start_json_database():
    """Iniciar el sistema de base de datos JSON"""
    # Cargar datos iniciales
    json_db.load_from_file()
    
    # Iniciar actualizador en background
    updater_thread = Thread(target=update_database_periodically, daemon=True)
    updater_thread.start()
    
    logger.info(f"🚀 Base de datos JSON iniciada con {json_db.count_total()} productos")

if __name__ == "__main__":
    # Ejemplo de uso
    print("Iniciando base de datos JSON...")
    
    # Cargar datos
    json_db.load_from_mysql()
    
    # Ejemplos de consultas
    print(f"\n📊 Total productos: {json_db.count_total()}")
    
    print(f"\n🍺 Productos de CERVEZA: {json_db.count_by_categoria('CERVEZA')}")
    cervezas = json_db.get_by_categoria('CERVEZA', limit=3)
    for cerveza in cervezas:
        print(f"  - {cerveza['Nombre']} ({cerveza['Tamaño']})")
    
    print(f"\n🔍 Búsqueda 'Pilsen':")
    pilsen_products = json_db.search_by_name('Pilsen', limit=3)
    for product in pilsen_products:
        print(f"  - {product['Nombre']} - ₹{product['Precio B']}")
    
    print(f"\n⭐ Productos destacados:")
    featured = json_db.get_featured_products(5)
    for product in featured:
        print(f"  - {product['Nombre']} ({product['Categoria']})")
    
    print(f"\n📈 Estadísticas:")
    stats = json_db.get_database_stats()
    print(f"  - Total productos: {stats['total_products']}")
    print(f"  - Categorías: {stats['categories_count']}")
    print(f"  - Tamaño archivo: {stats['file_size_mb']:.2f} MB")
    print(f"  - Última consulta: {stats['last_query_time_ms']:.2f} ms")