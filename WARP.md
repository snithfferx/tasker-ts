# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Tasker is a hybrid time tracking application built with **Astro.js 5.13** + **React.js 19** following Astro's Islands Architecture pattern. It combines static site generation for performance with interactive React islands for dynamic functionality, backed by **Firebase** for authentication and data persistence.

## Common Development Commands

### Development Server

```bash
# Start development server (runs on port 8080)
bun dev

# Alternative using pnpm scripts
pnpm run dev
```

### Authentication

```bash
# API endpoints available in server mode:
# POST /api/login     - User login with email/password
# POST /api/register  - User registration
# GET|POST /api/logout - User logout
```

### Build and Deployment

```bash
# Build production site
bun build

# Preview production build locally  
bun preview

# Run Astro CLI commands
bun astro [command]
```

### Testing

```bash
# Run Jest tests
bun test

# Run tests with coverage
bun test --coverage

# Run single test file
bun test [test-file-name]
```

### Code Quality

```bash
# Format code with Prettier
bun run prettier --write .

# Lint with ESLint (uses TypeScript ESLint + Astro plugin)
bun run eslint .
```

## Architecture Overview

### Server-Side Rendering + Islands Architecture

This project uses Astro's server mode with Islands Architecture:

- **Server-Side Rendering**: Authentication API routes, dynamic pages
- **Static Pages** (`.astro` files): Landing page, authentication pages, layouts  
- **Interactive Islands** (React `.tsx` components): Timer, forms, task management, charts
- **API Routes** (`/api/*`): POST-based authentication endpoints
- **Selective Hydration**: Only interactive components hydrate client-side using `client:*` directives

### Client Hydration Strategy

| Component Type | Directive | When to Use |
|---------------|-----------|-------------|
| Timer | `client:load` | Immediate interactivity required |
| Forms (TaskForm, AuthForm) | `client:load` | Critical for user interaction |
| TaskList | `client:load` | Real-time updates needed |
| Charts/Analytics | `client:load` | Data visualization |
| Non-critical components | `client:visible` or `client:idle` | Performance optimization |

### Authentication Flow Architecture

```markdown
┌─ Authentication Flow ─┐
│ ├─ POST /api/login     │ → Firebase Auth → Set HTTP-only cookie → Redirect
│ ├─ POST /api/register  │ → Firebase Auth → Set HTTP-only cookie → Redirect 
│ ├─ GET/POST /api/logout│ → Clear cookie → Redirect to home
│ └─ AuthForm Component │ → Native HTML form submission (no JS required)
└────────────────────────┘

┌─ Firebase Services ─┐
│ ├─ Authentication   │ (Server-side via API routes)
│ ├─ Firestore       │ (firestore.ts - task/time management)
│ └─ Configuration   │ (firebase.ts + constants.ts)
└─────────────────────┘
```

## Project Structure

### Key Directories

```txt
src/
├── pages/                    # Astro pages + API routes
│   ├── api/                 # Server-side API endpoints
│   │   ├── login.ts         # POST login endpoint
│   │   ├── register.ts      # POST registration endpoint
│   │   └── logout.ts        # GET/POST logout endpoint
│   ├── api/                 # Authentication
│   │   ├── login.astro      # POST login endpoint
│   │   ├── register.astro   # POST registration endpoint
│   │   └── logout.astro     # GET/POST logout endpoint
│   ├── index.astro          # Landing page
│   └── dashboard.astro      # Main app interface
├── layouts/
│   ├── BaseLayout.astro     # Static wrapper + global styles
│   └── DashboardLayout.astro # Authenticated app wrapper
├── services/                # Firebase & data services
│   ├── firebase.ts          # Firebase config + TypeScript types
│   ├── auth.ts             # Authentication helpers (stubbed)
│   └── firestore.ts        # Database operations
├── configs/
│   └── constants.ts        # Environment variable imports
└── styles/
    └── global.css          # Tailwind CSS imports
```

### Route Aliasing

Based on Jest configuration, the following path aliases are available:

- `@Components/*` → `src/components/*`
- `@Layouts/*` → `src/layouts/*`  
- `@Pages/*` → `src/pages/*`
- `@Services/*` → `src/services/*`
- `@Configs/*` → `src/configs/*`
- `@Types/*` → `src/types/*`

**Important**: Always use these aliases instead of relative paths like `../` for better maintainability.

## Data Models & Firebase Schema

### Core Entities

```typescript
// Task entity (src/services/firebase.ts)
interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  project: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  timeSpent: number; // seconds
  createdAt: string;
  updatedAt: string;
}

// Time tracking entry
interface TimeEntry {
  id?: string;
  userId: string;
  taskId?: string;
  taskName: string;
  duration: number; // seconds
  startedAt: string;
  endedAt: string;
  notes?: string;
}
```

### Firestore Structure

```txt
users/
  {userId}/
    ├── tasks/          # User's tasks
    ├── timeEntries/    # Time tracking records  
    └── categories/     # Task categories
```

## Development Workflow

### Phase Implementation Status

According to `requirements.md`:

- ✅ **Phase 1**: Astro + React setup, Firebase config, layouts
- ✅ **Phase 2**: Static pages (landing, auth layouts, dashboard layout)
- ✅ **Phase 3**: Interactive islands (Timer, TaskForm, TaskList, Charts, Categories)
- 🚧 **Phase 4**: Firebase authentication (POST-based API routes implemented)

### Authentication Implementation

**Form Submission**: Uses native HTML forms with POST method (no JavaScript required for basic functionality)
**Security**: HTTP-only cookies for session management
**Error Handling**: Server-side validation with client-side error display
**Firebase Integration**: Server-side authentication via Firebase Admin SDK

### Creating New Interactive Components

1. Create React component in `src/components/react/`
2. Import in Astro page/layout
3. Add appropriate `client:*` directive
4. Use Firebase services from `@Services/*`

### Environment Variables

Required Firebase configuration in `.env`:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`  
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`

## Testing Configuration

### Jest Setup

- **Environment**: jsdom (for React components)
- **Coverage threshold**: 70% branches, 75% functions/lines/statements
- **Test locations**: `tests/**/*` and `src/**/__tests__/**/*`
- **Path mapping**: Mirrors alias configuration

### Testing Strategy

- Static pages: Build success + route rendering
- React islands: Component behavior + Firebase integration
- Services: Database operations + auth flows

## Code Quality Standards

### ESLint Configuration

Uses recommended configs for:

- JavaScript (`@eslint/js`)
- TypeScript (`typescript-eslint`)
- Astro (`eslint-plugin-astro`)

### Style Guidelines  

- **TypeScript**: Strict mode enabled
- **React**: JSX with `react-jsx` transform
- **Prettier**: Code formatting
- **Standard**: ESLint style rules

## Performance Considerations

### Static Optimization

- Astro generates static HTML for all non-interactive content
- CSS/JS only loaded for hydrated components
- Font Awesome loaded via CDN

### Runtime Performance

- Islands hydrate independently
- Firebase real-time listeners only in active components
- Code splitting automatic via Astro

## Key Dependencies

### Core Framework

- **Astro 5.13.5**: Server-side rendering + islands architecture
- **@astrojs/node**: Node.js adapter for server-side features
- **React 19.1.1**: Interactive components
- **TypeScript**: Type safety

### Styling & UI

- **Tailwind CSS 4.1.13**: Utility-first styling
- **Font Awesome 6.4.0**: Icons (CDN)

### Backend Services

- **Firebase 12.2.1**: Auth + Firestore + config
- **date-fns 4.1.0**: Date manipulation

### Development Tools

- **Bun**: Package manager + runtime
- **Jest 30**: Testing framework
- **Prettier 3.6.2**: Code formatting
