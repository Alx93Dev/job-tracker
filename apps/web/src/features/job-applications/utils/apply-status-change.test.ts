import { describe, expect, it } from 'vitest';
import { buildJobApplication } from '../test-utils/build-job-application';
import { applyStatusChange } from './apply-status-change';
import { groupByStatus } from './group-by-status';

const changedAt = '2026-11-14T10:00:00.000Z';
const wishlistApplication = buildJobApplication({ id: 'wishlist-1', status: 'WISHLIST' });
const appliedApplication = buildJobApplication({ id: 'applied-1', status: 'APPLIED' });

describe('applyStatusChange', () => {
  it('updates the status and timestamp of the moved application only', () => {
    const updatedApplications = applyStatusChange(
      [wishlistApplication, appliedApplication],
      { id: 'wishlist-1', status: 'INTERVIEW' },
      {},
      changedAt,
    );

    expect(updatedApplications).toEqual([
      { ...wishlistApplication, status: 'INTERVIEW', updatedAt: changedAt },
      appliedApplication,
    ]);
  });

  it('removes the application from a list filtered by its previous status', () => {
    const updatedApplications = applyStatusChange(
      [wishlistApplication],
      { id: 'wishlist-1', status: 'APPLIED' },
      { status: 'WISHLIST' },
      changedAt,
    );

    expect(updatedApplications).toEqual([]);
  });
});

describe('groupByStatus', () => {
  it('returns every column, including empty ones', () => {
    const columns = groupByStatus([wishlistApplication, appliedApplication]);

    expect(columns.WISHLIST).toEqual([wishlistApplication]);
    expect(columns.APPLIED).toEqual([appliedApplication]);
    expect(columns.OFFER).toEqual([]);
    expect(Object.keys(columns)).toHaveLength(5);
  });
});
