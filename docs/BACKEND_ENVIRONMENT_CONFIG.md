# 🔧 Configuración de Variables de Entorno - Backend

## 📋 Descripción

Este documento explica cómo configurar las variables de entorno para el backend Flask del proyecto web_ats, asegurando que no haya datos sensibles hardcodeados en el código.

## 🎯 Variables de Entorno del Backend

### Archivo: `backend/.env`

```env
# Database Configuration
DB_HOST=atusaludlicoreria.com
DB_USER=atusalud_atusalud
DB_PASSWORD=kmachin1
DB_PORT=3306
DB_NAME=atusalud_base1

# Flask Configuration
SECRET_KEY=licoreria_ats_secret_key_2024
FLASK_DEBUG=True

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Production Example:
# DB_HOST=production-db.example.com
# DB_USER=prod_user
# DB_PASSWORD=secure_password_123
# SECRET_KEY=your_super_secure_secret_key_here
# FLASK_DEBUG=False
```

### Variables Críticas (Requeridas)

| Variable | Descripción | Desarrollo | Producción |
|----------|-------------|------------|------------|
| `DB_HOST` | Host de la base de datos MySQL | `atusaludlicoreria.com` | `production-db.example.com` |
| `DB_USER` | Usuario de la base de datos | `atusalud_atusalud` | `prod_user` |
| `DB_PASSWORD` | Contraseña de la base de datos | `kmachin1` | `secure_password_123` |
| `DB_NAME` | Nombre de la base de datos | `atusalud_base1` | `prod_database` |
| `SECRET_KEY` | Clave secreta de Flask | `licoreria_ats_secret_key_2024` | `super_secure_key` |

### Variables Opcionales

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DB_PORT` | Puerto de MySQL | `3306` |
| `REDIS_HOST` | Host de Redis | `localhost` |
| `REDIS_PORT` | Puerto de Redis | `6379` |
| `REDIS_DB` | Base de datos Redis | `0` |
| `FLASK_DEBUG` | Modo debug de Flask | `True` |

## 🚀 Cómo Cambiar Entre Entornos

### Desarrollo → Producción

1. **Editar el archivo `backend/.env`:**
   ```env
   # Cambiar de:
   DB_HOST=atusaludlicoreria.com
   DB_USER=atusalud_atusalud
   DB_PASSWORD=kmachin1
   SECRET_KEY=licoreria_ats_secret_key_2024
   FLASK_DEBUG=True
   
   # A:
   DB_HOST=production-db.example.com
   DB_USER=prod_user
   DB_PASSWORD=secure_password_123
   SECRET_KEY=your_super_secure_secret_key_here
   FLASK_DEBUG=False
   ```

2. **Reiniciar la aplicación:**
   ```bash
   cd backend
   python3 app.py
   ```

### Producción → Desarrollo

1. **Editar el archivo `backend/.env`:**
   ```env
   # Cambiar de:
   DB_HOST=production-db.example.com
   DB_USER=prod_user
   DB_PASSWORD=secure_password_123
   SECRET_KEY=your_super_secure_secret_key_here
   FLASK_DEBUG=False
   
   # A:
   DB_HOST=atusaludlicoreria.com
   DB_USER=atusalud_atusalud
   DB_PASSWORD=kmachin1
   SECRET_KEY=licoreria_ats_secret_key_2024
   FLASK_DEBUG=True
   ```

2. **Reiniciar la aplicación:**
   ```bash
   cd backend
   python3 app.py
   ```

## 🔧 Implementación Técnica

### Validación de Configuración

El backend incluye validación automática de variables críticas:

```python
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
```

### Carga Automática

La aplicación valida la configuración al iniciar:

```python
def create_app():
    # Validar configuración antes de crear la app
    try:
        Config.validate_config()
        print("✅ Configuración validada correctamente")
    except ValueError as e:
        print(f"❌ Error en configuración: {e}")
        print("📝 Asegúrate de que el archivo .env esté configurado correctamente")
        raise
```

## 🧪 Pruebas

### Script de Prueba

Ejecutar el script de prueba para verificar la configuración:

```bash
cd backend
python3 test_env_config.py
```

### Salida Esperada

```
🧪 PROBANDO CONFIGURACIÓN DE VARIABLES DE ENTORNO - BACKEND
============================================================

🔧 Variables de entorno cargadas:
----------------------------------------
✅ DB_HOST: atusaludlicoreria.com
✅ DB_USER: atusalud_atusalud
✅ DB_PASSWORD: ********
✅ DB_NAME: atusalud_base1
✅ SECRET_KEY: *****************************

🔍 Validando configuración:
----------------------------------------
✅ Configuración válida - Todas las variables críticas están configuradas

🎉 ¡Configuración del backend funcionando correctamente!
```

## 🔒 Seguridad

### Variables Sensibles

- **Contraseñas**: Siempre en variables de entorno
- **Claves secretas**: Nunca en el código
- **Credenciales de DB**: Solo en `.env`

### Archivos de Configuración

| Archivo | Propósito | Git |
|---------|-----------|-----|
| `.env` | Variables reales | ❌ No subir |
| `.env.example` | Template/documentación | ✅ Subir |

### Validación de Seguridad

```python
# ❌ ANTES (inseguro):
DB_PASSWORD = 'kmachin1'  # Hardcodeado

# ✅ AHORA (seguro):
DB_PASSWORD = os.getenv('DB_PASSWORD')  # Desde .env
```

## 🚀 Despliegue

### Docker

1. **Crear Dockerfile:**
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["python3", "app.py"]
   ```

2. **Variables de entorno en Docker:**
   ```bash
   docker run -e DB_HOST=prod-db -e DB_PASSWORD=secure_pass app
   ```

### Heroku

1. **Configurar variables en Heroku:**
   ```bash
   heroku config:set DB_HOST=production-db.example.com
   heroku config:set DB_PASSWORD=secure_password_123
   heroku config:set SECRET_KEY=your_super_secure_secret_key_here
   ```

2. **Deploy:**
   ```bash
   git push heroku main
   ```

### VPS/Server

1. **Crear archivo .env en servidor:**
   ```bash
   # En el servidor
   nano .env
   # Agregar variables de producción
   ```

2. **Usar systemd para servicio:**
   ```ini
   [Unit]
   Description=Web ATS Backend
   
   [Service]
   WorkingDirectory=/path/to/backend
   EnvironmentFile=/path/to/backend/.env
   ExecStart=/usr/bin/python3 app.py
   
   [Install]
   WantedBy=multi-user.target
   ```

## 📝 Notas Importantes

1. **Validación automática**: La app no inicia si faltan variables críticas
2. **Sin valores por defecto**: Variables críticas no tienen fallbacks inseguros
3. **Logging seguro**: Contraseñas se ocultan en logs
4. **Reinicio necesario**: Después de cambiar `.env`, reiniciar la app

## 🔍 Troubleshooting

### Problema: Variables no se cargan
```bash
# Verificar archivo .env
cat backend/.env

# Verificar que python-dotenv esté instalado
pip install python-dotenv
```

### Problema: Error de validación
```bash
# Ejecutar script de prueba
python3 test_env_config.py

# Verificar variables faltantes
echo $DB_HOST
echo $DB_PASSWORD
```

### Problema: Conexión a base de datos
```bash
# Verificar conectividad
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1;"

# Verificar configuración
python3 -c "from config import Config; print(Config.DB_HOST)"
```

### Problema: CORS en producción
```python
# En backend/app.py, configurar CORS para producción
CORS(app, resources={r"/api/*": {"origins": ["https://tudominio.com"]}})
```

## 🎯 Beneficios de la Implementación

### ✅ Seguridad Mejorada
- Sin credenciales hardcodeadas
- Validación automática de configuración
- Variables sensibles ocultas en logs

### ✅ Flexibilidad
- Cambio fácil entre entornos
- Configuración centralizada
- Compatible con múltiples plataformas

### ✅ Mantenibilidad
- Código limpio sin datos sensibles
- Documentación completa
- Scripts de prueba automatizados

### ✅ DevOps Ready
- Listo para CI/CD
- Compatible con Docker, Heroku, VPS
- Variables de entorno en plataformas de hosting 