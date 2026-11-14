export const VIEW_MODES = ['board', 'list'] as const;

export type ViewMode = (typeof VIEW_MODES)[number];

export const DEFAULT_VIEW_MODE: ViewMode = 'board';

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  board: 'Board',
  list: 'List',
};

export const VIEW_QUERY_PARAM = 'view';

export const SEARCH_DEBOUNCE_MS = 300;

export function parseViewMode(rawValue: string | null): ViewMode {
  return VIEW_MODES.find((viewMode) => viewMode === rawValue) ?? DEFAULT_VIEW_MODE;
}
