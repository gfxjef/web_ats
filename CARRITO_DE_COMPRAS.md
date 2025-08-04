# Documentación del Carrito de Compras

Este documento detalla el funcionamiento completo del sistema de carrito de compras, desde la adición de un producto hasta el proceso de pago.

## 1. Estructura y Tecnologías

El carrito de compras está implementado en el frontend utilizando las siguientes tecnologías y patrones:

- **React y Next.js:** Para la construcción de la interfaz de usuario.
- **React Context API:** Para el manejo del estado global del carrito.
- **Custom Hooks:** Para abstraer y reutilizar la lógica del carrito.
- **TypeScript:** Para el tipado estático y la seguridad del código.
- **Tailwind CSS:** Para el diseño y los estilos de los componentes.
- **localStorage:** Para la persistencia del carrito entre sesiones.

### Archivos Clave

- **`frontend/contexts/cart-context.tsx`**:  Define el `CartProvider` y el `CartContext`, que proveen el estado y las funciones del carrito a toda la aplicación. También maneja la visibilidad del `CartSheet` (el panel lateral del carrito).
- **`frontend/hooks/use-cart.ts`**:  El corazón de la lógica del carrito. Este hook gestiona el estado de los `items`, calcula el `summary` (subtotal, impuestos, envío, total), y expone todas las acciones posibles (agregar, eliminar, actualizar, limpiar).
- **`frontend/app/cart/page.tsx`**: ~~Eliminada~~ - Se eliminó la página dedicada ya que el CartSheet lateral es suficiente.
- **`frontend/app/product/[id]/page.tsx`**:  La página de detalle de un producto, donde el usuario inicia la acción de "agregar al carrito".
- **`frontend/components/ui/cart-button.tsx`**:  Un botón reutilizable que muestra el ícono del carrito y el número de artículos. Al hacer clic, abre el `CartSheet`.
- **`frontend/components/ui/cart-sheet.tsx`**:  Un panel lateral (off-canvas) que muestra un resumen del carrito y permite acciones rápidas.
- **`frontend/components/ui/cart-item.tsx`**:  Un componente que renderiza cada producto dentro del carrito en el `CartSheet`.

## 2. Flujo de Funcionalidad

### 2.1. Agregar un Producto al Carrito

1.  **Inicio:** El usuario se encuentra en la página de un producto (`/product/[id]`).
2.  **Selección de Cantidad:** El usuario puede aumentar o disminuir la cantidad de unidades que desea comprar usando los botones `+` y `-`. El estado de la cantidad se maneja localmente en el componente `ProductPage`.
3.  **Acción de Agregar:** El usuario hace clic en el botón "Agregar al carrito".
4.  **Llamada al Contexto:** Se invoca la función `addItem` del `useCartContext`.
    -   `addItem(product, quantity)`: Esta función recibe el objeto del producto y la cantidad seleccionada.
5.  **Lógica en `use-cart.ts`**:
    -   La función `addItem` verifica si el producto ya existe en el carrito.
    -   **Si ya existe:** Actualiza la cantidad del producto existente, sumando la nueva cantidad. La cantidad total no puede exceder el `maxQuantityPerItem` (configurado en 50).
    -   **Si es nuevo:** Crea un nuevo objeto `CartItem`, guardando el precio actual (`unitPrice`) para mantener la consistencia del precio aunque este cambie después. Lo añade al array de `items`.
6.  **Persistencia:** Después de modificar los `items`, el hook `useCart` automáticamente guarda el estado actualizado del carrito en `localStorage` a través de la función `saveCart`. Esto asegura que el carrito no se pierda si el usuario recarga la página.
7.  **Feedback al Usuario:**
    -   Se muestra una notificación (toast) confirmando que el producto fue agregado.
    -   El `CartSheet` se abre automáticamente para mostrar el carrito actualizado, gracias a la función `openCart()` llamada después de agregar el producto.

### 2.2. Visualización del Carrito

El usuario puede ver el contenido de su carrito de dos maneras:

#### a) `CartSheet` (Panel Lateral)

-   **Activación:** Se abre al agregar un producto o al hacer clic en el `CartButton`.
-   **Contenido:**
    -   Muestra una lista de los productos en el carrito usando el componente `CartItem`.
    -   Presenta un resumen del pedido: subtotal, impuestos, costo de envío y total.
    -   Muestra una barra de progreso que indica cuánto falta para alcanzar el envío gratuito.
    -   Permite al usuario modificar la cantidad de cada producto o eliminarlo directamente desde el panel.
-   **Acciones:**
    -   **"Proceder al checkout"**: Redirige al usuario a la página de pago (`/checkout`).
    -   **"Ver carrito completo"**: Navega a la página `/cart`.
    -   **"Limpiar todo"**: Elimina todos los productos del carrito.

#### b) Página del Carrito (`/cart`)

-   **Acceso:** Se accede a través del enlace "Ver carrito completo" en el `CartSheet` o navegando directamente a la URL.
-   **Contenido:**
    -   Ofrece una vista más detallada y espaciosa que el `CartSheet`.
    -   Muestra la lista de productos con más detalles, usando una variante "detailed" del componente `CartItem`.
    -   Presenta un resumen completo del pedido, similar al del `CartSheet`.
    -   Incluye una sección de "Productos recomendados" para incentivar más compras.
-   **Estado Vacío:** Si no hay productos, la página muestra un mensaje amigable con enlaces para explorar categorías de productos.

### 2.3. Modificar y Eliminar Productos

-   **Actualizar Cantidad:**
    -   En `CartSheet` y `/cart`, el componente `CartItem` tiene controles `+` y `-`.
    -   Estos controles llaman a las funciones `incrementQuantity` y `decrementQuantity` del hook `useCart`.
    -   Estas funciones, a su vez, llaman a `updateQuantity(productId, newQuantity)`, que actualiza el estado `items`.
-   **Eliminar un Producto:**
    -   Cada `CartItem` tiene un botón de eliminar (ícono de `X` o `Trash2`).
    -   Al hacer clic, se llama a la función `removeItem(productId)` del hook `useCart`, que filtra el producto del array `items`.
-   **Limpiar el Carrito:**
    -   Tanto el `CartSheet` como la página `/cart` tienen un botón para "Limpiar carrito".
    -   Este botón invoca la función `clearCart()`, que establece el array `items` a un array vacío `[]`.

### 2.4. Cálculo de Precios y Resumen

El resumen del pedido (`summary`) se calcula de forma reactiva cada vez que el estado `items` cambia. Esto se logra usando el hook `useMemo` en `use-cart.ts`.

-   **Subtotal:** La suma del `unitPrice * quantity` de todos los productos.
-   **Impuestos (Tax):** Se calcula aplicando el `taxRate` (16%) al subtotal.
-   **Envío (Shipping):**
    -   Si el subtotal es mayor o igual al `freeShippingThreshold` (S/1,500), el envío es `0`.
    -   De lo contrario, se aplica el `shippingCost` (S/150).
-   **Total:** `subtotal + tax + shipping - discount`.

### 2.5. Persistencia de Datos

-   **Guardado:** La función `saveCart` se ejecuta automáticamente cada vez que el array `items` cambia (gracias a un `useEffect`). Serializa el estado del carrito a un string JSON y lo guarda en `localStorage` bajo la clave `liquor-ats-cart`.
-   **Carga:** La función `loadCart` se ejecuta cuando el `CartProvider` se monta por primera vez. Lee el JSON de `localStorage`, lo parsea y lo usa para inicializar el estado del carrito. Esto permite que el carrito persista entre visitas y recargas de página.

## 3. Diagrama de Flujo Simplificado

```mermaid
graph TD
    A[Usuario en Página de Producto] -->|Selecciona cantidad y hace clic en "Agregar"| B(Llama a `addItem` en `useCartContext`);
    B --> C{¿Producto ya existe?};
    C -->|Sí| D[Actualiza cantidad en `items`];
    C -->|No| E[Añade nuevo `CartItem` a `items`];
    D --> F(Actualiza `localStorage`);
    E --> F;
    F --> G[Muestra Toast de confirmación];
    G --> H[Abre `CartSheet` con carrito actualizado];

    subgraph "Visualización y Modificación"
        I[Usuario abre `CartSheet` o va a `/cart`] --> J[Renderiza `CartItem` por cada producto];
        J --> K{Acciones del Usuario};
        K -->|Cambia cantidad| L[Llama a `updateQuantity`];
        K -->|Elimina item| M[Llama a `removeItem`];
        K -->|Limpia carrito| N[Llama a `clearCart`];
        L --> O(Actualiza `items` y `localStorage`);
        M --> O;
        N --> O;
    end

    subgraph "Checkout"
        P[Usuario hace clic en "Proceder al pago"] --> Q[Navega a `/checkout`];
    end
```

## 4. Puntos de Mejora Potenciales

-   **Cupones de Descuento:** La estructura del `summary` ya incluye un campo `discount`, pero la lógica para aplicar cupones no está implementada. Se podría añadir un campo de input y una función para validar y aplicar descuentos.
-   **Sincronización con Backend:** Actualmente, el carrito vive solo en el cliente. Para usuarios autenticados, sería ideal sincronizar el carrito con una base de datos para que sea accesible desde múltiples dispositivos.
-   **Gestión de Stock:** La lógica actual solo muestra si un producto está "En Stock" o "Sin Stock", pero no impide agregar más unidades de las disponibles. Se podría mejorar la validación en `addItem` y `updateQuantity` para no exceder el stock real.
-   **Cálculo de Peso Real:** El peso del carrito (`getCartWeight`) se basa en un peso promedio por categoría. Para un cálculo de envío más preciso, se debería usar el peso real de cada producto si estuviera disponible en los datos.
