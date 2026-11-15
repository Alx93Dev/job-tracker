import { ApplicationStatus } from '@prisma/client';
import { deriveLifecycleChanges } from './job-application-lifecycle';

const now = new Date('2026-11-15T10:30:00.000Z');
const today = new Date('2026-11-15T00:00:00.000Z');
const nextWeek = new Date('2026-11-22T00:00:00.000Z');

const wishlistApplication = {
  status: ApplicationStatus.WISHLIST,
  appliedAt: null,
  followUpAt: null,
};

describe('deriveLifecycleChanges', () => {
  it('records the initial status of a new application', () => {
    const { statusChange } = deriveLifecycleChanges(null, {}, now);

    expect(statusChange).toEqual({
      fromStatus: null,
      toStatus: ApplicationStatus.WISHLIST,
      changedAt: now,
    });
  });

  it('records nothing when the status does not change', () => {
    const { patch, statusChange } = deriveLifecycleChanges(
      wishlistApplication,
      { status: ApplicationStatus.WISHLIST },
      now,
    );

    expect(statusChange).toBeNull();
    expect(patch).toEqual({});
  });

  it('fills in today as applied date and schedules a follow-up a week later', () => {
    const { patch, statusChange } = deriveLifecycleChanges(
      wishlistApplication,
      { status: ApplicationStatus.APPLIED },
      now,
    );

    expect(patch).toEqual({ appliedAt: today, followUpAt: nextWeek, followUpNotifiedAt: null });
    expect(statusChange).toMatchObject({
      fromStatus: ApplicationStatus.WISHLIST,
      toStatus: ApplicationStatus.APPLIED,
    });
  });

  it('keeps the applied date given by the user', () => {
    const { patch } = deriveLifecycleChanges(
      wishlistApplication,
      { status: ApplicationStatus.APPLIED, appliedAt: '2026-11-12' },
      now,
    );

    expect(patch.appliedAt).toBeUndefined();
    expect(patch.followUpAt).toEqual(new Date('2026-11-19T00:00:00.000Z'));
  });

  it('never schedules a suggested follow-up in the past', () => {
    const { patch } = deriveLifecycleChanges(
      wishlistApplication,
      { status: ApplicationStatus.APPLIED, appliedAt: '2026-10-01' },
      now,
    );

    expect(patch.followUpAt).toEqual(today);
  });

  it('prefers the follow-up date chosen by the user and re-arms the reminder', () => {
    const { patch } = deriveLifecycleChanges(
      wishlistApplication,
      { status: ApplicationStatus.APPLIED, followUpAt: '2026-12-01' },
      now,
    );

    expect(patch.followUpAt).toEqual(new Date('2026-12-01'));
    expect(patch.followUpNotifiedAt).toBeNull();
  });

  it('cancels a pending follow-up when the process ends', () => {
    const { patch } = deriveLifecycleChanges(
      { status: ApplicationStatus.INTERVIEW, appliedAt: today, followUpAt: nextWeek },
      { status: ApplicationStatus.REJECTED },
      now,
    );

    expect(patch).toEqual({ followUpAt: null });
  });

  it('keeps the follow-up when moving from applied to interview', () => {
    const { patch } = deriveLifecycleChanges(
      { status: ApplicationStatus.APPLIED, appliedAt: today, followUpAt: nextWeek },
      { status: ApplicationStatus.INTERVIEW },
      now,
    );

    expect(patch).toEqual({});
  });
});
