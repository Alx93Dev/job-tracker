import type { ApplicationStatus } from '../types/application-status';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
};

export const APPLICATION_STATUS_BADGE_CLASSES: Record<ApplicationStatus, string> = {
  WISHLIST: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  INTERVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  OFFER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
};
