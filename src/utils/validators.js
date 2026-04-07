/**
 * Validates user input against specified rules
 * @param {any} input - The input to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with isValid and errors
 */
function validateInput(input, rules = {}) {
  const errors = [];

  if (rules.required && (input === null || input === undefined || input === '')) {
    errors.push('Input is required');
  }

  if (rules.type && typeof input !== rules.type) {
    errors.push(`Expected type ${rules.type}, got ${typeof input}`);
  }

  if (rules.minLength && typeof input === 'string' && input.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength}`);
  }

  if (rules.maxLength && typeof input === 'string' && input.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength}`);
  }

  if (rules.min && typeof input === 'number' && input < rules.min) {
    errors.push(`Minimum value is ${rules.min}`);
  }

  if (rules.max && typeof input === 'number' && input > rules.max) {
    errors.push(`Maximum value is ${rules.max}`);
  }

  if (rules.pattern && typeof input === 'string' && !rules.pattern.test(input)) {
    errors.push('Input does not match required pattern');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes a string by removing potentially dangerous characters
 * @param {string} input - The string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Formats an API response consistently
 * @param {any} data - The data to include in the response
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Optional message
 * @returns {Object} Formatted response object
 */
function formatResponse(data, success = true, message = '') {
  return {
    success,
    data: success ? data : null,
    error: success ? null : data,
    message,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  validateInput,
  sanitizeString,
  formatResponse
};
