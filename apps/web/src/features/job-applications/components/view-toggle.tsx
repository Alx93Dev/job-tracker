'use client';

import { VIEW_MODE_LABELS, VIEW_MODES, type ViewMode } from '../constants/view-modes';

interface ViewToggleProps {
  selectedViewMode: ViewMode;
  onChange: (viewMode: ViewMode) => void;
}

export function ViewToggle({ selectedViewMode, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="View"
      className="inline-flex rounded-md border border-slate-300 p-0.5 dark:border-slate-700"
    >
      {VIEW_MODES.map((viewMode) => (
        <button
          key={viewMode}
          type="button"
          aria-pressed={viewMode === selectedViewMode}
          onClick={() => onChange(viewMode)}
          className="rounded px-3 py-1 text-sm aria-pressed:bg-slate-900 aria-pressed:text-white dark:aria-pressed:bg-slate-100 dark:aria-pressed:text-slate-900"
        >
          {VIEW_MODE_LABELS[viewMode]}
        </button>
      ))}
    </div>
  );
}
