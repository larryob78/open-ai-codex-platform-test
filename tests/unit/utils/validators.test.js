const { validateInput, sanitizeString, formatResponse } = require('../../../src/utils/validators');

describe('validators', () => {
  describe('validateInput', () => {
    describe('required rule', () => {
      it('should fail when required input is null', () => {
        const result = validateInput(null, { required: true });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Input is required');
      });

      it('should fail when required input is undefined', () => {
        const result = validateInput(undefined, { required: true });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Input is required');
      });

      it('should fail when required input is empty string', () => {
        const result = validateInput('', { required: true });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Input is required');
      });

      it('should pass when required input has value', () => {
        const result = validateInput('test', { required: true });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('type rule', () => {
      it('should fail when type does not match', () => {
        const result = validateInput('123', { type: 'number' });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Expected type number, got string');
      });

      it('should pass when type matches', () => {
        const result = validateInput(123, { type: 'number' });
        expect(result.isValid).toBe(true);
      });
    });

    describe('minLength rule', () => {
      it('should fail when string is too short', () => {
        const result = validateInput('ab', { minLength: 3 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Minimum length is 3');
      });

      it('should pass when string meets minimum length', () => {
        const result = validateInput('abc', { minLength: 3 });
        expect(result.isValid).toBe(true);
      });
    });

    describe('maxLength rule', () => {
      it('should fail when string is too long', () => {
        const result = validateInput('abcdef', { maxLength: 5 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Maximum length is 5');
      });

      it('should pass when string is within max length', () => {
        const result = validateInput('abc', { maxLength: 5 });
        expect(result.isValid).toBe(true);
      });
    });

    describe('min/max value rules', () => {
      it('should fail when number is below minimum', () => {
        const result = validateInput(5, { min: 10 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Minimum value is 10');
      });

      it('should fail when number exceeds maximum', () => {
        const result = validateInput(15, { max: 10 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Maximum value is 10');
      });

      it('should pass when number is within range', () => {
        const result = validateInput(7, { min: 5, max: 10 });
        expect(result.isValid).toBe(true);
      });
    });

    describe('pattern rule', () => {
      it('should fail when pattern does not match', () => {
        const result = validateInput('abc123', { pattern: /^[a-z]+$/ });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Input does not match required pattern');
      });

      it('should pass when pattern matches', () => {
        const result = validateInput('abc', { pattern: /^[a-z]+$/ });
        expect(result.isValid).toBe(true);
      });
    });

    describe('multiple rules', () => {
      it('should collect multiple errors', () => {
        const result = validateInput('a', {
          required: true,
          minLength: 5,
          pattern: /^[0-9]+$/
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
      });
    });

    it('should pass with no rules', () => {
      const result = validateInput('anything');
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML angle brackets', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should remove event handlers', () => {
      expect(sanitizeString('onclick=alert(1)')).toBe('alert(1)');
      expect(sanitizeString('onmouseover=hack()')).toBe('hack()');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(123)).toBe('');
      expect(sanitizeString({})).toBe('');
    });

    it('should handle safe strings unchanged', () => {
      expect(sanitizeString('Hello, World!')).toBe('Hello, World!');
    });
  });

  describe('formatResponse', () => {
    it('should format successful response', () => {
      const data = { id: 1, name: 'Test' };
      const result = formatResponse(data, true, 'Success');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.error).toBeNull();
      expect(result.message).toBe('Success');
      expect(result.timestamp).toBeDefined();
    });

    it('should format error response', () => {
      const error = 'Something went wrong';
      const result = formatResponse(error, false, 'Error occurred');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe(error);
      expect(result.message).toBe('Error occurred');
    });

    it('should use default values', () => {
      const result = formatResponse({ test: true });

      expect(result.success).toBe(true);
      expect(result.message).toBe('');
    });

    it('should include valid ISO timestamp', () => {
      const result = formatResponse({});
      const timestamp = new Date(result.timestamp);
      expect(timestamp instanceof Date).toBe(true);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });
  });
});
