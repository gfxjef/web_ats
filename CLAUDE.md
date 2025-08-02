# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **Main Page**: `app/page.tsx` - Optimized loading with sequential API calls
- **Styling**: Tailwind CSS with responsive design
- **API Integration**: Environment-based API URL configuration

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
Required in `frontend/.env`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:5001
NODE_ENV=development
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