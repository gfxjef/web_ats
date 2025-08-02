# Guía de Integración

Esta guía proporciona instrucciones sobre cómo integrar diferentes componentes y funcionalidades en el proyecto.

## Integración Frontend-Backend

La comunicación entre el frontend (Next.js) y el backend (Flask) se realiza a través de una API RESTful. El frontend realiza solicitudes HTTP al backend para obtener y enviar datos.

- **URL de la API:** La URL base de la API se define en la variable de entorno `NEXT_PUBLIC_API_URL` en el frontend.
- **Endpoints:** Consulta la `API_DOCUMENTATION.md` para obtener una lista completa de los endpoints disponibles.

## Integración de Nuevos Productos

Para agregar nuevos tipos de productos (como "Combos" o "Whiskies"), sigue estos pasos:

1.  **Backend:**
    - Si es necesario, crea un nuevo endpoint en `backend/api/v1/endpoints/productos.py` para la nueva categoría o subcategoría.
    - Asegúrate de que el `producto_service` en `backend/services/producto_service.py` tenga la lógica necesaria para manejar la nueva categoría.
2.  **Frontend:**
    - Crea una nueva página o componente en el frontend para mostrar los nuevos productos.
    - Utiliza los hooks existentes (como `use-filters` y `use-pagination`) para interactuar con la API.

## Recomendaciones Generales

- **Consistencia:** Mantén la consistencia en el estilo de código y la estructura del proyecto.
- **Pruebas:** Escribe pruebas para cualquier nueva funcionalidad que agregues.
- **Documentación:** Actualiza la documentación para reflejar cualquier cambio que realices.
