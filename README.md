# 💎 GlamBazaar - Premium E-commerce Platform

<div align="center">

![GlamBazaar Logo](https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop&crop=center)

**A modern, full-stack e-commerce platform built with NextJS 15 for jewelry and cosmetics, featuring same-day delivery in Kanpur, comprehensive admin dashboard, and secure payment processing.**

[![Next.js](https://img.shields.io/badge/Next.js-15.0.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7.0-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-5.0.0-purple?style=for-the-badge&logo=next-auth)](https://next-auth.js.org/)

[🌐 Live Demo](https://glambazaar.vercel.app) • [📚 Documentation](#documentation) • [🚀 Quick Start](#quick-start)

</div>

---

## 🌟 Overview

GlamBazaar is a premium e-commerce platform built with the latest web technologies, specializing in jewelry and cosmetics. Featuring same-day delivery in Kanpur and speedpost delivery across India, it provides a seamless shopping experience with advanced product management, user authentication, and an intuitive admin dashboard.

### ✨ Key Highlights

- 🛍️ **Full E-commerce Experience** - Complete shopping cart, checkout, and order management
- 👑 **Premium Design** - Clean white theme with perfect accessibility
- 📱 **Mobile-First** - Responsive design optimized for all devices
- 🚚 **Smart Delivery** - Same-day delivery in Kanpur, speedpost elsewhere
- 🔐 **Secure Authentication** - NextAuth with Google OAuth and credentials
- 👨‍💼 **Admin Dashboard** - Complete business management interface
- ⚡ **Modern Tech Stack** - NextJS 15, TypeScript, Tailwind CSS v4.1

---

## 🏗️ Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Components] 
        B[NextJS App Router]
        C[Tailwind CSS]
    end
    
    subgraph "Application Layer"
        D[API Routes] 
        E[Server Components]
        F[Middleware]
    end
    
    subgraph "Authentication Layer"
        G[NextAuth.js]
        H[JWT Tokens]
        I[OAuth Providers]
    end
    
    subgraph "Data Layer"
        J[Prisma ORM]
        K[MySQL Database]
        L[Connection Pooling]
    end
    
    subgraph "External Services"
        M[Vercel Deployment]
        N[Image CDN]
        O[Email Service]
    end
    
    A --> B
    B --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    D --> J
    J --> K
    K --> L
    B --> M
    A --> N
    D --> O
```

### Component Architecture

```
┌─────────────────────────────────────────────┐
│                 Frontend                    │
├─────────────────────────────────────────────┤
│  ┌─────────────┐ ┌──────────────────────┐   │
│  │    Pages    │ │     Components       │   │
│  │             │ │                      │   │
│  │ • Home      │ │ • ProductCard        │   │
│  │ • Products  │ │ • ShoppingCart       │   │
│  │ • Cart      │ │ • Header/Footer      │   │
│  │ • Checkout  │ │ • AdminDashboard     │   │
│  │ • Admin     │ │ • Forms              │   │
│  └─────────────┘ └──────────────────────┘   │
├─────────────────────────────────────────────┤
│                 Backend                     │
├─────────────────────────────────────────────┤
│  ┌─────────────┐ ┌──────────────────────┐   │
│  │ API Routes  │ │    Business Logic    │   │
│  │             │ │                      │   │
│  │ • /products │ │ • Product Service    │   │
│  │ • /cart     │ │ • Cart Service       │   │
│  │ • /orders   │ │ • Order Service      │   │
│  │ • /auth     │ │ • User Service       │   │
│  │ • /admin    │ │ • Admin Service      │   │
│  └─────────────┘ └──────────────────────┘   │
├─────────────────────────────────────────────┤
│                Database                     │
├─────────────────────────────────────────────┤
│  ┌─────────────┐ ┌──────────────────────┐   │
│  │   Models    │ │    Relationships     │   │
│  │             │ │                      │   │
│  │ • User      │ │ • User → Orders      │   │
│  │ • Product   │ │ • Product → Variants │   │
│  │ • Order     │ │ • Category → Products│   │
│  │ • Category  │ │ • Order → Items      │   │
│  │ • Cart      │ │ • Product → Reviews  │   │
│  └─────────────┘ └──────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Database Schema Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Users     │    │   Products   │    │  Categories  │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ id (PK)      │    │ id (PK)      │    │ id (PK)      │
│ email        │◄───┤ categoryId   │◄───┤ name         │
│ name         │    │ name         │    │ slug         │
│ role         │    │ price        │    │ parentId     │
│ password     │    │ description  │    │ isActive     │
└──────────────┘    │ isActive     │    └──────────────┘
        │           └──────────────┘
        │                  │
        ▼                  ▼
┌──────────────┐    ┌──────────────┐
│   Orders     │    │   Variants   │
├──────────────┤    ├──────────────┤
│ id (PK)      │    │ id (PK)      │
│ userId (FK)  │    │ productId(FK)│
│ status       │    │ sku          │
│ totalAmount  │    │ price        │
│ createdAt    │    │ stockQty     │
└──────────────┘    └──────────────┘
        │                  
        ▼                  
┌──────────────┐    ┌──────────────┐
│  OrderItems  │    │   CartItems  │
├──────────────┤    ├──────────────┤
│ id (PK)      │    │ id (PK)      │
│ orderId (FK) │    │ userId (FK)  │
│ productId(FK)│    │ productId(FK)│
│ quantity     │    │ quantity     │
│ price        │    │ createdAt    │
└──────────────┘    └──────────────┘
```

### API Architecture

```
┌─────────────────────────────────────────────┐
│                 API Layer                   │
├─────────────────────────────────────────────┤
│                                             │
│  GET /api/products ──┐                      │
│  POST /api/products ─┤──► Product Service   │
│  PUT /api/products   ─┘                     │
│                                             │
│  GET /api/cart ──────┐                      │
│  POST /api/cart ─────┤──► Cart Service      │
│  DELETE /api/cart ───┘                      │
│                                             │
│  GET /api/orders ────┐                      │
│  POST /api/orders ───┤──► Order Service     │
│  PUT /api/orders ────┘                      │
│                                             │
│  POST /api/auth/login ──┐                   │
│  POST /api/auth/register─┤──► Auth Service  │
│  DELETE /api/auth ──────┘                   │
│                                             │
└─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│              Data Access Layer              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │ Prisma ORM  │──│    MySQL Database   │   │
│  │             │  │                     │   │
│  │ • Models    │  │ • Tables            │   │
│  │ • Queries   │  │ • Indexes           │   │
│  │ • Relations │  │ • Constraints       │   │
│  │ • Migration │  │ • Connection Pool   │   │
│  └─────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Technology Stack Layers

```
┌─────────────────────────────────────────────┐
│              Presentation Layer             │
│                                             │
│  React 18 + NextJS 15 App Router            │
│  Tailwind CSS v4.1 + Radix UI              │
│  TypeScript + Lucide Icons                 │
└─────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────┐
│               Business Layer                │
│                                             │
│  NextAuth.js 5 + JWT Authentication        │
│  React Hook Form + Zod Validation          │
│  Server Actions + API Routes               │
└─────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────┐
│                Data Layer                   │
│                                             │
│  Prisma ORM + MySQL Database               │
│  Connection Pooling + Query Optimization   │
│  Database Migrations + Seeding             │
└─────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────┐
│            Infrastructure Layer             │
│                                             │
│  Vercel Deployment + Edge Functions        │
│  CDN + Image Optimization                  │
│  Environment Variables + Secrets           │
└─────────────────────────────────────────────┘
```

---

## 🚀 Features

### 🛒 Customer Experience
- **Product Catalog** with advanced filtering and search
- **Product Variants** (colors, sizes, materials)
- **Shopping Cart** with persistent storage
- **Secure Checkout** with multiple payment options
- **Order Tracking** and management
- **User Reviews** and ratings system
- **Wishlist** functionality
- **Responsive Design** for mobile and desktop

### 👨‍💼 Admin Dashboard
- **Product Management** (CRUD operations, variants, inventory)
- **Order Processing** and status updates  
- **Customer Management** and analytics
- **Sales Analytics** with detailed reporting
- **Inventory Management** with low stock alerts
- **Multi-role Support** (Admin, Manager, User)

### 🔧 Technical Features
- **Server-Side Rendering** with NextJS 15 App Router
- **Type Safety** with comprehensive TypeScript implementation
- **Database ORM** with Prisma and MySQL
- **Authentication** with NextAuth (Google OAuth + Credentials)
- **Real-time Updates** and optimistic UI
- **SEO Optimized** with proper meta tags and structured data
- **Performance Optimized** with image optimization and code splitting

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS v4.1](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend
- **[NextAuth.js 5](https://next-auth.js.org/)** - Authentication solution
- **[Prisma ORM](https://prisma.io/)** - Database toolkit
- **[MySQL](https://www.mysql.com/)** - Relational database
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js/)** - Password hashing

### Development
- **[React Hook Form](https://react-hook-form.com/)** - Form handling
- **[Zod](https://github.com/colinhacks/zod)** - Schema validation
- **[ESLint](https://eslint.org/)** - Code linting
- **[Vercel](https://vercel.com/)** - Deployment platform

---

## 📦 Project Structure

```
glambazar/
├── app/
│   ├── (auth)/                 # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── admin/                  # Admin dashboard
│   │   ├── products/
│   │   ├── orders/
│   │   └── analytics/
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   ├── products/
│   │   └── orders/
│   ├── category/               # Category pages
│   │   └── [slug]/
│   ├── components/             # Reusable components
│   │   ├── ui/                 # Base UI components
│   │   ├── layout/             # Layout components
│   │   ├── product/            # Product-specific components
│   │   ├── cart/               # Shopping cart components
│   │   └── admin/              # Admin components
│   ├── products/               # Product pages
│   │   └── [slug]/
│   ├── cart/                   # Shopping cart page
│   └── checkout/               # Checkout page
├── lib/                        # Utility libraries
│   ├── auth.ts                 # NextAuth configuration
│   ├── db.ts                   # Database utilities
│   ├── types.ts                # TypeScript definitions
│   └── utils.ts                # Helper functions
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
└── middleware.ts               # Route protection middleware
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm/yarn/pnpm
- MySQL database
- Google OAuth credentials (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/harshsrivastava05/GlamBazaar.git
cd GlamBazaar
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/glambazar"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database with sample data (optional)
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Admin Access

Default admin credentials:
- **Email:** `admin@glambazar.com`
- **Password:** `admin123`

---

## 🌐 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Products
- `GET /api/products` - Get products with filtering
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/[id]` - Update product (Admin)
- `DELETE /api/products/[id]` - Delete product (Admin)

### Cart & Orders
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[id]` - Update cart item
- `DELETE /api/cart/[id]` - Remove cart item
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders

---

## 📱 Mobile Responsiveness

GlamBazaar is fully responsive and optimized for:

- 📱 **Mobile** (320px - 768px)
- 📟 **Tablet** (768px - 1024px)  
- 🖥️ **Desktop** (1024px+)
- 🖥️ **Large Screens** (1440px+)

### Mobile Features
- Touch-friendly navigation
- Swipe gestures for product galleries
- Mobile-optimized filters
- Progressive Web App (PWA) ready

---

## 🚚 Delivery System

### Same-Day Delivery (Kanpur)
- ✅ **Free delivery** for orders above ₹2,000
- ✅ **₹99** delivery fee for orders below ₹2,000
- ✅ **Order before 2 PM** for same-day delivery
- ✅ **Delivery within 4-6 hours**

### Speedpost Delivery (Pan-India)
- 📦 **₹150** flat delivery fee
- 📦 **3-5 business days** delivery time
- 📦 **Track your order** with tracking number
- 📦 **Cash on Delivery** available

---

## 🔐 Security Features

- 🔒 **Password Hashing** with bcryptjs
- 🔐 **JWT-based Authentication** with NextAuth
- 🛡️ **CSRF Protection** built-in
- 🔑 **Role-based Access Control**
- 🚨 **Input Validation** with Zod schemas
- 🔍 **SQL Injection Prevention** with Prisma
- 🌐 **Secure Headers** configuration

---

## 📊 Database Schema

### Core Entities
- **Users** - Customer and admin accounts
- **Products** - Product catalog with variants
- **Categories** - Hierarchical product categories
- **Orders** - Order management and tracking
- **Cart Items** - Shopping cart persistence
- **Reviews** - Product reviews and ratings
- **Addresses** - Customer shipping addresses

### Relationships
- Users → Orders (One-to-Many)
- Products → Variants (One-to-Many)
- Categories → Products (One-to-Many)
- Orders → Order Items (One-to-Many)
- Products → Reviews (One-to-Many)

---

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/harshsrivastava05/GlamBazaar)

1. Fork this repository
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically

### Other Platforms

- **Railway** - Database + App hosting
- **PlanetScale** - Serverless MySQL
- **Heroku** - Container deployment
- **AWS** - Full cloud deployment

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow **TypeScript** best practices
- Use **Tailwind CSS** for styling
- Write **comprehensive tests**
- Update **documentation** as needed
- Follow **conventional commits**

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Harsh Srivastava**
- GitHub: [@harshsrivastava05](https://github.com/harshsrivastava05)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/harsh-srivastava-a4ab8a273/)
- Email: harshsrivastava8704@gmail.com

---

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting platform
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Prisma](https://prisma.io/) for the excellent ORM
- [Radix UI](https://radix-ui.com/) for accessible components

---

## 📈 Roadmap

### 🔜 Coming Soon
- [ ] **Payment Integration** (Stripe, Razorpay)
- [ ] **Multi-vendor Support**
- [ ] **Advanced Analytics Dashboard**
- [ ] **Mobile App** (React Native)
- [ ] **AI-powered Recommendations**
- [ ] **Live Chat Support**
- [ ] **Multi-language Support**
- [ ] **Progressive Web App** features

### 🎯 Future Enhancements
- [ ] **Inventory Forecasting**
- [ ] **Social Commerce Integration**
- [ ] **Augmented Reality** product try-on
- [ ] **Voice Search**
- [ ] **Advanced SEO** optimizations
- [ ] **Performance Monitoring**

---

## 📊 Project Statistics

<div align="center">

![GitHub repo size](https://img.shields.io/github/repo-size/harshsrivastava05/GlamBazaar?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/harshsrivastava05/GlamBazaar?style=for-the-badge)
![GitHub top language](https://img.shields.io/github/languages/top/harshsrivastava05/GlamBazaar?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/harshsrivastava05/GlamBazaar?style=for-the-badge)

</div>

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

[Report Bug](https://github.com/harshsrivastava05/GlamBazaar/issues) • [Request Feature](https://github.com/harshsrivastava05/GlamBazaar/issues) • [View Demo](https://glambazaar.vercel.app)

Made with ❤️ by [Harsh Srivastava](https://github.com/harshsrivastava05)

</div>