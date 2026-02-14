/**
 * Validates that a string is a plausible email address.
 */
export function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    email,
  );
}

/**
 * Returns an error string if the value is empty, or null if valid.
 */
export function isNonEmpty(val: string, fieldName: string): string | null {
  return val.trim().length === 0 ? `${fieldName} is required.` : null;
}

/**
 * Returns an error string if value exceeds max length, or null if valid.
 */
export function maxLength(val: string, max: number, fieldName: string): string | null {
  return val.length > max ? `${fieldName} must be ${max} characters or fewer.` : null;
}

/**
 * Validates an ISO date string (YYYY-MM-DD).
 */
export function isValidDate(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const d = new Date(val + 'T00:00:00');
  return !isNaN(d.getTime()) && d.toISOString().startsWith(val);
}

/**
 * Returns an error if value is not one of the allowed values, or null if valid.
 */
export function isOneOf<T extends string>(val: string, allowed: T[], fieldName: string): string | null {
  return allowed.includes(val as T) ? null : `${fieldName} must be one of: ${allowed.join(', ')}.`;
}
