import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración base de la aplicación"""
    
    # Configuración de Base de Datos MySQL
    DB_HOST = os.getenv('DB_HOST')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_NAME = os.getenv('DB_NAME')
    
    # Configuración de Redis (Cache)
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    
    # Configuración de Flask
    SECRET_KEY = os.getenv('SECRET_KEY')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Configuración de puerto para Render
    PORT = int(os.environ.get('PORT', 5001))
    HOST = '0.0.0.0'
    
    @classmethod
    def validate_config(cls):
        """Validar que las variables críticas estén configuradas"""
        required_vars = {
            'DB_HOST': cls.DB_HOST,
            'DB_USER': cls.DB_USER,
            'DB_PASSWORD': cls.DB_PASSWORD,
            'DB_NAME': cls.DB_NAME,
            'SECRET_KEY': cls.SECRET_KEY
        }
        
        missing_vars = [var for var, value in required_vars.items() if not value]
        
        if missing_vars:
            raise ValueError(f"Variables de entorno requeridas no configuradas: {', '.join(missing_vars)}")
        
        return True
    
    # Configuración de Cache
    CACHE_TYPE = 'simple'  # Usar caché en memoria en lugar de Redis
    CACHE_DEFAULT_TIMEOUT = 300  # 5 minutos
    
    # Configuración de Rendimiento
    CACHE_TIMEOUT_PRODUCTOS = 600  # 10 minutos para productos
    CACHE_TIMEOUT_ESTADISTICAS = 300  # 5 minutos para estadísticas
    CACHE_TIMEOUT_INDICES = 1800  # 30 minutos para índices 