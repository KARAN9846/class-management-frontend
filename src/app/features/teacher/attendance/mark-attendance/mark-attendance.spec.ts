import { formatLocalCalendarDate } from './mark-attendance';

describe('formatLocalCalendarDate', () => {
  it('formats a local calendar date as YYYY-MM-DD', () => {
    expect(formatLocalCalendarDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('preserves the local calendar day at a year boundary', () => {
    expect(formatLocalCalendarDate(new Date(2025, 11, 31, 23, 59, 59)))
      .toBe('2025-12-31');
    expect(formatLocalCalendarDate(new Date(2026, 0, 1, 0, 0, 1)))
      .toBe('2026-01-01');
  });
});
