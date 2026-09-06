# Grocery Price Management System

A **mobile-first real-time grocery price management web application** for offline grocery businesses. Staff can instantly search for products and view current prices on their smartphones, while owners/admins manage pricing centrally.

## 🎯 Key Features (Phase 1)

### Staff Interface

- 🔍 **Global Product Search** - English, Tamil, SKU, brand, partial matching
- 📱 **Mobile-First UI** - Optimized for smartphones
- 💰 **Real-Time Pricing** - B2B and B2C prices with live updates via Socket.IO
- ⏰ **Last Updated Info** - Know when prices were last changed
- 🗣️ **Voice Search Ready** - Architecture for Web Speech API integration

### Admin/Owner Interface

- 📦 **Product Management** - Add, edit, deactivate products and variants
- 💳 **Pricing Control** - Update purchase costs, B2B, and B2C prices
- 📊 **Price History** - Track all price changes with timestamps and user info
- 👥 **Staff Management** - Create and manage staff accounts
- ⚙️ **System Settings** - Configure application behavior

## 🏗️ Project Structure

```
price/
├── frontend/              # Next.js React application
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   │   ├── (auth)/   # Authentication routes
│   │   │   ├── (staff)/  # Staff interface routes
│   │   │   └── (admin)/  # Admin dashboard routes
│   │   ├── components/   # Reusable React components
│   │   ├── services/     # API client and Socket.IO
│   │   ├── stores/       # Zustand state management
│   │   ├── types/        # TypeScript interfaces
│   │   └── lib/          # Utilities and helpers
│   ├── .env.local        # Frontend env variables
│   └── package.json
│
└── backend/              # Node.js + Express API
    ├── src/
    │   ├── index.ts      # Entry point
    │   ├── config/       # Database, Cloudinary, Socket.IO
    │   ├── models/       # Mongoose schemas
    │   ├── controllers/  # Request handlers
    │   ├── services/     # Business logic
    │   ├── routes/       # API routes
    │   ├── middleware/   # Auth, error handling
    │   ├── utils/        # Helpers
    │   └── types/        # TypeScript interfaces
    ├── .env.example      # Example env variables
    └── package.json
```

## 📋 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Zustand** - Lightweight state management
- **Vercel** - Hosting (planned)

### Backend

- **Node.js + Express** - REST API server
- **TypeScript** - Type-safe backend
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - WebSocket real-time events
- **JWT** - Authentication
- **Cloudinary** - Image hosting
- **Multer** - File uploads
- **Render** - Hosting (planned)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier available)
- Git

### 1. Backend Setup

```bash
cd backend

# Create environment file
cp .env.example .env.local

# Edit .env.local with your credentials:
# - MONGODB_URI: MongoDB connection string
# - CLOUDINARY_*: Cloudinary API credentials
# - JWT_SECRET: Generate a random secret key
# - PORT: Server port (default 5000)
```

**Get MongoDB URI:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/grocery-price?retryWrites=true&w=majority`

**Get Cloudinary Credentials:**

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard → Settings
3. Copy Cloud Name, API Key, and API Secret

**Start Backend:**

```bash
npm install  # Already done during setup
npm run dev
```

Backend runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Env variables already configured in .env.local
# Update if backend is on different URL

npm install  # Already done during setup
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🔐 Demo Accounts

After backend initialization (with seed data), use:

### Staff Account

- Email: `staff@grocerystore.com`
- Password: `staff123`

### Owner/Admin Account

- Email: `admin@grocerystore.com`
- Password: `admin123`

> Note: Accounts need to be created in MongoDB before login works. See "Database Initialization" below.

## 💾 Database Initialization

Create initial users in MongoDB:

```javascript
// Using MongoDB Compass or shell
db.users.insertMany([
  {
    name: "Owner",
    email: "admin@grocerystore.com",
    password: "$2a$10$...", // bcrypt hash of "admin123"
    role: "owner",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Staff Member",
    email: "staff@grocerystore.com",
    password: "$2a$10$...", // bcrypt hash of "staff123"
    role: "staff",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
```

Or use the register endpoint to create accounts via API.

## 🔄 Real-Time Price Updates

The system uses **Socket.IO** for instant price updates:

1. Admin updates a price in the dashboard
2. Backend updates MongoDB
3. Socket.IO event emitted to all connected staff
4. Staff app receives update in real-time
5. UI updates with new price

No page refresh needed!

## 📚 API Routes

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile

### Products (Staff)

- `GET /api/products/search?q=cornflour` - Search products
- `GET /api/products/:id` - Get product details with variants

### Products (Admin)

- `PATCH /api/products/:id/prices` - Update variant prices
- `GET /api/products/:id/price-history` - View price history

## 🔒 Security Features

✅ **JWT Authentication** - Secure token-based auth
✅ **Role-Based Access Control** - Owner vs Staff permissions
✅ **Password Hashing** - bcryptjs for secure passwords
✅ **Environment Variables** - Secrets not in code
✅ **CORS Protection** - Cross-origin request validation
✅ **Input Validation** - Server-side validation on all inputs
✅ **Error Handling** - No sensitive data in error messages

## 🎨 UI/UX Highlights

### Staff Search Interface

- Large search bar and microphone button
- Quick product cards with top 2 sizes
- Full product details view
- Price display with B2B and B2C
- Last updated timestamp
- Mobile-optimized layout

### Admin Dashboard

- Overview cards (product count, staff count, etc.)
- Tabbed interface (Products, Pricing, Staff, Settings)
- Placeholder for future features
- Clean, organized layout

## 📱 Mobile-First Design

- Responsive Tailwind CSS grid system
- Touch-friendly button sizes
- Optimized for 375px+ width
- Fast loading times
- Minimal external assets

## 🔮 Phase 2+ Features (Not Implemented Yet)

- [ ] Bulk price updates via CSV
- [ ] Search analytics
- [ ] Barcode scanning
- [ ] PWA (offline support)
- [ ] WhatsApp integration
- [ ] Advanced admin reports
- [ ] Fuzzy search improvements
- [ ] AI-powered search suggestions
- [ ] Multi-language Tamil support
- [ ] Dark mode

## 🧪 Testing

### Test Search

1. Login as staff
2. Search "corn" or "cornflour" or "CF001"
3. Click product to view all variants
4. See B2B and B2C prices

### Test Real-Time Updates

1. Staff: Keep search results open
2. Admin: Update a product price
3. Staff: See price update instantly without refresh

### Test Authentication

1. Try accessing `/admin/dashboard` as staff (should redirect)
2. Try accessing `/staff/search` as admin (should allow)
3. Logout and verify redirect to login

## 📝 Environment Variables

### Backend (.env)

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SOCKET_NAMESPACE=/api
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Grocery Price Management System
```

## 🐛 Troubleshooting

**Backend won't start:**

- Check MongoDB URI is correct
- Verify PORT isn't already in use
- Check all env variables are set

**Frontend can't connect to backend:**

- Verify backend is running on http://localhost:5000
- Check NEXT_PUBLIC_API_URL in .env.local
- Check CORS is enabled in backend

**Login fails:**

- Verify user exists in MongoDB
- Check password is correct (bcrypt hashed)
- Check JWT_SECRET matches in backend

**Prices not updating in real-time:**

- Check Socket.IO connection in browser console
- Verify "Disconnected from server" doesn't appear
- Refresh page and try again

## 📞 Support & Documentation

- Backend issues: Check terminal for error logs
- Frontend issues: Open browser DevTools (F12)
- Socket.IO debug: Enable `localStorage.debug = 'socket.io*'` in browser console

## 📄 License

This project is proprietary software for Grocery Store Management.

## ✅ Checklist - Phase 1 Complete

- [x] Backend initialized with Express + TypeScript
- [x] Frontend initialized with Next.js + TypeScript
- [x] MongoDB models created (User, Product, ProductVariant, PriceHistory, Category, Subcategory)
- [x] Authentication system (JWT, roles)
- [x] Staff search interface (mobile-first)
- [x] Admin dashboard shell
- [x] Socket.IO real-time foundation
- [x] Cloudinary integration prepared
- [x] Environment variables configured
- [x] Clean folder architecture
- [x] Basic API structure
- [x] API response standardization
- [x] Error handling middleware
- [x] Role-based access control

## 🚀 Next Steps (Phase 2)

1. **Admin Product Management** - Full CRUD for products
2. **CSV Import/Export** - Bulk operations
3. **Advanced Search** - Fuzzy matching, synonyms
4. **Barcode Scanning** - QR code lookup
5. **Analytics Dashboard** - Search insights, trends
6. **PWA Setup** - Offline capability
7. **WhatsApp Integration** - Price queries via WhatsApp
8. **Mobile App** - React Native version (optional)

---

**Developed for: Grocery Store Price Management System**
**Start Date: September 4, 2026**
