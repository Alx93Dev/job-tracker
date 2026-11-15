import { describe, expect, it } from 'vitest';
import { isFollowUpDue } from './is-follow-up-due';

const now = new Date('2026-11-15T12:00:00.000Z');

describe('isFollowUpDue', () => {
  it('is due for open applications whose follow-up date has passed', () => {
    expect(isFollowUpDue({ status: 'APPLIED', followUpAt: '2026-11-15T00:00:00.000Z' }, now)).toBe(
      true,
    );
    expect(
      isFollowUpDue({ status: 'INTERVIEW', followUpAt: '2026-11-01T00:00:00.000Z' }, now),
    ).toBe(true);
  });

  it('is not due for future dates, missing dates or closed applications', () => {
    expect(isFollowUpDue({ status: 'APPLIED', followUpAt: '2026-11-20T00:00:00.000Z' }, now)).toBe(
      false,
    );
    expect(isFollowUpDue({ status: 'APPLIED', followUpAt: null }, now)).toBe(false);
    expect(isFollowUpDue({ status: 'OFFER', followUpAt: '2026-11-01T00:00:00.000Z' }, now)).toBe(
      false,
    );
  });
});
