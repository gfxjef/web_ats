
import json
import os
import time
import logging
from pathlib import Path
from utils.database import get_db_connection, close_db_connection

# --- Configuración ---
# Obtener la ruta del directorio 'backend'
backend_dir = Path(__file__).parent 
# Construir la ruta al archivo JSON
JSON_DB_FILE = backend_dir / "database" / "productos_db.json"

# Configuración del logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def fetch_and_save_products():
    """
    Obtiene todos los productos de la base de datos MySQL y los guarda 
    en el archivo productos_db.json.
    """
    logger.info("--- Iniciando actualización manual de productos_db.json ---")
    
    conn = None
    try:
        # 1. Conectar a la base de datos
        logger.info("🔄 Conectando a la base de datos MySQL...")
        conn = get_db_connection()
        if not conn:
            logger.error("❌ No se pudo establecer conexión con la base de datos. Revisa las variables de entorno.")
            return

        cursor = conn.cursor(dictionary=True)
        
        # 2. Obtener todos los productos
        logger.info("📦 Obteniendo todos los productos de la tabla 'productos'...")
        start_time = time.time()
        cursor.execute("SELECT * FROM productos ORDER BY id")
        products = cursor.fetchall()
        load_time = time.time() - start_time
        logger.info(f"✅ Se encontraron {len(products)} productos en {load_time:.2f} segundos.")
        
        # 3. Limpiar y procesar los datos
        logger.info("✨ Limpiando y procesando los datos...")
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
        
        # 4. Guardar los datos en el archivo JSON
        logger.info(f"💾 Guardando datos en: {JSON_DB_FILE}")
        
        # Asegurarse de que el directorio 'database' exista
        JSON_DB_FILE.parent.mkdir(exist_ok=True)
        
        file_data = {
            'products': cleaned_products,
            'last_update': time.strftime('%Y-%m-%dT%H:%M:%S'),
            'total_products': len(cleaned_products)
        }
        
        with open(JSON_DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(file_data, f, ensure_ascii=False, indent=4)
            
        logger.info("🎉 ¡Éxito! El archivo productos_db.json ha sido actualizado.")

    except Exception as e:
        logger.error(f"❌ Ocurrió un error inesperado: {e}")
    finally:
        # 5. Cerrar la conexión
        if conn:
            close_db_connection(conn)
            logger.info("🔌 Conexión a la base de datos cerrada.")
        logger.info("--- Proceso de actualización finalizado ---")

if __name__ == "__main__":
    # Para ejecutar este script, asegúrate de que las variables de entorno 
    # para la base de datos (DB_HOST, DB_USER, etc.) estén configuradas.
    # Puedes crear un archivo .env en el directorio 'backend' si no lo tienes.
    fetch_and_save_products()
