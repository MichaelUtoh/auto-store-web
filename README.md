# Auto-Parts E-Commerce Frontend

Production-ready Next.js 14+ (App Router) frontend for an auto-parts e-commerce platform. Built for fast deployment and user testing with a minimalist design.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4+
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios (with interceptors)
- **UI:** Custom components (shadcn-style), Lucide React, React Hot Toast
- **Dates:** date-fns

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your API base URL and app URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:8080/api/v1`) |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_ITEMS_PER_PAGE` | Products per page (default `20`) |

## Project Structure

```
src/
├── app/              # App Router routes
│   ├── (auth)/       # Login, register, forgot-password
│   ├── (shop)/       # Products, categories, search
│   ├── account/      # Profile, orders, addresses, wishlist
│   ├── cart/
│   ├── checkout/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # Button, Input, Card, etc.
│   ├── layout/       # Header, Footer, Navbar, MobileNav
│   ├── product/      # ProductCard, ProductGrid, ProductFilter, etc.
│   ├── cart/         # CartItem, CartSummary, CartDrawer
│   ├── checkout/     # CheckoutForm, OrderSummary
│   └── shared/       # LoadingSpinner, ErrorBoundary, Pagination
├── lib/
│   ├── api/          # Axios client, auth, products, cart, orders, users
│   ├── utils/        # format, validators, helpers
│   └── constants.ts
├── store/            # Zustand: useAuthStore, useCartStore, useProductStore, useUIStore
├── types/            # API, product, user, cart, order
└── hooks/            # useAuth, useCart, useDebounce, useLocalStorage
```

## API Integration

The app expects a REST API with the following conventions:

- **Response shape:** `{ data: T }` for single resources; paginated: `{ data: { data: T[], total, page, limit, totalPages } }` or similar.
- **Auth:** JWT in `Authorization: Bearer <token>` or cookies. Endpoints: `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `GET /auth/me`, `POST /auth/logout`.
- **Products:** `GET /products`, `GET /products/:id`, `GET /products/search?q=`, `GET /categories`.
- **Cart:** `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`.
- **Orders:** `POST /orders`, `GET /orders`, `GET /orders/:id`.
- **Users:** `GET /users/me`, `PATCH /users/me`, `GET /users/me/addresses`, `GET /users/me/wishlist`.

Adjust `src/lib/api/*` and stores if your backend uses different paths or response shapes.

## Scripts

- `npm run dev` – Development server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – Run ESLint

## Deployment

Recommended: **Vercel**.

1. Push to GitHub and import the repo in Vercel.
2. Set environment variables in the Vercel dashboard.
3. Deploy. Use the same `NEXT_PUBLIC_API_BASE_URL` for your production API.

## License

Private / All rights reserved.
