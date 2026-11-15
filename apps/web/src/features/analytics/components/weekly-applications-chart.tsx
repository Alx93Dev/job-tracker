'use client';

import { useId, useState } from 'react';
import type { WeeklyActivity } from '../types/analytics-summary';
import { formatWeekLabel } from '../utils/format-metrics';

interface WeeklyApplicationsChartProps {
  weeks: WeeklyActivity[];
}

const CHART_HEIGHT_PX = 160;
const Y_TICK_COUNT = 3;
const X_LABEL_EVERY_N_WEEKS = 2;
const TOOLTIP_EDGE_COLUMNS = 2;

function niceMaximum(maxCount: number): number {
  return Math.max(Y_TICK_COUNT, Math.ceil(maxCount / Y_TICK_COUNT) * Y_TICK_COUNT);
}

function pluralizeApplications(count: number): string {
  return count === 1 ? '1 application' : `${count} applications`;
}

/** Labels every other week counting back from the current one, so "this week" is always named. */
function isLabelledWeek(weekIndex: number, weekCount: number): boolean {
  return (weekCount - 1 - weekIndex) % X_LABEL_EVERY_N_WEEKS === 0;
}

/**
 * Centred over its bar, except near the edges, where the tooltip grows inwards so it is
 * never cut off by the chart container.
 */
function tooltipAlignmentClass(weekIndex: number, weekCount: number): string {
  if (weekIndex < TOOLTIP_EDGE_COLUMNS) {
    return '-translate-x-4';
  }
  if (weekIndex >= weekCount - TOOLTIP_EDGE_COLUMNS) {
    return '-translate-x-[calc(100%-1rem)]';
  }
  return '-translate-x-1/2';
}

export function WeeklyApplicationsChart({ weeks }: WeeklyApplicationsChartProps) {
  const tableId = useId();
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState<number | null>(null);
  const [isTableVisible, setIsTableVisible] = useState(false);

  const yMaximum = niceMaximum(Math.max(0, ...weeks.map((week) => week.count)));
  const yTicks = Array.from(
    { length: Y_TICK_COUNT + 1 },
    (_, tickIndex) => (yMaximum / Y_TICK_COUNT) * tickIndex,
  );
  const hoveredWeek = hoveredWeekIndex === null ? null : weeks[hoveredWeekIndex];
  const toPercentOfHeight = (value: number) => `${(value / yMaximum) * 100}%`;

  return (
    <figure className="flex flex-col gap-3">
      {isTableVisible ? (
        <table id={tableId} className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400">
              <th className="py-1 font-medium">Week of</th>
              <th className="py-1 text-right font-medium">Applications</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week.weekStart} className="border-t border-slate-200 dark:border-slate-800">
                <td className="py-1">{formatWeekLabel(week.weekStart)}</td>
                <td className="py-1 text-right tabular-nums">{week.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="grid grid-cols-[1.5rem_1fr] gap-x-2" aria-hidden="true">
          <div
            className="relative text-right text-xs text-slate-500 dark:text-slate-400 tabular-nums"
            style={{ height: CHART_HEIGHT_PX }}
          >
            {yTicks.map((tick) => (
              <span
                key={tick}
                className="absolute right-0 translate-y-1/2"
                style={{ bottom: toPercentOfHeight(tick) }}
              >
                {tick}
              </span>
            ))}
          </div>

          <div
            className="relative"
            style={{ height: CHART_HEIGHT_PX }}
            onMouseLeave={() => setHoveredWeekIndex(null)}
          >
            {yTicks.map((tick) => (
              <div
                key={tick}
                className="absolute inset-x-0 border-t border-chart-grid"
                style={{ bottom: toPercentOfHeight(tick) }}
              />
            ))}

            <div className="relative flex h-full items-end gap-[2px]">
              {weeks.map((week, weekIndex) => {
                const isDimmed = hoveredWeekIndex !== null && hoveredWeekIndex !== weekIndex;
                return (
                  // The whole column is the hover target, so short or empty weeks are easy to hit.
                  <div
                    key={week.weekStart}
                    className="flex h-full flex-1 items-end"
                    onMouseEnter={() => setHoveredWeekIndex(weekIndex)}
                  >
                    <div
                      className={`w-full rounded-t-[4px] bg-chart-series-1 transition-opacity ${isDimmed ? 'opacity-40' : ''}`}
                      style={{ height: toPercentOfHeight(week.count) }}
                    />
                  </div>
                );
              })}
            </div>

            {hoveredWeek && hoveredWeekIndex !== null && (
              <div
                className={`pointer-events-none absolute -top-2 z-10 -translate-y-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs whitespace-nowrap shadow dark:border-slate-700 dark:bg-slate-900 ${tooltipAlignmentClass(hoveredWeekIndex, weeks.length)}`}
                style={{ left: `${((hoveredWeekIndex + 0.5) / weeks.length) * 100}%` }}
              >
                <span className="text-slate-500 dark:text-slate-400">
                  Week of {formatWeekLabel(hoveredWeek.weekStart)}
                </span>
                <span className="ml-2 font-medium">{pluralizeApplications(hoveredWeek.count)}</span>
              </div>
            )}
          </div>

          <div />
          <div className="mt-1 flex gap-[2px] text-xs text-slate-500 dark:text-slate-400">
            {weeks.map((week, weekIndex) => (
              <span key={week.weekStart} className="flex-1 text-center whitespace-nowrap">
                {isLabelledWeek(weekIndex, weeks.length) ? formatWeekLabel(week.weekStart) : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={() => setIsTableVisible((wasVisible) => !wasVisible)}
          aria-expanded={isTableVisible}
          aria-controls={tableId}
          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          {isTableVisible ? 'Show chart' : 'Show as table'}
        </button>
      </div>

      {!isTableVisible && (
        <figcaption className="sr-only">
          Applications sent per week:{' '}
          {weeks.map((week) => `${formatWeekLabel(week.weekStart)}, ${week.count}`).join('; ')}
        </figcaption>
      )}
    </figure>
  );
}
