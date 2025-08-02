Issue #1: Implementación del Sistema de Diseño y Componentes Base
Título: [Core] Implementar Sistema de Diseño y Componente Button
Descripción: Configurar las variables globales del sistema de diseño (tokens de CSS/SCSS) y crear los componentes de UI más fundamentales. El objetivo es establecer una base consistente para toda la aplicación.
Tareas Técnicas:
[ ] Tokens de Diseño: Definir y exportar variables globales para colores, tipografía, espaciado y border-radius.
[ ] Grid Responsiva: Establecer el sistema de rejilla (ej. a través de mixins de SCSS o clases de utilidad).
[ ] Componente Button: Crear un componente Button que acepte props para variantes (primary, secondary), tamaño y estado (disabled). Debe gestionar internamente los pseudo-estados :hover, :active.
[ ] Storybook: Configurar un entorno de Storybook e crear historias iniciales para el componente Button para documentar sus variantes y estados.
Issue #2: Implementación de Componentes de Carga (Skeleton)
Título: [Component] Crear Componentes de Carga Esquelética
Descripción: Desarrollar componentes "esqueleto" reutilizables que sirvan como placeholders visuales mientras se espera una respuesta de la API. Esto previene cambios de layout y mejora la percepción del rendimiento.
Tareas Técnicas:
[ ] Componente Skeleton Base: Crear un componente Skeleton genérico que renderice un div con una animación de pulso o barrido. Debe aceptar props para width y height.
[ ] Componente ProductCardSkeleton: Crear un componente que utilice el Skeleton base para construir la estructura de una tarjeta de producto (placeholder para imagen, título y precio).
[ ] Integración: Crear un mecanismo (ej. un HOC o una prop isLoading) para que los componentes que muestran listas puedan renderizar fácilmente una cantidad n de ProductCardSkeleton.
Issue #3: Lógica de Paginación en Vistas de Listado
Título: [Feature] Implementar Paginación "Cargar Más" para Listas de Productos
Descripción: Implementar la lógica de paginación en las vistas de listado de productos (ej. página de categoría) utilizando un botón "Cargar Más". La lógica debe consumir los metadatos de paginación (limit, offset, has_more) de la API.
Tareas Técnicas:
[ ] Gestión de Estado: El componente de listado debe gestionar el estado de los productos acumulados, el offset actual y el booleano has_more.
[ ] Manejo de Eventos: Al hacer clic en el botón "Cargar Más", disparar una nueva llamada a la API con el offset actualizado.
[ ] Actualización de UI: Añadir los nuevos productos a la lista existente sin reemplazar los antiguos.
[ ] Lógica Condicional: El botón "Cargar Más" debe ocultarse o deshabilitarse cuando has_more sea false. Mostrar un estado de carga en el botón durante la llamada a la API.
Issue #4: Sistema de Notificaciones Global (Toasts)
Título: [Core] Implementar Sistema de Notificaciones Global (Toast)
Descripción: Crear un sistema para mostrar notificaciones no intrusivas ("toasts") al usuario en respuesta a acciones, como agregar un producto al pedido. El sistema debe ser invocable desde cualquier parte de la aplicación.
Tareas Técnicas:
[ ] Componente Toast: Crear un componente para la notificación individual, que acepte props para el mensaje y el tipo (ej. success, error).
[ ] Componente ToastContainer: Crear un contenedor, usualmente posicionado de forma fija en la pantalla (ej. top-right), que gestione la cola de notificaciones.
[ ] Servicio o Contexto Global: Exponer una función (ej. showToast('Mensaje', 'success')) a través de un Contexto de React o un servicio inyectable (en Angular/Vue) para que cualquier componente pueda disparar una notificación.
[ ] Lógica de Descarte: Las notificaciones deben eliminarse automáticamente después de un timeout.
Issue #5: Implementación de la Funcionalidad de Búsqueda con Debounce
Título: [Feature] Implementar Componente de Búsqueda con Debounce y Desplegable de Resultados
Descripción: Desarrollar el componente de la barra de búsqueda para que realice llamadas a un endpoint de búsqueda a medida que el usuario escribe, utilizando una técnica de "debounce" para optimizar el rendimiento.
Tareas Técnicas:
[ ] Hook useDebounce: Crear un hook personalizado que tome un valor y un retraso, y devuelva el valor "debounced".
[ ] Componente SearchBar:
Utilizar el hook useDebounce sobre la entrada del usuario.
Disparar una llamada al endpoint GET /productos/buscar?q={termino} usando el valor "debounced".
Gestionar el estado de carga (isLoading) y los resultados.
[ ] Componente SearchResultsDropdown: Renderizar la lista de resultados recibida de la API o los mensajes de estado correspondientes (cargando, sin resultados, error).
Issue #6: Módulo de Productos Relacionados en Página de Detalle
Título: [Feature] Añadir Módulo de Productos Relacionados en Vista de Producto
Descripción: En la página de detalle de un producto, implementar un módulo que muestre una lista de otros productos basados en la misma subcategoría (venta cruzada).
Tareas Técnicas:
[ ] Lógica de Fetching Secundario: Después de obtener los datos del producto principal, extraer su Sub Categoria.
[ ] Realizar una segunda llamada al endpoint GET /productos/sub_categorias/{valor}.
[ ] Filtrado de Datos: Excluir el producto actual de la lista de resultados para evitar duplicados.
[ ] Renderizado del Módulo: Renderizar una sección separada con la lista de productos relacionados. Esta carga no debe bloquear el renderizado del producto principal.
Issue #7: Implementación del Flujo de Finalización del Pedido
Título: [Feature] Implementar Lógica de Finalización de Pedido y Generación de URL de WhatsApp
Descripción: Desarrollar la funcionalidad final en la página /pedido, incluyendo la selección de modalidad, validación de reglas de negocio y la construcción de la URL de wa.me.
Tareas Técnicas:
[ ] Componente de Selección: Crear el selector para "Recojo en Tienda" vs. "Delivery".
[ ] Validación de Lógica de Negocio: Implementar la función que verifica si el subtotal del pedido es >= 30 cuando la modalidad es "Delivery". El resultado de esta validación controlará el estado disabled del botón de confirmación.
[ ] Función de Formateo: Crear una función generateWhatsAppPayload(pedido) que tome el objeto del pedido y lo transforme en el string de texto formateado.
[ ] Codificación de URL: Asegurarse de que el payload de texto sea correctamente codificado usando encodeURIComponent() antes de concatenarlo a la URL de wa.me.
[ ] Manejo de Eventos: Al hacer clic en el botón de confirmación, ejecutar el formateo, la codificación y la redirección.
Plan de Issues Reorganizado (Con Páginas Contenedoras)
Empezamos con los fundamentos (Core), luego construimos las páginas principales (Views/Pages) y finalmente las funcionalidades complejas (Features).
Bloque 1: Fundamentos (Sin cambios)
Issue #1: [Core] Implementar Sistema de Diseño y Componente Button
Issue #2: [Component] Crear Componentes de Carga Esquelética
Issue #3: [Core] Implementar Sistema de Notificaciones Global (Toast)
Bloque 2: Construcción de Vistas Principales (NUEVOS ISSUES)
Aquí es donde ensamblamos las piezas.
Issue #4: Creación de la Vista de Categorías y Filtros
Título: [View] Crear Página de Listado de Productos por Categoría
Descripción: Desarrollar la página principal para la exploración de productos, que se activará al navegar a rutas como /categoria/cervezas. Esta vista debe mostrar una cuadrícula de productos, permitir la paginación y presentar las opciones de filtrado.
Dependencias: Issue #2 (Skeletons), Issue #8 (Lógica de Paginación - lo renumeraremos).
Tareas Técnicas:
[ ] Routing: Asegurarse de que la página se renderice para rutas dinámicas /categoria/:nombreCategoria.
[ ] Layout de Página: Diseñar un layout de dos columnas (en desktop): una columna principal para la cuadrícula de productos y una barra lateral (sidebar) para los filtros. En móvil, los filtros pueden estar detrás de un botón que abre un modal o un drawer.
[ ] Componente ProductGrid: Crear un componente que reciba una lista de productos y los renderice en una cuadrícula responsiva.
[ ] Componente FilterSidebar:
Maquetar la sección de filtros.
Poblar dinámicamente las opciones de filtro (ej. subcategorías, tamaños) haciendo las llamadas a la API correspondientes si es necesario.
Integración de Datos:
Al cargar la página, obtener el :nombreCategoria de la URL.
Realizar la llamada inicial a la API GET /productos/categorias/{nombreCategoria}.
Mostrar los componentes ProductCardSkeleton mientras los datos cargan.
Renderizar la ProductGrid con los datos recibidos.
Integrar la lógica de "Cargar Más" al final de la cuadrícula.
Issue #5: Creación de la Vista de Detalle de Producto
Título: [View] Crear Página de Detalle de Producto con Productos Relacionados
Descripción: Desarrollar la vista para un único producto, que se mostrará en rutas como /producto/123. Esta página debe mostrar toda la información detallada del producto principal y, debajo, una sección de productos relacionados.
Dependencias: Issue #2 (Skeletons), Issue #9 (Módulo de Relacionados - lo renumeraremos).
Tareas Técnicas:
[ ] Routing: Configurar la ruta dinámica /producto/:productoId.
[ ] Layout de Página: Crear un layout de dos columnas en desktop (galería de imágenes a la izquierda, información y acciones a la derecha). En móvil, el layout debe ser de una sola columna, vertical.
[ ] Componente ProductGallery: Crear un componente para mostrar la imagen principal del producto y posibles miniaturas.
[ ] Componente ProductInfo: Crear un componente que muestre el nombre, precio (Precio B), descripción y otros detalles del producto.
[ ] Componente AddToCartForm: Crear un componente que contenga el selector de cantidad y el botón "Agregar a Mi Pedido", encapsulando la lógica de stock (Cantidad > 0).
Integración de Datos:
Al cargar la página, obtener el :productoId de la URL.
Llamar a la API GET /productos/{producto_id}.
Mostrar una versión esquelética de la página de detalle durante la carga.
Una vez cargado el producto principal, renderizar todos sus datos.
Integrar el Módulo de Productos Relacionados en la parte inferior de la página.
Bloque 3: Implementación de Funcionalidades Complejas (Issues Reorganizados)
Ahora que tenemos las "páginas", podemos añadirles las funcionalidades complejas.
Issue #6: Lógica de Paginación en Vistas de Listado (Antes #3)
Título: [Feature] Implementar Paginación "Cargar Más" para Listas de Productos
Descripción: (Sin cambios) Implementar la lógica de paginación...
Issue #7: Lógica de Aplicación de Filtros
Título: [Feature] Implementar Lógica de Aplicación de Filtros en la Página de Categoría
Descripción: Dar funcionalidad a la FilterSidebar creada en el Issue #4. Al seleccionar un filtro, se debe realizar una nueva llamada a la API y actualizar la cuadrícula de productos.
Tareas Técnicas:
[ ] Gestión de Estado de Filtros: El componente padre de la vista de categoría debe gestionar un estado con los filtros activos (ej. { subcategoria: 'Añejo', tamaño: '750 ML' }).
[ ] Manejo de Eventos: Cuando un usuario selecciona una opción en la FilterSidebar, se debe actualizar el estado de los filtros.
[ ] Disparo de API: Utilizar un useEffect que observe los cambios en el estado de los filtros. Cuando cambie, debe construir y ejecutar la llamada a la API correspondiente (ej. GET /productos/sub_categorias/Añejo?tamaño=750%20ML).
[ ] Actualización de UI: La ProductGrid debe limpiarse y mostrar los nuevos resultados. Se debe reiniciar la paginación.
Issue #8: Implementación de la Búsqueda con Debounce (Antes #5)
Título: [Feature] Implementar Componente de Búsqueda con Debounce y Desplegable
Descripción: (Sin cambios) Desarrollar el componente de la barra de búsqueda...
Issue #9: Módulo de Productos Relacionados (Antes #6)
Título: [Feature] Añadir Módulo de Productos Relacionados en Vista de Producto
Descripción: (Sin cambios) En la página de detalle de un producto, implementar un módulo que muestre otros productos...
Issue #10: Sistema de Carrito Temporal y Finalización de Pedido
Título: [Core Feature] Implementar Sistema de Carrito Temporal y Flujo de Finalización
Descripción: Este issue unifica toda la lógica de compra. Abarca desde agregar un producto al carrito temporal, gestionar su estado, hasta la página de revisión del pedido y la generación final de la URL de WhatsApp.
Tareas Técnicas:
[ ] Gestor de Estado Global (Contexto/Zustand/etc.): Crear un "store" para el carrito que exponga el estado (items) y las acciones (addItem, updateItemQuantity, removeItem, clearCart).
[ ] Integración en AddToCartForm: Al agregar un producto, llamar a la acción addItem del store y disparar una notificación toast.
[ ] Creación de la Vista /pedido:
Esta página se suscribe al estado del carrito.
Debe renderizar la lista de ítems, permitiendo su modificación (llamando a las acciones del store).
Debe mostrar el subtotal calculado.
[ ] Implementar el Flujo de Finalización: Integrar en esta misma página la lógica del Issue #7 original (selección de modalidad, validación de monto y generación de URL de WhatsApp).
Esta nueva estructura es más lógica desde el punto de vista del desarrollo:
Fundamentos: Construyes tus herramientas y ladrillos.
Vistas: Construyes los muros y las habitaciones (las páginas principales).
Funcionalidades: Amueblas las habitaciones y les das su propósito (añades la lógica compleja).
