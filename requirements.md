# Tasker - Time Tracking App
## LLM Development Guide

### Project Overview
A hybrid time tracking application built with **Astro.js** (static pages) + **React.js** (interactive islands) following Astro's Islands Architecture pattern.

---

## 🎯 Architecture Strategy

### Islands Architecture Implementation
- **Static Pages** (Astro): Landing, About, Documentation
- **Interactive Islands** (React): Timer components, Forms, Dashboard, Charts
- **Hydration Strategy**: Client-side hydration only for interactive components

### Framework Roles
| Framework | Purpose | Implementation |
|-----------|---------|----------------|
| **Astro.js 5.13** | Static site generation, routing, layout | `.astro` files for pages and layouts |
| **React.js 19** | Interactive components (islands) | `.tsx` components with `client:*` directives |

---

## 📋 Step-by-Step Implementation Guide

### Phase 1: Project Setup
```bash
# 1. Initialize Astro project with React integration
npm create astro@latest tasker-app
cd tasker-app
npx astro add react
npx astro add tailwind

# 2. Install required dependencies
bun add firebase react-hook-form recharts date-fns
bun add -d @types/react @types/node prettier standard jest
```

### Phase 2: Project Structure
```
src/
├── pages/                    # Astro pages (static)
│   ├── index.astro          # Landing page
│   ├── dashboard.astro      # Dashboard layout
│   ├── login.astro          # Auth pages
│   └── register.astro
├── components/
│   ├── astro/               # Static Astro components
│   │   ├── Layout.astro
│   │   ├── Header.astro
│   │   └── Footer.astro
│   └── react/               # Interactive React islands
│       ├── Timer.tsx        # Timer component (island)
│       ├── TaskForm.tsx     # Task creation form (island)
│       ├── TaskList.tsx     # Task management (island)
│       ├── Charts.tsx       # Data visualization (island)
│       └── AuthForm.tsx     # Authentication forms (island)
├── layouts/
│   ├── BaseLayout.astro
│   └── DashboardLayout.astro
├── services/
│   ├── firebase.ts          # Firebase configuration
│   ├── auth.ts              # Authentication service
│   └── firestore.ts         # Database operations
└── styles/
    └── global.css           # Global Tailwind styles
```

### Phase 3: Core Implementation Steps

#### Step 3.1: Static Pages Setup
```astro
<!-- src/pages/index.astro (Landing Page - Static) -->
---
import Layout from '../layouts/BaseLayout.astro';
---
<Layout title="Tasker - Time Tracking App">
  <main>
    <section class="hero">
      <h1>Track Your Time Efficiently</h1>
      <p>Professional time tracking made simple</p>
    </section>
    <!-- Static content only -->
  </main>
</Layout>
```

#### Step 3.2: Interactive Islands Setup
```tsx
// src/components/react/Timer.tsx (Interactive Island)
import { useState, useEffect } from 'react';

interface TimerProps {
  taskId?: string;
}

export default function Timer({ taskId }: TimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Timer logic here
  
  return (
    <div className="timer-component">
      <div className="time-display">{formatTime(time)}</div>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
    </div>
  );
}
```

#### Step 3.3: Dashboard Integration
```astro
<!-- src/pages/dashboard.astro -->
---
import DashboardLayout from '../layouts/DashboardLayout.astro';
import Timer from '../components/react/Timer.tsx';
import TaskList from '../components/react/TaskList.tsx';
import Charts from '../components/react/Charts.tsx';
---
<DashboardLayout title="Dashboard">
  <div class="dashboard-grid">
    <!-- Interactive islands with specific hydration -->
    <Timer client:load />
    <TaskList client:visible />
    <Charts client:idle />
  </div>
</DashboardLayout>
```

### Phase 4: Client Directives Strategy
| Component | Directive | Reason |
|-----------|-----------|---------|
| Timer | `client:load` | Immediate interactivity needed |
| TaskForm | `client:load` | Form validation required |
| TaskList | `client:visible` | Load when scrolled into view |
| Charts | `client:idle` | Load when browser is idle |
| AuthForm | `client:load` | Critical for user flow |

---

## 🔧 Technical Specifications

### State Management Strategy
```tsx
// Use React state within islands, Firebase for persistence
// No global state manager needed due to islands architecture

// Example: Task state in TaskList island
export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch from Firebase
    loadTasksFromFirebase().then(setTasks);
  }, []);
}
```

### Firebase Integration
```typescript
// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Configuration
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### Performance Optimizations
- **Static Generation**: All non-interactive pages
- **Partial Hydration**: Only interactive components hydrate
- **Lazy Loading**: Charts and heavy components load when needed
- **Code Splitting**: Automatic with Astro islands

---

## 📊 Data Model & Firebase Schema

### Firestore Collections
```typescript
// Types for TypeScript
interface User {
  userId: string;
  name: string;
  email: string;
  profileSettings: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  createdAt: Date;
}

interface Task {
  taskId: string;
  userId: string;
  title: string;
  description?: string;
  categoryId: string;
  timeSpent: number; // in seconds
  isActive: boolean;
  startTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  categoryId: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface TimeEntry {
  entryId: string;
  taskId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  description?: string;
}
```

---

## 🎨 UI Component Strategy

### Static Components (Astro)
- Navigation bars
- Footers
- Hero sections
- Documentation pages
- SEO components

### Interactive Islands (React)
- Timer controls
- Task creation/editing forms
- Real-time task lists
- Data visualization charts
- User settings panels
- Authentication forms

---

## 🚀 Development Workflow

### Step-by-Step Build Process

1. **Initialize Project Structure**
   ```bash
   bun create astro@latest tasker-app --template minimal --typescript
   cd tasker-app && bun install
   bunx astro add react tailwind
   ```

2. **Setup Firebase**
   ```bash
   bun add firebase
   # Create Firebase project and add config
   ```

3. **Create Base Layouts**
   - BaseLayout.astro (static wrapper)
   - DashboardLayout.astro (authenticated wrapper)

4. **Build Static Pages First**
   - Landing page (index.astro)
   - About page
   - Documentation

5. **Implement Interactive Islands**
   - Start with Timer component
   - Add TaskForm component
   - Build TaskList component
   - Create Charts component

6. **Add Authentication**
   - Firebase Auth setup
   - Login/Register islands
   - Protected route middleware

7. **Integrate Real-time Features**
   - Firebase listeners in islands
   - Real-time data sync
   - Offline support

---

## ✅ Implementation Checklist

### Phase 1: Foundation
- [X] Astro project initialized with React integration
- [X] Project structure created
- [X] Firebase configuration added
- [X] Base layouts implemented
- [X] Tailwind CSS configured

### Phase 2: Static Content
- [X] Landing page created (static)
- [X] Navigation components (static)
- [X] Authentication pages layout (static)
- [X] Dashboard layout (static)

### Phase 3: Interactive Islands
- [x] Timer component with start/stop/pause
- [x] Task creation form
- [x] Task list with real-time updates
- [x] Category management
- [x] Data visualization charts

### Phase 4: Integration
- [x] Firebase authentication flow
- [x] Real-time data synchronization
- [x] Responsive design implementation
- [x] Performance optimization

### Phase 5: Enhancement
- [x] Offline support
- [x] Progressive Web App features
- [x] Advanced analytics
- [x] Export functionality

---

## 📋 Acceptance Criteria

### Static Performance
- [ ] Landing page loads in <2 seconds
- [ ] Perfect Lighthouse performance score for static pages
- [ ] SEO optimized with proper meta tags
- [ ] Mobile-responsive design

### Interactive Functionality
- [ ] Timer works accurately with persistence
- [ ] Real-time data sync across sessions
- [ ] Forms validate and submit correctly
- [ ] Charts render data visualization properly

### User Experience
- [ ] Smooth transitions between static and interactive
- [ ] No layout shifts during hydration
- [ ] Accessible components (WCAG 2.1 AA)
- [ ] Works offline for basic functionality

---

## 🔍 Testing Strategy

### Static Testing
- Astro build succeeds without errors
- All static routes render correctly
- SEO meta tags present on all pages

### Interactive Testing
- React islands hydrate properly
- Firebase integration works
- Timer accuracy testing
- Form validation testing
- Real-time sync testing
