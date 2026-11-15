interface StatTileProps {
  label: string;
  value: string;
  detail?: string;
}

export function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-3xl font-semibold tabular-nums">{value}</dd>
      {detail && <dd className="text-xs text-slate-500 dark:text-slate-400">{detail}</dd>}
    </div>
  );
}
