import { ApplicationStatus } from '@prisma/client';

export const FOLLOW_UP_SCAN_CRON = '0 * * * *';
export const FOLLOW_UP_SCAN_JOB_NAME = 'follow-up-reminders';

/**
 * Vercel sets VERCEL=1 in the function environment. Serverless instances are frozen between
 * requests, so an in-process timer cannot be trusted there: a Vercel Cron Job calls the
 * cron endpoint instead. This is a platform variable, available before the .env file loads.
 */
export const IS_IN_PROCESS_SCHEDULER_DISABLED = process.env.VERCEL === '1';

export const CRON_AUTHORIZATION_SCHEME = 'Bearer';

export const FOLLOW_UP_REMINDER_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.INTERVIEW,
];

export const NOTIFICATIONS_PAGE_SIZE = 20;

export function buildFollowUpMessage(positionTitle: string, companyName: string): string {
  return `Time to follow up on ${positionTitle} at ${companyName}`;
}
