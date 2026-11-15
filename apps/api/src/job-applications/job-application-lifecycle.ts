import { ApplicationStatus } from '@prisma/client';
import { FOLLOW_UP_DELAY_DAYS, MILLISECONDS_PER_DAY } from './job-applications.constants';

const CLOSED_STATUSES: readonly ApplicationStatus[] = [
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
];

interface LifecycleState {
  status: ApplicationStatus;
  appliedAt: Date | null;
  followUpAt: Date | null;
}

interface LifecycleInput {
  status?: ApplicationStatus;
  appliedAt?: string | null;
  followUpAt?: string | null;
}

export interface LifecyclePatch {
  appliedAt?: Date;
  followUpAt?: Date | null;
  followUpNotifiedAt?: null;
}

export interface StatusChangeEntry {
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedAt: Date;
}

interface LifecycleResult {
  patch: LifecyclePatch;
  statusChange: StatusChangeEntry | null;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseOptionalDate(value: string | null | undefined, fallback: Date | null): Date | null {
  if (value === undefined) {
    return fallback;
  }
  return value === null ? null : new Date(value);
}

function suggestFollowUpDate(appliedAt: Date, now: Date): Date {
  const suggestedDate = new Date(appliedAt.getTime() + FOLLOW_UP_DELAY_DAYS * MILLISECONDS_PER_DAY);
  return suggestedDate > now ? suggestedDate : startOfUtcDay(now);
}

/**
 * Business rules applied whenever an application is created or edited:
 * - every status change is recorded, which is what the analytics are computed from;
 * - moving to APPLIED fills in today's date if none was given and schedules a follow-up
 *   reminder a week later (never in the past);
 * - OFFER and REJECTED close the process, so a pending follow-up is cancelled;
 * - changing the follow-up date re-arms the reminder.
 * The user's explicit values always win over the defaults.
 */
export function deriveLifecycleChanges(
  current: LifecycleState | null,
  input: LifecycleInput,
  now: Date,
): LifecycleResult {
  const nextStatus = input.status ?? current?.status ?? ApplicationStatus.WISHLIST;
  const isStatusChanged = current === null || nextStatus !== current.status;
  const isMovingToApplied = isStatusChanged && nextStatus === ApplicationStatus.APPLIED;
  const patch: LifecyclePatch = {};

  let appliedAt = parseOptionalDate(input.appliedAt, current?.appliedAt ?? null);
  if (isMovingToApplied && !appliedAt) {
    appliedAt = startOfUtcDay(now);
    patch.appliedAt = appliedAt;
  }

  if (input.followUpAt !== undefined) {
    patch.followUpAt = parseOptionalDate(input.followUpAt, null);
    patch.followUpNotifiedAt = null;
  } else if (isMovingToApplied && !current?.followUpAt && appliedAt) {
    patch.followUpAt = suggestFollowUpDate(appliedAt, now);
    patch.followUpNotifiedAt = null;
  } else if (isStatusChanged && CLOSED_STATUSES.includes(nextStatus)) {
    patch.followUpAt = null;
  }

  return {
    patch,
    statusChange: isStatusChanged
      ? { fromStatus: current?.status ?? null, toStatus: nextStatus, changedAt: now }
      : null,
  };
}
