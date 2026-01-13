# Baban's Shop - E-commerce Platform

A modern, full-stack e-commerce platform built with React, TypeScript, and Supabase. Features a neo-brutalist design aesthetic with bold typography and strong visual elements.

## ✨ Features

### Customer Features
- 🛍️ **Product Browsing**: Browse products with category filtering and search
- 🛒 **Shopping Cart**: Add products to cart with real-time updates
- 👤 **User Authentication**: Register and login with email/password or Google OAuth
- 📦 **Order Management**: Place orders with Cash on Delivery payment
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 💾 **Guest Cart**: Cart persists in localStorage for non-logged-in users

### Admin Features
- 📊 **Dashboard**: View sales statistics and order overview
- ➕ **Product Management**: Add, update, and delete products
- 📸 **Image Upload**: Upload product images to Supabase Storage
- 📋 **Order Management**: View and update order status
- 💰 **Payment Tracking**: Mark orders as paid/unpaid

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date formatting

### Backend
- **Supabase** - Backend as a Service
  - **PostgreSQL** - Relational database
  - **Supabase Auth** - Authentication (email/password, Google OAuth)
  - **Supabase Storage** - File storage for product images
  - **Row Level Security** - Database-level security policies

### Deployment
- **Vercel** - Frontend hosting
- **Supabase** - Backend hosting (free tier)

## 🎨 Design

The application features a **neo-brutalist** design aesthetic with:
- Bold, high-contrast color schemes
- Strong black borders and shadows
- Modern typography (Inter, Space Mono)
- Clean, functional layouts
- Vibrant accent colors

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Supabase account (free tier)
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Baban-s-PortFolio-main
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:
   - Follow the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to create a Supabase project
   - Copy `.env.example` to `.env.local`
   - Add your Supabase configuration to `.env.local`

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   - Navigate to `http://localhost:3000`

## 📝 Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=admin@example.com
```

## 🏗️ Project Structure

```
Baban-s-PortFolio-main/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── ProductCard.tsx
│   │   ├── NeoButton.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── UserDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── services/           # Supabase services
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── cartService.ts
│   │   └── orderService.ts
│   ├── context/            # React contexts
│   │   └── AuthContext.tsx
│   ├── config/             # Configuration files
│   │   └── supabase.config.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   └── App.tsx             # Main app component
├── index.html              # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example            # Environment variables template
└── DEPLOYMENT_GUIDE.md     # Deployment instructions
```

## 🔐 Authentication

The app supports two authentication methods:
1. **Email/Password**: Traditional registration and login
2. **Google OAuth**: One-click sign-in with Google

## 🛡️ Security

- Row Level Security (RLS) policies protect user data
- Admin-only routes for product and order management
- Protected routes require authentication
- Environment variables keep sensitive data secure

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions to Vercel with Supabase backend.

## 🧪 Testing Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test the following flows:
   - Register a new account
   - Login with email/password
   - Browse products and add to cart
   - Complete checkout
   - View order in dashboard
   - (Admin) Add a new product
   - (Admin) Update order status

## 🐛 Known Issues

- Payment integration (Razorpay/Stripe) is not yet implemented - only COD is available
- Product reviews and ratings are planned but not implemented
- Email notifications are not configured

## 🚧 Roadmap

- [ ] Razorpay payment integration
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications (order confirmation, shipping updates)
- [ ] Advanced search filters
- [ ] Product categories page
- [ ] User profile editing
- [ ] Admin analytics dashboard

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

**Baban**

## 🙏 Acknowledgments

- Design inspiration from modern e-commerce platforms
- Supabase for backend infrastructure
- Vercel for hosting

---

**Made with ❤️ by Baban**
# Baban-Website-99
# Baban-Website-99
