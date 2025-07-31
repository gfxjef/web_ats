import os
import multiprocessing

# Configuración básica
bind = f"0.0.0.0:{os.environ.get('PORT', '5001')}"
workers = 1  # Un solo worker para evitar problemas de inicialización
worker_class = "sync"
worker_connections = 1000
timeout = 300
keepalive = 2

# Configuración de logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Configuración de preload
preload_app = True

# Configuración de workers
max_requests = 1000
max_requests_jitter = 100
graceful_timeout = 30

# Configuración de seguridad
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

def when_ready(server):
    """Callback cuando el servidor está listo"""
    server.log.info("🚀 Servidor Gunicorn listo para recibir conexiones")

def worker_int(worker):
    """Callback cuando un worker es interrumpido"""
    worker.log.info("⚠️ Worker interrumpido")

def pre_fork(server, worker):
    """Callback antes de crear un worker"""
    server.log.info(f"🔄 Creando worker {worker.pid}")

def post_fork(server, worker):
    """Callback después de crear un worker"""
    server.log.info(f"✅ Worker {worker.pid} creado exitosamente")

def post_worker_init(worker):
    """Callback después de inicializar un worker"""
    worker.log.info(f"🎯 Worker {worker.pid} inicializado y listo") 