# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Gestión de Issues con GitHub
**IMPORTANTE**: Solo crea issues en GitHub cuando el usuario EXPLÍCITAMENTE te pida que lo hagas con frases como:
- "Crea issues para..."
- "Genera issues de..."
- "Necesito issues para..."
- "Hazme issues sobre..."

**NO CREAR ISSUES** automáticamente cuando el usuario simplemente pida ayuda con tareas de desarrollo normal.

### Cuando SÍ crear issues:
```
Usuario: "Crea issues para implementar un sistema de autenticación"
Usuario: "Genera issues para las tareas pendientes del proyecto"
```

### Cuando NO crear issues:
```
Usuario: "Ayúdame a implementar autenticación"
Usuario: "Necesito agregar una nueva funcionalidad"
```

### Comandos disponibles para issues:
- `gh issue create --title "Título" --body "Descripción"`
- `gh issue close [número] --comment "Motivo"`
- `gh issue list`
- `gh issue view [número]`

## ⚠️ IMPORTANTE: Gestión de Puertos y Servicios
**SIEMPRE** cierra/mata los servicios cuando termines de usarlos para evitar conflictos de puertos:
- Puerto 5001 (Backend Flask): `taskkill //PID [PID] //F` en Windows
- Puerto 3000 (Frontend Next.js): `taskkill //PID [PID] //F` en Windows
- Para verificar puertos en uso: `netstat -ano | findstr :[PUERTO]`

Esto es crítico porque pueden quedar servicios ejecutándose en segundo plano que bloquearán nuevas ejecuciones.

## Common Development Commands

### Backend (Flask API)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py

# Run with Gunicorn (production)
gunicorn -w 4 -b 0.0.0.0:5001 app:app

# Health check
curl http://127.0.0.1:5001/health
```

### Frontend (Next.js)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture Overview

### Project Structure
This is a full-stack liquor store application with separate backend and frontend applications:

- **Backend**: Flask API with MySQL database and Redis caching
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: MySQL with optimized indexes for product queries
- **Caching**: Simple Flask caching (fallback from Redis)

### Backend Architecture (`backend/`)
- **Entry Point**: `app.py` - Main Flask application with factory pattern
- **Configuration**: `config.py` - Environment-based config with validation
- **API Layer**: `api/v1/endpoints/productos.py` - RESTful endpoints with performance monitoring
- **Service Layer**: `services/producto_service.py` - Business logic with caching strategies
- **Data Layer**: `utils/database.py` - Database manager with connection pooling
- **Deployment**: Ready for Render.com with `render.yaml` and `Procfile`

### Frontend Architecture (`frontend/`)
- **Framework**: Next.js 13.5.1 with App Router
- **UI Components**: shadcn/ui components in `components/ui/`
- **Main Pages**: 
  - `app/page.tsx` - Home page with product categories and search
  - `app/product/[id]/page.tsx` - Product detail page with cart functionality
  - `app/categoria/[categoria]/page.tsx` - Category products listing
  - `app/categorias/page.tsx` - All categories overview
  - `app/search/page.tsx` - Search results page
  - `app/checkout/page.tsx` - Checkout form and order processing
  - `app/order-confirmation/page.tsx` - Order confirmation page
- **Styling**: Tailwind CSS with responsive design
- **API Integration**: Environment-based API URL configuration
- **State Management**: Context API for cart functionality (`contexts/cart-context.tsx`)
- **Custom Hooks**:
  - `use-cart.ts` - Cart operations
  - `use-analytics.ts` - Google Analytics integration
  - `use-debounce.ts` - Input debouncing
  - `use-filters.ts` - Product filtering
  - `use-liquor-toast.ts` - Custom toast notifications
  - `use-pagination.ts` - Pagination logic
  - `use-related-products.ts` - Related products fetching

### Key Performance Optimizations
1. **Database Indexes**: 8 optimized indexes for fast product queries
2. **Caching Strategy**: Multi-level caching (Redis fallback to simple cache)
3. **Frontend Loading**: Sequential loading (categories first, then parallel content)
4. **API Performance**: Sub-100ms response times with performance monitoring

## Database Schema
The main `productos` table includes:
- Product information (SKU, Nombre, Modelo, Tamaño)
- Pricing (Precio B, Precio J)
- Categorization (Categoria, Sub Categoria)
- Stock management (Stock, Cantidad)
- Metadata (Product_asig, Descripcion, Photo)

Optimized indexes on: SKU, Categoria, Sub Categoria, Stock, Tamaño, Sub Categoria Nivel

## API Endpoints
All endpoints are under `/api/v1/productos/`:
- `GET /categorias` - List product categories
- `GET /categorias/{value}` - Products by category
- `GET /sub_categorias/{value}` - Products by subcategory  
- `GET /combos` - Combo products
- `GET /stock/{status}` - Products by stock status
- `GET /tamaño/{size}` - Products by size
- `GET /sku/{sku}` - Product by SKU
- `GET /{id}` - Product by ID
- `GET /estadisticas` - Product statistics

## Environment Configuration

### Backend Environment Variables
Required in `backend/.env`:
```
DB_HOST=your_mysql_host
DB_USER=your_mysql_user  
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=3306
SECRET_KEY=your_secret_key
FLASK_DEBUG=True
```

### Frontend Environment Variables
Required in `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:5001
NODE_ENV=development
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Optional: Google Analytics ID
```

## Development Workflow
1. **Backend First**: Start the Flask API server for data access
2. **Frontend Second**: Start Next.js dev server which connects to backend API
3. **Database**: Ensure MySQL is running with the required schema
4. **Testing**: Use `/health` endpoint to verify backend connectivity

## Code Conventions
- **Backend**: Python PEP 8 style, type hints preferred
- **Frontend**: TypeScript strict mode, functional components with hooks
- **API Responses**: Consistent JSON format with success/error structure and performance metrics
- **Error Handling**: Graceful fallbacks with user-friendly error messages
- **Caching**: Aggressive caching with appropriate TTL values

## Performance Monitoring
Both backend and frontend include performance tracking:
- Backend: Query execution times, cache hit rates, optimization details
- Frontend: API call timings, loading states, sequential vs parallel loading patterns

## Deployment Notes
- Backend deploys to Render.com using `render.yaml` configuration
- Frontend can be deployed to Vercel or similar platforms
- Environment variables must be configured in deployment platforms
- Database credentials are production-specific and managed securely

## Analytics and Tracking

### Google Analytics Integration
The application includes Google Analytics 4 (GA4) integration for tracking user behavior:

**Setup**: Configure `NEXT_PUBLIC_GA_ID` in `frontend/.env.local` with your GA4 measurement ID

**Tracked Events**:
- Search queries
- Add to cart actions
- Product views
- Checkout initiation
- Order completion

**Implementation**: See `frontend/hooks/use-analytics.ts` and `frontend/components/GoogleAnalytics.tsx`

## Security Features

### Middleware Security Headers (`frontend/middleware.ts`)
Production environment includes comprehensive security headers:
- **X-Frame-Options**: DENY - Prevents clickjacking
- **X-Content-Type-Options**: nosniff - Prevents MIME type sniffing
- **X-XSS-Protection**: 1; mode=block - XSS protection
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Content-Security-Policy**: Restrictive CSP with specific allowlists
- **Strict-Transport-Security**: HSTS with 1-year max-age

### Allowed External Resources
- Images: Pexels, i.ibb.co
- API connections: web-ats.onrender.com, web-ats.vercel.app, atusaludlicoreria.com

## UI Components Library
The project uses shadcn/ui components with extensive customization:

### Key Components
- **Product Components**: product-card, product-card-skeleton
- **Cart System**: cart-button, cart-item, cart-sheet
- **Navigation**: bottom-navigation, hamburger-menu, breadcrumb
- **Forms**: checkout-form with react-hook-form and zod validation
- **Feedback**: Custom toast notifications with liquor-themed styling
- **Search**: search-input with debouncing
- **Filters**: filter-sidebar for product filtering
- **Social**: social-dropdown for sharing

### Form Validation
Using react-hook-form with zod schemas for:
- Checkout form validation
- Email and phone number validation
- Required field validation

## Testing and Verification
- Backend health check: `curl http://127.0.0.1:5001/health`
- Frontend build verification: `npm run build`
- Linting: `npm run lint`
- TypeScript checking: Built into Next.js build process