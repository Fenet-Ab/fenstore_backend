# 🛍️ FenStore Backend API

A progressive, feature-rich **NestJS** server-side application designed to power **FenStore**, a premium digital e-commerce experience *"Where Elegance Meets Innovation"*. 

This backend handles authentication, product inventory, cart management, ordering pipelines, loyalty reward calculation, Chapa payment integrations, real-time-like client support messaging, customer notifications, and comprehensive product rating analytics.

---

## 🏗️ Technical Architecture & Workflow

The backend uses a layered architecture separating routing controllers, core business service logic, and database access via Prisma ORM.

```mermaid
graph TD
    Client[Client App: Next.js] -->|HTTP Requests| API_Gateway[NestJS HTTP Server]
    API_Gateway -->|Routing & Validation| GlobalPipes[ValidationPipe & CORS]
    GlobalPipes -->|Auth Guard| JWTGuard[Passport JWT Strategy]
    JWTGuard -->|Controllers| Controllers[NestJS Controllers]
    Controllers -->|Services| Services[NestJS Service Layer]
    Services -->|ORM Queries| Prisma[Prisma Client]
    Prisma -->|Read/Write| Postgres[(Supabase PostgreSQL)]
    Services -->|Storage Uploads| SupabaseSDK[Supabase Storage Client]
    SupabaseSDK -->|Media Assets| SupabaseBucket[Supabase Buckets]
    Services -->|Payments| Chapa[Chapa Payment Gateway]
```

### 🛠️ Core Technology Stack
* **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
* **Database ORM**: [Prisma](https://www.prisma.io/)
* **Database Engine**: PostgreSQL (Hosted on [Supabase](https://supabase.com/))
* **Object Storage**: Supabase Storage Buckets (for image uploads)
* **Payment Integration**: [Chapa](https://chapa.co/) (Ethiopian Payment API, handling **ETB** currency)
* **Authentication**: Passport.js, JWT (`@nestjs/jwt`), and `bcrypt` for secure hashing
* **Validation**: `class-validator` & `class-transformer`

---

## 🌟 Key Backend Features

*   🔑 **Secure Identity & Role Management**: Encrypted JWT authentication with role differentiation (`USER` & `ADMIN`). Includes global guards to protect endpoints.
*   💎 **Advanced Product Inventory**: Dynamic product (referred to as `Material` in database) attributes including title, description, categories, image URLs, sizes, colors, and storage choices. Supports safe **soft deletion** (`isDeleted: true`) to preserve transactional history.
*   🛒 **Transactional Shopping Cart**: Real-time cart synchronization, quantity adjustments, and custom option caching.
*   📦 **Robust Order Management**: Compiles carts into pending orders, handles status changes, records delivery progression, and notifies participants.
*   🎁 **Loyalty Point Ecosystem**: Auto-accrues points for users (5 points awarded per successful order). Points translate to instant discounts (1 Point = 1 ETB) with a minimum activation threshold of 10 points.
*   💳 **Ethiopian Payment Integration (Chapa)**: Direct generation of payment URLs, unique transaction ID (`txRef`) tracking, and webhooks/polling verification to convert order status to `PAID` instantly.
*   ⭐ **Analytical Rating System**: Custom 1-5 star product rating and comment engine. Caches aggregate reviews on items for fast index queries and computes rating star distribution breakdowns.
*   💬 **Live Admin-Client Support**: Unified support channel allowing users to query administrators, and a master dashboard for administrators to answer inquiries.
*   🔔 **Automated Event Notifications**: Auto-dispatched system messages when orders change status or new stock requests arise.

---

## 📊 Database Schema (Prisma ERD)

Below is the database entity relational structure defined in `prisma/schema.prisma`:

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Cart : owns
    User ||--o{ Like : marks
    User ||--o{ Rating : writes
    User ||--o{ Notification : receives
    User ||--o{ SupportMessage : sends
    
    Category ||--o{ Material : classifies
    
    Material ||--o{ CartItem : contains
    Material ||--o{ OrderItem : comprises
    Material ||--o{ Like : receives
    Material ||--o{ Rating : evaluates

    Cart ||--o{ CartItem : holds
    Order ||--o{ OrderItem : details
    
    User {
        String id PK
        String name
        String email UK
        String password
        Role role
        Int loyaltyPoints
        DateTime createdAt
    }
    
    Material {
        String id PK
        String title
        String description
        String imageUrl
        String categoryId FK
        Float price
        Float averageRating
        Int ratingCount
        Boolean isDeleted
        StringList sizes
        StringList colors
        StringList storages
        DateTime createdAt
    }

    Category {
        String id PK
        String name UK
    }

    Cart {
        String id PK
        String userId FK
    }

    CartItem {
        String id PK
        String cartId FK
        String materialId FK
        Int quantity
        String selectedSize
        String selectedColor
        String selectedStorage
    }

    Order {
        String id PK
        String userId FK
        Float totalPrice
        String shippingAddress
        String paymentStatus
        String deliveryStatus
        String txRef
        DateTime createdAt
    }

    OrderItem {
        String id PK
        String orderId FK
        String materialId FK
        Int quantity
        Float price
        String selectedSize
        String selectedColor
        String selectedStorage
    }

    Rating {
        String id PK
        String userId FK
        String materialId FK
        Int value
        String comment
        DateTime createdAt
        DateTime updatedAt
    }

    SupportMessage {
        String id PK
        String userId FK
        String message
        Boolean isAdmin
        DateTime createdAt
    }
    
    Notification {
        String id PK
        String userId FK
        String title
        String message
        Boolean isRead
        String type
        String orderId
        String link
        DateTime createdAt
    }
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18.x or above)
*   [npm](https://www.npmjs.com/) (v9.x or above)
*   A running PostgreSQL database instance (or Supabase project)

---

### 🔧 Installation & Environment Configuration

1. **Clone the Repository & Navigate to Backend**:
   ```bash
   cd /home/fenet/Documents/FenStore/backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `backend` directory (or modify the existing one) with the following structure:
   
   | Variable | Description | Example Value |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db?sslmode=require` |
   | `JWT_SECRET` | Secret key used to sign JSON Web Tokens | `super_secret_signing_key` |
   | `ADMIN_SECRET` | Token required to register an administrative user | `fenstore_admin_2024_secure_key` |
   | `SUPABASE_URL` | Supabase project dashboard endpoint | `https://your-project-id.supabase.co` |
   | `SUPABASE_SERVICE_KEY` | Supabase Service Role Key (for storage bypass) | `eyJhbGciOi...` |
   | `CHAPA_SECRET_KEY` | Chapa Payment gateway test/production private key | `CHASECK_TEST-your-chapa-secret` |

---

### 🗃️ Database Migrations & Seeding

Sync your database schema via Prisma and populate initial store categories:

```bash
# Generate the Prisma Client
npx prisma generate

# Apply migrations to database
npx prisma db push

# Seed initial store categories (Electronics, Clothing, Accessories, etc.)
npx prisma db seed
```

---

### 🏎️ Running the Backend

Start the development server with hot-reload enabled:

```bash
# Start in hot-reload watch mode
npm run start:dev

# Start in production mode
npm run start:prod
```
The server will boot by default on **`http://localhost:5000`** with the global prefix `/api` configured.

---

## 📡 API Endpoint Directory

All endpoints are prefixed with `/api`. Authenticated endpoints require a header: `Authorization: Bearer <your-jwt-token>`.

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Body Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | `{ name, email, password, adminSecret? }` | Register a new client user. Providing correct `adminSecret` sets role to `ADMIN`. |
| `POST` | `/auth/login` | Public | `{ email, password }` | Authenticate credentials and return JWT & user role. |
| `GET` | `/auth/profile` | Authenticated | *None* | Get profile information of current logged-in user. |

### 🏷️ Categories (`/api/category`)
| Method | Endpoint | Access | Body Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/category` | Public | *None* | Get all classification categories. |
| `POST` | `/category` | Admin | `{ name }` | Create a new product category. |

### 📦 Materials (Products) (`/api/material`)
| Method | Endpoint | Access | Body / Content Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/material` | Public | *None* | Retrieve all active, non-deleted products. |
| `GET` | `/material/recent-by-category` | Public | *None* | Retrieve the most recent product from each category. |
| `GET` | `/material/:id` | Public | *None* | Retrieve detailed product information by ID. |
| `POST` | `/material` | Admin | `multipart/form-data` (file, title, description, price, categoryId, sizes, colors, storages) | Upload product image to Supabase and create a product. |
| `PUT` | `/material/:id` | Admin | `multipart/form-data` | Update product details. Optional image file replacement. |
| `DELETE` | `/material/:id` | Admin | *None* | Soft-deletes product (`isDeleted: true`) and clears active carts holding it. |

### 🛒 Shopping Cart (`/api/cart`)
| Method | Endpoint | Access | Body Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Authenticated | *None* | Fetch current user's active shopping cart and items. |
| `POST` | `/cart/add` | Authenticated | `{ materialId, quantity, selectedSize?, selectedColor?, selectedStorage? }` | Add item with custom attributes to cart. |
| `PUT` | `/cart/item/:id`| Authenticated | `{ quantity }` | Update quantity of a item in cart. |
| `DELETE` | `/cart/item/:id`| Authenticated | *None* | Remove item from cart. |

### 💳 Order & Payment Management (`/api/order` & `/api/payment`)
| Method | Endpoint | Access | Body Payload / Parameters | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/order` | Authenticated | `{ shippingAddress, useLoyaltyPoints }` | Compile cart into an Order. Applies loyalty point discounts if selected. |
| `GET` | `/order` | Authenticated | `?search=xyz` (optional search) | Get current user's order history. |
| `GET` | `/order/admin/all` | Admin | `?search=xyz` (optional search) | Fetch all system orders (used by admin dashboard). |
| `PATCH`| `/order/:id/delivery`| Admin | `{ deliveryStatus }` | Update order delivery status (NOT_DELIVERED, DELIVERED). |
| `DELETE`| `/order/:id` | Authenticated | *None* | Delete order if unpaid. |
| `GET` | `/order/admin/market-share`| Admin | *None* | Return market share analytics grouped by category sales. |
| `POST` | `/payment/initialize/:orderId` | Authenticated | *None* | Initialize Chapa checkout session and return payment redirect URL. |
| `GET` | `/payment/verify/:orderId` | Public | `?tx_ref=xyz` | Verifies payment status with Chapa APIs. Marks order as `PAID` and awards loyalty points. |

### ⭐ Ratings & Reviews (`/api/rating`)
| Method | Endpoint | Access | Body Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/rating/:materialId` | Authenticated | `{ value, comment? }` | Submit/update rating (1-5) and review comment. Updates product averages. |
| `GET` | `/rating/material/:materialId` | Public | *None* | Fetch all user ratings and reviews for a specific product. |
| `GET` | `/rating/material/:materialId/stats`| Public | *None* | Fetch average score, total ratings count, and star distribution counts. |
| `GET` | `/rating/top` | Public | `?limit=10` | Retrieve top-rated products. |
| `GET` | `/rating/my` | Authenticated | *None* | Get all ratings written by the current logged-in user. |
| `GET` | `/rating/my/:materialId` | Authenticated | *None* | Get the current user's rating for a specific product. |
| `DELETE`| `/rating/:materialId` | Authenticated | *None* | Delete user's rating and re-compute product averages. |

### 💬 Support Messages (`/api/support`)
| Method | Endpoint | Access | Body Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/support` | Authenticated | `{ message, isAdmin? }` | Send a chat message. |
| `GET` | `/support` | Authenticated | *None* | Retrieve chat messages history for current user. |
| `GET` | `/support/admin/conversations` | Admin | *None* | Retrieve distinct users listing who have active chat sessions. |
| `GET` | `/support/admin/user/:id` | Admin | *None* | Get chat transcripts for a specific client user. |

---

## 🛠️ Verification & Helper Scripts

The codebase provides shell helper scripts in the backend root directory to verify connectivity and initialize test administrative accounts:

### 1. Test API Connectivity (`test-api.sh`)
Verifies if the backend is actively listening on port `5000` and validates basic route returns.
```bash
chmod +x test-api.sh
./test-api.sh
```

### 2. Interactive Admin Creation (`create-admin.sh`)
Prompt-based script to register a user with `ADMIN` role. Reads the `ADMIN_SECRET` directly from the `.env` file to authorize registration.
```bash
chmod +x create-admin.sh
./create-admin.sh
```

### 3. Test Rating Endpoints (`test-rating-api.sh`)
Verifies all public rating endpoints, statistical returns, and documents instructions on verifying authenticated rating workflows.
```bash
chmod +x test-rating-api.sh
./test-rating-api.sh
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
