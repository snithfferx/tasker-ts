# Tasker - Time Tracking and Productivity App

Tasker is a powerful, hybrid time tracking and productivity application designed to help you manage your tasks, track your time, and gain insights into your work habits. Built with a modern tech stack, it combines the performance of static site generation with the interactivity of a single-page application.

## ✨ Key Features

- **Analytics Dashboard**: A comprehensive dashboard with advanced visualizations to track your productivity.
  - **Summary Cards**: Get a quick overview of your total, completed, and pending tasks.
  - **Charts**: Visualize your monthly progress, time spent, task distribution by priority and project, and weekly progress.
- **Search and Filtering**: A powerful system to search and filter your tasks by name, description, category, priority, status, and date range.
- **Report Generation**: Generate and download detailed reports of your tasks and time usage.
- **Dedicated Tasks Page**: A comprehensive interface for managing your tasks, including a time tracker and task creation form.
- **Category Management**: Organize your tasks with a dedicated page for managing categories.
- **Real-time Sync**: All your data is synced in real-time with Firebase.
- **Responsive Design**: A beautiful and responsive interface that works on all devices.

## 🚀 Tech Stack

- **[Astro](https://astro.build/)**: A modern static site builder for the core of the application.
- **[React](https://reactjs.org/)**: Used for building interactive UI components (Islands Architecture).
- **[Tailwind CSS](https://tailwindcss.com/)**: For styling the application.
- **[Firebase](https://firebase.google.com/)**: Used for real-time database and authentication.
- **[Recharts](https://recharts.org/)**: For creating beautiful and interactive charts.
- **[TypeScript](https://www.typescriptlang.org/)**: For type safety and improved developer experience.

## Project Structure

The project follows the standard Astro project structure, with a few additions:

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── astro/
│   │   └── react/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   └── styles/
└── package.json
```

- `src/components/astro`: Contains static Astro components.
- `src/components/react`: Contains interactive React components (islands).
- `src/layouts`: Contains the basic layouts for the pages.
- `src/pages`: Contains the pages of the application.
- `src/services`: Contains the Firebase configuration and services.
- `src/styles`: Contains the global styles for the application.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command | Action |
| :--- | :--- |
| `bun install` | Installs dependencies |
| `bun dev` | Starts local dev server at `localhost:4321` |
| `bun build` | Build your production site to `./dist/` |
| `bun preview` | Preview your build locally, before deploying |
| `bun astro ...` | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).