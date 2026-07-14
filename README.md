# ShopNest Server

ShopNest Server is the backend REST API for the ShopNest e-commerce platform. It provides secure authentication, role-based authorization, product management, order tracking, user administration, and dashboard statistics.

## Purpose

ShopNest is a full-stack e-commerce platform where buyers can browse and purchase products, sellers can list items, and admins manage the entire platform. The backend provides secure authentication, role-based authorization, product CRUD, order management, and dashboard analytics.

---

## 🔗 Live URL

- **Backend API:** [https://shopnest-server.onrender.com](https://shopnest-server.onrender.com)

---
```
config/
└── db.ts              # MongoDB connection and index setup
src/
├── index.ts           # App entry point, middleware, route mounting
├── seed.ts            # Auto-seeds admin, demo user, and 12 products on startup
└── utils.ts           # Shared helpers (pagination, ObjectId, JWT sign)
middleware/
└── auth.ts            # JWT verification and role guard
routes/
├── auth.ts            # Register, login, /me
├── users.ts           # User CRUD, role and status management
├── products.ts        # Product CRUD with search, filter, sort, pagination
├── orders.ts          # Order creation and status management
└── stats.ts           # Admin dashboard statistics and charts
```
---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/shopnest-server.git
cd shopnest-server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your MONGODB_URI and JWT_SECRET in .env

# Start development server
npm run dev
```

---

## Scripts

```bash
npm run dev    # Start with ts-node-dev (auto-restart on changes)
npm run build  # Compile TypeScript to dist/
npm start      # Start production server from dist/
npm run seed   # Run seed script manually
```

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shopnest
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
ADMIN_EMAIL=admin@shopnest.com
ADMIN_PASSWORD=Admin12345
DEMO_EMAIL=demo@shopnest.com
DEMO_PASSWORD=Demo12345
```

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✓ | Get current user |
| GET | /api/products | — | List products with filters |
| GET | /api/products/:id | — | Single product |
| POST | /api/products | ✓ | Create product |
| PATCH | /api/products/:id | ✓ owner/admin | Update product |
| DELETE | /api/products/:id | ✓ owner/admin | Delete product |
| GET | /api/products/seller/mine | ✓ | Own products |
| POST | /api/orders | ✓ | Place order |
| GET | /api/orders/mine | ✓ | Own orders |
| GET | /api/orders | ✓ admin | All orders |
| PATCH | /api/orders/:id/status | ✓ admin | Update order status |
| PATCH | /api/users/profile | ✓ | Update own profile |
| GET | /api/users | ✓ admin | All users |
| PATCH | /api/users/:id/status | ✓ admin | Block/activate user |
| PATCH | /api/users/:id/role | ✓ admin | Change user role |
| GET | /api/stats | ✓ admin | Dashboard analytics |

---

## User Roles

| Role | Permissions |
|------|-------------|
| `buyer` | Browse products, place orders, manage own profile |
| `seller` | List and manage own products, place orders |
| `admin` | Full access — manage users, all products, all orders |

---

## Default Credentials
```
After first startup, log in with:
Admin Email:    admin@shopnest.com
Admin Password: Admin12345
Demo Email:     demo@shopnest.com
Demo Password:  Demo12345
```
---

## Author

Tasfia Islam Raisha
