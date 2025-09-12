import { atom } from 'nanostores';

export type Theme = 'light' | 'dark';

export const theme = atom<Theme>('light');

export function toggleTheme() {
  const newTheme = theme.get() === 'light' ? 'light' : 'dark';
  theme.set(newTheme);
}
