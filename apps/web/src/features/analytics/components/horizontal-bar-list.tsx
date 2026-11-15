interface HorizontalBarItem {
  key: string;
  label: string;
  value: number;
  annotation?: string;
}

interface HorizontalBarListProps {
  items: HorizontalBarItem[];
  ariaLabel: string;
}

/**
 * One measure across a few categories: single hue, bars scaled to the largest value and
 * every bar labelled with its number, so nothing depends on reading the bar length alone.
 */
export function HorizontalBarList({ items, ariaLabel }: HorizontalBarListProps) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <ul aria-label={ariaLabel} className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.key} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm">
          <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
          <span className="h-3 rounded-r bg-chart-grid" aria-hidden="true">
            <span
              className="block h-full rounded-r bg-chart-series-1"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </span>
          <span className="text-right tabular-nums">
            <span className="font-medium">{item.value}</span>
            {item.annotation && (
              <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">
                {item.annotation}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
