export const APPLICATION_STATUSES = [
  'WISHLIST',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
