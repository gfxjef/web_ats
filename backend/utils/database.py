import mysql.connector
from mysql.connector import Error
import time
from flask import current_app
from config import Config

class DatabaseManager:
    """Gestor optimizado de conexiones a base de datos"""
    
    def __init__(self):
        self.config = {
            'host': Config.DB_HOST,
            'user': Config.DB_USER,
            'password': Config.DB_PASSWORD,
            'port': Config.DB_PORT,
            'database': Config.DB_NAME,
            'autocommit': True,
            'pool_name': 'licoreria_pool',
            'pool_size': 10,
            'pool_reset_session': True
        }
    
    def get_connection(self):
        """Obtener conexión optimizada a la base de datos"""
        try:
            connection = mysql.connector.connect(**self.config)
            return connection
        except Error as e:
            current_app.logger.error(f"Error de conexión a MySQL: {e}")
            raise
    
    def execute_query(self, query, params=None, fetch_all=True):
        """
        Ejecutar consulta optimizada con medición de tiempo
        """
        start_time = time.time()
        connection = None
        cursor = None
        
        try:
            connection = self.get_connection()
            cursor = connection.cursor(dictionary=True)
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if fetch_all:
                result = cursor.fetchall()
            else:
                result = cursor.fetchone()
            
            execution_time = time.time() - start_time
            
            return {
                'data': result,
                'execution_time': execution_time,
                'rows_affected': cursor.rowcount
            }
            
        except Error as e:
            current_app.logger.error(f"Error en consulta: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    
    def execute_explain(self, query, params=None):
        """
        Ejecutar EXPLAIN para verificar optimización de consultas
        """
        explain_query = f"EXPLAIN {query}"
        return self.execute_query(explain_query, params)
    
    def get_table_info(self, table_name='productos'):
        """
        Obtener información de la tabla y sus índices
        """
        # Obtener estructura de la tabla
        structure_query = f"DESCRIBE {table_name}"
        structure_result = self.execute_query(structure_query)
        
        # Obtener índices de la tabla
        indexes_query = f"SHOW INDEX FROM {table_name}"
        indexes_result = self.execute_query(indexes_query)
        
        return {
            'structure': structure_result['data'],
            'indexes': indexes_result['data'],
            'execution_time': structure_result['execution_time'] + indexes_result['execution_time']
        }

# Instancia global del gestor de base de datos
db_manager = DatabaseManager() 