'use client';

import { APPLICATION_STATUS_LABELS } from '../constants/application-status-display';
import { APPLICATION_STATUSES, type ApplicationStatus } from '../types/application-status';

interface StatusFilterProps {
  selectedStatus?: ApplicationStatus;
  onChange: (status?: ApplicationStatus) => void;
}

const ALL_STATUSES_LABEL = 'All';

export function StatusFilter({ selectedStatus, onChange }: StatusFilterProps) {
  const filterOptions = [undefined, ...APPLICATION_STATUSES];

  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
      {filterOptions.map((status) => {
        const isSelected = status === selectedStatus;
        return (
          <button
            key={status ?? 'ALL'}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(status)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              isSelected
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            {status ? APPLICATION_STATUS_LABELS[status] : ALL_STATUSES_LABEL}
          </button>
        );
      })}
    </div>
  );
}
