import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { theme, type Theme } from '@Stores/theme';

export default function ThemeManager() {
  const $theme = useStore(theme);

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    theme.set(initialTheme);
  }, []);

  useEffect(() => {
    // Apply theme to root element and save to localStorage
    if ($theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', $theme);
  }, [$theme]);

  return null; // This component doesn't render anything
}
