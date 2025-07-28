import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración base de la aplicación"""
    
    # Configuración de Base de Datos MySQL
    DB_HOST = os.getenv('DB_HOST', 'atusaludlicoreria.com')
    DB_USER = os.getenv('DB_USER', 'atusalud_atusalud')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'kmachin1')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_NAME = os.getenv('DB_NAME', 'atusalud_base1')
    
    # Configuración de Redis (Cache)
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    
    # Configuración de Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'licoreria_ats_secret_key_2024')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Configuración de Cache
    CACHE_TYPE = 'simple'  # Usar caché en memoria en lugar de Redis
    CACHE_DEFAULT_TIMEOUT = 300  # 5 minutos
    
    # Configuración de Rendimiento
    CACHE_TIMEOUT_PRODUCTOS = 600  # 10 minutos para productos
    CACHE_TIMEOUT_ESTADISTICAS = 300  # 5 minutos para estadísticas
    CACHE_TIMEOUT_INDICES = 1800  # 30 minutos para índices 