# HabitFlow

A modern, full-featured habit tracking and productivity application built with React, TypeScript, and Vite.

## 🌳 Branch Structure

We follow a structured branching strategy for organized development:

- **`main`** - Production-ready code (protected)
- **`develop`** - Integration branch for active development (default)
- **`staging`** - Pre-production testing environment
- **`feature/*`** - Feature development branches
- **`bugfix/*`** - Bug fix branches
- **`hotfix/*`** - Critical production fixes

📖 See [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md) for complete workflow details.

---

## ✨ Features

### Core
- ⚛️ **React 18** - Latest version with concurrent features
- 📘 **TypeScript** - Type safety and better developer experience
- ⚡ **Vite** - Lightning-fast HMR and build tool

### State Management & Data Fetching
- 🐻 **Zustand** - Lightweight state management with persistence support
- 🌐 **Axios** - Promise-based HTTP client with interceptors
- 🔄 **React Query** - Powerful data synchronization for React

### Routing & Forms
- 🚀 **React Router v6** - Declarative routing for React
- 📝 **React Hook Form** - Performant, flexible forms with easy validation
- ✅ **Zod** - TypeScript-first schema validation

### UI & Styling
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🎯 **Custom Components** - Pre-built Button, Input components
- 🌗 **Dark Mode** - Built-in dark mode support

### Testing & Quality
- 🧪 **Vitest** - Fast unit testing framework
- 🧩 **Testing Library** - React Testing Library for component tests
- 📏 **ESLint** - Code linting with TypeScript support
- ✨ **Prettier** - Code formatting with Tailwind plugin

### Utilities
- 📅 **date-fns** - Modern date utility library
- 🔧 **Custom Hooks** - useDebounce, useLocalStorage, and more
- 🛠️ **Helper Functions** - Formatters, class name utilities
- 📁 **Path Aliases** - Import with `@/` prefix

## 📁 Project Structure

```
.
├── src/
│   ├── components/     # Reusable components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── test/           # Test setup and utilities
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── README.md          # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📜 Available Scripts

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and auto-fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Access environment variables in your code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

### Path Aliases

The template includes path alias configuration for cleaner imports:

```typescript
// Instead of
import Component from '../../../components/Component'

// You can use
import Component from '@/components/Component'
```

### State Management with Zustand

Example store with persistence:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Store {
  count: number
  increment: () => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'my-storage' }
  )
)
```

### API Configuration

The template includes a configured Axios instance in `src/lib/api.ts` with:
- Request/response interceptors
- Auth token handling
- Error handling
- Base URL configuration

### TypeScript

TypeScript is configured with strict mode enabled. Modify `tsconfig.json` to adjust settings.

### Vite

Vite configuration is in `vite.config.ts`. The template includes:
- React plugin
- Path aliases
- Test configuration
- Build optimizations

## 🎨 Styling

This template comes with **Tailwind CSS** pre-configured with:
- Custom color palette
- Dark mode support
- Prettier plugin for class sorting
- PostCSS with autoprefixer

### Customizing Tailwind
Edit `tailwind.config.js` to customize colors, spacing, fonts, etc.

### Using the `cn()` utility
The template includes a `cn()` utility for conditional class names:

```typescript
import { cn } from '@/utils/cn'

<div className={cn('base-class', isActive && 'active-class', className)} />
```

## 🧪 Testing

The template includes Vitest and React Testing Library with example tests:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './components/Button'

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByText('Click me'))
    
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

Run tests:
```bash
npm test              # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:coverage # Generate coverage report
```

## 📦 Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory, ready to be deployed to any static hosting service.

## 🚀 Deployment

This template works with any static hosting service:

- **Vercel**: `vercel`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Configure with GitHub Actions
- **AWS S3**: Upload `dist/` folder

## 🤝 Contributing

Feel free to customize this template for your needs!

## 📄 License

MIT
