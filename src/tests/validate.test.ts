import { describe, it, expect } from 'vitest';
import { isValidEmail, isNonEmpty, maxLength, isValidDate, isOneOf } from '../utils/validate';

describe('isValidEmail', () => {
  it('accepts a standard email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('accepts email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });

  it('accepts email with plus tag', () => {
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('rejects email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejects email without TLD', () => {
    expect(isValidEmail('user@example')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('rejects email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

describe('isNonEmpty', () => {
  it('returns null for non-empty string', () => {
    expect(isNonEmpty('hello', 'Name')).toBeNull();
  });

  it('returns error for empty string', () => {
    expect(isNonEmpty('', 'Name')).toBe('Name is required.');
  });

  it('returns error for whitespace-only string', () => {
    expect(isNonEmpty('   ', 'Name')).toBe('Name is required.');
  });
});

describe('maxLength', () => {
  it('returns null when within limit', () => {
    expect(maxLength('abc', 10, 'Field')).toBeNull();
  });

  it('returns null at exact limit', () => {
    expect(maxLength('abcde', 5, 'Field')).toBeNull();
  });

  it('returns error when exceeding limit', () => {
    expect(maxLength('abcdef', 5, 'Field')).toBe('Field must be 5 characters or fewer.');
  });

  it('returns null for empty string', () => {
    expect(maxLength('', 5, 'Field')).toBeNull();
  });
});

describe('isValidDate', () => {
  it('accepts valid ISO date', () => {
    expect(isValidDate('2024-01-15')).toBe(true);
  });

  it('accepts leap year date', () => {
    expect(isValidDate('2024-02-29')).toBe(true);
  });

  it('rejects invalid leap year date', () => {
    expect(isValidDate('2023-02-29')).toBe(false);
  });

  it('rejects non-date string', () => {
    expect(isValidDate('not-a-date')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidDate('')).toBe(false);
  });

  it('rejects date with wrong format', () => {
    expect(isValidDate('01/15/2024')).toBe(false);
  });

  it('rejects invalid month', () => {
    expect(isValidDate('2024-13-01')).toBe(false);
  });

  it('rejects invalid day', () => {
    expect(isValidDate('2024-01-32')).toBe(false);
  });
});

describe('isOneOf', () => {
  it('returns null for valid value', () => {
    expect(isOneOf('low', ['low', 'medium', 'high'], 'Priority')).toBeNull();
  });

  it('returns error for invalid value', () => {
    const result = isOneOf('extreme', ['low', 'medium', 'high'], 'Priority');
    expect(result).toBe('Priority must be one of: low, medium, high.');
  });

  it('returns error for empty string when not in allowed', () => {
    expect(isOneOf('', ['a', 'b'], 'Field')).not.toBeNull();
  });
});
