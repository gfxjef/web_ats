# Configuración del Entorno de Desarrollo

Esta guía describe cómo configurar el entorno de desarrollo tanto para el backend como para el frontend.

## Backend

El backend está construido con Flask. Para configurarlo, sigue estos pasos:

1.  **Crea un entorno virtual:**
    ```bash
    python -m venv venv
    ```
2.  **Activa el entorno virtual:**
    - En Windows:
      ```bash
      .\venv\Scripts\activate
      ```
    - En macOS/Linux:
      ```bash
      source venv/bin/activate
      ```
3.  **Instala las dependencias:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configura las variables de entorno:**
    - Crea un archivo `.env` en la raíz del backend, basándote en el archivo `.env.example`.
    - Asegúrate de que las siguientes variables estén definidas:
      - `DATABASE_URL`: La URL de conexión a tu base de datos.
      - `FLASK_ENV`: El entorno de Flask (ej. `development` o `production`).
      - `SECRET_KEY`: Una clave secreta para la aplicación.

## Frontend

El frontend está construido con Next.js. Para configurarlo, sigue estos pasos:

1.  **Instala las dependencias:**
    ```bash
    npm install
    ```
2.  **Configura las variables de entorno:**
    - Crea un archivo `.env.local` en la raíz del frontend, basándote en el archivo `.env.example`.
    - Asegúrate de que las siguientes variables estén definidas:
      - `NEXT_PUBLIC_API_URL`: La URL del backend (ej. `http://localhost:5000/api/v1`).
