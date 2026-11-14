import {
  APPLICATION_STATUS_BADGE_CLASSES,
  APPLICATION_STATUS_LABELS,
} from '../constants/application-status-display';
import type { ApplicationStatus } from '../types/application-status';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${APPLICATION_STATUS_BADGE_CLASSES[status]}`}
    >
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}
