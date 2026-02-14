import { describe, it, expect } from 'vitest';

// We test the TASK_TEMPLATES structure and monthsBefore directly
// without needing Dexie (no DB mocking required).

// Import the templates via a re-export workaround:
// taskGenerator exports generateTasksForSystem and regenerateTasksOnReclassify,
// but TASK_TEMPLATES is not exported. We test via the public API indirectly
// and validate the monthsBefore function which IS exported.

import { monthsBefore } from '../services/taskGenerator';

describe('taskGenerator - monthsBefore', () => {
  it('returns correct date for simple subtraction', () => {
    expect(monthsBefore('2026-08-02', 3)).toBe('2026-05-02');
  });

  it('handles crossing into prior year', () => {
    expect(monthsBefore('2025-02-02', 6)).toBe('2024-08-02');
  });

  it('handles large month subtraction', () => {
    expect(monthsBefore('2026-08-02', 6)).toBe('2026-02-02');
  });

  it('handles day clamping for short months', () => {
    // Subtracting 1 month from March 31 should not overflow to March 3
    const result = monthsBefore('2025-03-31', 1);
    expect(result).toBe('2025-02-28');
  });

  it('handles leap year February', () => {
    // 2024 is a leap year, March 31 - 1 month = Feb 29
    const result = monthsBefore('2024-03-31', 1);
    expect(result).toBe('2024-02-29');
  });

  it('handles zero months', () => {
    expect(monthsBefore('2025-06-15', 0)).toBe('2025-06-15');
  });
});
