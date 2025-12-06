# POS System - Frontend

Modern, responsive Point of Sale (POS) system frontend built with React, TypeScript, Vite, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── assets/              # Static assets
│   ├── components/
│   │   ├── atoms/           # Basic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   ├── molecules/       # Composite components
│   │   └── organisms/       # Complex components
│   │       └── Sidebar.tsx
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── UsersPage.tsx
│   ├── layouts/             # Layout components
│   │   └── DashboardLayout.tsx
│   ├── routes/              # Routing configuration
│   │   ├── index.tsx
│   │   └── ProtectedRoute.tsx
│   ├── services/            # API services
│   │   └── api/
│   │       ├── client.ts
│   │       └── index.ts
│   ├── store/               # State management
│   │   ├── authStore.ts
│   │   └── userStore.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   ├── styles/              # Global styles
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd d:\POS-GO\frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   copy .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features

✅ Modern, responsive UI with Tailwind CSS  
✅ TypeScript for type safety  
✅ Zustand for state management  
✅ Protected routes with role-based access  
✅ JWT authentication  
✅ Axios interceptors for API calls  
✅ Atomic design pattern  
✅ Dark sidebar navigation  
✅ Beautiful login page  
✅ Dashboard with stats  
✅ User management interface  

## 🔐 Default Login

- **Email**: admin@pos.com
- **Password**: admin123

## 🏗️ Architecture

### Component Structure

- **Atoms**: Basic building blocks (Button, Input, Card, Badge)
- **Molecules**: Combinations of atoms
- **Organisms**: Complex components (Sidebar, Tables)
- **Pages**: Full page components
- **Layouts**: Page layout wrappers

### State Management

- **Zustand stores** for global state
- **authStore**: Authentication state
- **userStore**: User management state

### API Integration

- Centralized Axios client with interceptors
- Automatic token injection
- 401 error handling with auto-redirect

## 🎯 Pages

- `/login` - Login page
- `/dashboard` - Main dashboard (protected)
- `/users` - User management (admin/manager only)
- `/pos` - Point of Sale interface (coming soon)
- `/products` - Product management (coming soon)
- `/reports` - Reports and analytics (coming soon)

## 🔄 Adding New Features

To add a new module (e.g., Products):

1. Create types in `src/types/index.ts`
2. Create API methods in `src/services/api/index.ts`
3. Create Zustand store in `src/store/productStore.ts`
4. Create page component in `src/pages/ProductsPage.tsx`
5. Add route in `src/routes/index.tsx`
6. Add menu item in `src/components/organisms/Sidebar.tsx`

## 📄 License

MIT License
