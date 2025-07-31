#!/usr/bin/env python3
"""
Script de inicio alternativo para Render
Maneja mejor los errores de inicialización y configuración
"""

import os
import sys
import time
from app import create_app

def main():
    """Función principal de inicio"""
    print("🚀 Iniciando aplicación Flask para Render...")
    
    try:
        # Configurar variables de entorno por defecto si no existen
        if not os.environ.get('PORT'):
            os.environ['PORT'] = '5001'
            print(f"📝 Puerto por defecto configurado: {os.environ['PORT']}")
        
        # Crear la aplicación
        print("🔧 Creando aplicación Flask...")
        app = create_app()
        
        # Obtener puerto
        port = int(os.environ.get('PORT', 5001))
        host = '0.0.0.0'
        
        print(f"✅ Aplicación creada exitosamente")
        print(f"🌐 Servidor iniciando en {host}:{port}")
        
        # Iniciar servidor
        app.run(
            host=host,
            port=port,
            debug=False,  # Deshabilitar debug en producción
            threaded=True
        )
        
    except Exception as e:
        print(f"❌ Error al iniciar la aplicación: {e}")
        print("🔍 Detalles del error:")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main() 