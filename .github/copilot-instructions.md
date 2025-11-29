# ColombianStay - AI Coding Agent Instructions

## Project Overview

**ColombianStay** is a mid-scale property rental platform for the Colombian market, combining React (frontend), Django (backend), and PostgreSQL with optional MongoDB integration. The architecture prioritizes modularity, maintainability, and cost efficiency for supporting bookings, payments, reviews, and analytics.

- **Current branch**: Login (feature branch for authentication)
- **Stack**: Python 3.11+ (Django 5.2, DRF), React 19, PostgreSQL, Vite
- **Architecture**: Microservices-oriented with separate service apps under `users_service`

## Project Structure & Key Files

### Backend (`/backend`)
- **`core/`**: Django project configuration (settings.py, urls.py)
- **`users_service/`**: Monolithic service app for user management (MVP stage)
  - `models.py`: Currently extends Django User model only
  - `views.py`: Uses DRF viewsets (UserViewSet for CRUD operations)
  - `serializers.py`: Handles request/response serialization
  - `urls.py`: Routes registered via DefaultRouter (`/api/users/`)

### Frontend (`/frontend`)
- **`src/modules/users/components/`**: Airbnb-inspired UI components (production-ready)
  - **`Navbar/`**: Sticky navigation with search, profile menu, and "Become a host" link
  - **`CategoryBar/`**: Horizontally scrollable category filter with 12 categories (icons + text, active state)
  - **`ListingCard/`**: Reusable card component (image, title, location, price, rating, wishlist button)
  - **`Home/`**: HomePage assembles Navbar → CategoryBar → responsive grid of ListingCards
- **`src/services/api/`**: API client configuration
  - `httpClient.js`: Axios instance pointing to `http://localhost:8000/api/`
  - `endpoints.js`: Centralized endpoint definitions (currently listings-focused)
- **Styling**: Tailwind CSS 4.1+ (utility-first, configured in `tailwind.config.js` and `postcss.config.js`)
  - Global styles in `src/index.css` with Tailwind directives
  - Component-specific CSS for animations (minimal, mostly Tailwind)

## Critical Architecture Patterns

### Backend API Design
- **REST framework**: DRF viewsets handle standard CRUD via DefaultRouter
- **CORS enabled** on `http://localhost:5173` (React dev server)
- **Authentication**: Currently SessionAuthentication; TODO: implement JWT + role-based permissions
- **Security notes**: DEBUG=True in settings (development only); SECRET_KEY requires env protection

**Example: User endpoint registration** (`users_service/urls.py`):
```python
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
urlpatterns = router.urls  # Auto-generates /api/users/ CRUD routes
```

### Frontend-Backend Communication
- **Base URL**: `http://localhost:8000/api/` (hardcoded in `httpClient.js`)
- **Endpoint pattern**: Define constants in `endpoints.js` and use httpClient for requests
- **Vite dev server**: Runs on port 5173 (configured in `vite.config.js`)

**Example**: Add new endpoint in `endpoints.js`:
```javascript
export const LISTINGS_ENDPOINTS = {
  ALL: "listings/",
  DETAIL: (id) => `listings/${id}/`,
};
```

### State & Configuration Management
- **No global state library**: Currently using React hooks locally (useState)
- **Environment variables**: Backend uses `.env` file (via `python-dotenv`)
  - Required: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`

## Development Workflows

### Backend Startup
```powershell
cd backend
poetry install                    # Install dependencies (Django, DRF, psycopg2, cors-headers)
poetry run python manage.py migrate  # Apply database migrations
poetry run python manage.py runserver  # Start on http://localhost:8000
```

### Frontend Startup
```powershell
cd frontend
pnpm install  # Project uses pnpm, but npm/yarn also work
npm run dev  # Start Vite dev server on http://localhost:5173 (or 5174 if port taken)
```

### Frontend Styling: Tailwind CSS
- All components use Tailwind utility classes (no BEM or custom CSS selectors)
- Key Tailwind features used:
  - `sticky top-0 z-50` - Sticky navbar positioning
  - `rounded-xl` - Large rounded corners on images
  - `shadow-sm/md/lg` - Soft, layered shadows (Airbnb-style)
  - `hover:scale-105` - Smooth hover animations
  - `grid grid-cols-{1,2,3,4}` - Responsive grid (1 col mobile → 4 col ultra-wide)
  - `aspect-square` - Image aspect ratio enforcement
  - `line-clamp-2` - Text truncation
  - `group-hover:` - Group-based hover states (e.g., image opacity on card hover)

### Testing & Linting
- **Backend**: Django test framework (via `manage.py test`)
- **Frontend**: ESLint configured (`npm run lint`)

### Database
- **Primary**: PostgreSQL (configured in `settings.py` via env vars)
- **Connection**: Via psycopg2 driver
- **Migrations**: Django ORM handled by `manage.py makemigrations` / `migrate`

## Service-Oriented Architecture Plan

The `users_service` app is designed as a reusable service module:
- **Each service** has its own models, serializers, views, and URL configuration
- **Route prefix**: Services are mounted at `/api/{service_name}/` (see `core/urls.py`)
- **Planned services**: listings, bookings, payments, reviews (currently only users_service exists)
- **Future**: Separate services into independent microservices with API gateway

## Common Development Tasks

### Add a New API Endpoint
1. Update `users_service/models.py` if new data structure needed
2. Create serializer in `users_service/serializers.py`
3. Add viewset method or new ViewSet in `users_service/views.py`
4. Router automatically exposes routes; register in `users_service/urls.py`
5. In frontend, add endpoint constant to `services/api/endpoints.js`
6. Use `httpClient` to call from React components

### Add Frontend Component
- Place in `src/modules/{module_name}/components/{component_name}/`
- Use React hooks (useState, useEffect) for state management
- Import and use httpClient for API calls
- **Style with Tailwind CSS**: Use utility classes directly in JSX (no separate CSS files needed)
  - Create minimal `.css` file only for custom animations if needed
  - Follow naming: `@keyframes fadeIn` for animations

### Frontend Component Props Pattern
All components accept data via props and include mock defaults:
```jsx
// ListingCard example
const ListingCard = ({ listing, onCardClick }) => {
  const defaultListing = { id: 1, title: "...", ... };
  const card = listing || defaultListing; // Fallback to mock data
  // ...
};
```

### Database Migrations
```powershell
poetry run python manage.py makemigrations users_service  # Create migration
poetry run python manage.py migrate  # Apply to DB
```

## Known Issues & TODOs

- **Login component** (`src/modules/users/components/Login/`) is partially implemented (commented code)
- **Authentication**: Session-based currently; needs JWT integration
- **Permissions**: Set to `AllowAny` in REST_FRAMEWORK settings (insecure for production)
- **Models**: `users_service/models.py` is empty; relies on Django User model
- **Backend listings service**: Not yet implemented; frontend ListingCard uses mock data ready for API integration
- **Node.js version**: Project requires Node.js 20.19+ or 22.12+ (Vite requirement)

## External Dependencies

**Backend**:
- `django` (5.2.8+): Web framework
- `djangorestframework` (3.16.1+): REST API toolkit
- `django-cors-headers` (4.9.0+): Cross-origin request handling
- `psycopg2` (2.9.11+): PostgreSQL adapter
- `python-dotenv` (1.2.1+): Environment variable loading

**Frontend**:
- `react` (19.2.0+): UI library
- `react-dom` (19.2.0+): React DOM rendering
- `vite` (7.2.4+): Build tool & dev server
- `tailwindcss` (4.1.17+): Utility-first CSS framework
- `postcss` & `autoprefixer`: CSS processing pipeline

## Key Conventions

- **API responses**: DRF default format (JSON with metadata)
- **Component naming**: PascalCase for components, camelCase for files where applicable
- **Python style**: Django conventions (apps, models, views)
- **Environment**: `.env` file for secrets (not version controlled)
- **Branching**: Feature branches (e.g., "Login" branch currently active)
