'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const THEME_SEQUENCE = ['system', 'light', 'dark'] as const;
type ThemeChoice = (typeof THEME_SEQUENCE)[number];

const THEME_LABELS: Record<ThemeChoice, string> = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme',
};

const THEME_ICONS: Record<ThemeChoice, string> = {
  system: '🖥️',
  light: '☀️',
  dark: '🌙',
};

const subscribeToNothing = () => () => {};

function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

function toThemeChoice(theme?: string): ThemeChoice {
  return THEME_SEQUENCE.find((choice) => choice === theme) ?? 'system';
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return <span className="size-9" aria-hidden="true" />;
  }

  const currentTheme = toThemeChoice(theme);
  const nextTheme =
    THEME_SEQUENCE[(THEME_SEQUENCE.indexOf(currentTheme) + 1) % THEME_SEQUENCE.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={`${THEME_LABELS[currentTheme]}. Switch to ${THEME_LABELS[nextTheme].toLowerCase()}`}
      title={THEME_LABELS[currentTheme]}
      className="flex size-9 items-center justify-center rounded-md border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      <span aria-hidden="true">{THEME_ICONS[currentTheme]}</span>
    </button>
  );
}
