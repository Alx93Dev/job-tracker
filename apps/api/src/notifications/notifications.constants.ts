import { ApplicationStatus } from '@prisma/client';

export const FOLLOW_UP_SCAN_CRON = '0 * * * *';
export const FOLLOW_UP_SCAN_JOB_NAME = 'follow-up-reminders';

export const FOLLOW_UP_REMINDER_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.INTERVIEW,
];

export const NOTIFICATIONS_PAGE_SIZE = 20;

export function buildFollowUpMessage(positionTitle: string, companyName: string): string {
  return `Time to follow up on ${positionTitle} at ${companyName}`;
}
