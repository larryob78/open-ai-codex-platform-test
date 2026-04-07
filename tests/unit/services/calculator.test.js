const { Calculator } = require('../../../src/services/calculator');

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(calculator.add(-2, -3)).toBe(-5);
    });

    it('should add mixed positive and negative', () => {
      expect(calculator.add(-2, 5)).toBe(3);
    });

    it('should add decimals', () => {
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
    });

    it('should throw error for non-number input', () => {
      expect(() => calculator.add('2', 3)).toThrow('Invalid input: expected numbers');
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers', () => {
      expect(calculator.subtract(5, 3)).toBe(2);
    });

    it('should handle negative results', () => {
      expect(calculator.subtract(3, 5)).toBe(-2);
    });

    it('should subtract negative numbers', () => {
      expect(calculator.subtract(-2, -3)).toBe(1);
    });

    it('should throw error for non-number input', () => {
      expect(() => calculator.subtract(null, 3)).toThrow('Invalid input: expected numbers');
    });
  });

  describe('multiply', () => {
    it('should multiply two positive numbers', () => {
      expect(calculator.multiply(4, 5)).toBe(20);
    });

    it('should multiply by zero', () => {
      expect(calculator.multiply(5, 0)).toBe(0);
    });

    it('should multiply negative numbers', () => {
      expect(calculator.multiply(-3, -4)).toBe(12);
    });

    it('should multiply positive by negative', () => {
      expect(calculator.multiply(3, -4)).toBe(-12);
    });

    it('should throw error for non-number input', () => {
      expect(() => calculator.multiply(undefined, 3)).toThrow('Invalid input: expected numbers');
    });
  });

  describe('divide', () => {
    it('should divide two numbers', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('should handle decimal results', () => {
      expect(calculator.divide(7, 2)).toBe(3.5);
    });

    it('should throw error for division by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Division by zero is not allowed');
    });

    it('should divide negative numbers', () => {
      expect(calculator.divide(-10, -2)).toBe(5);
    });

    it('should throw error for non-number input', () => {
      expect(() => calculator.divide('10', 2)).toThrow('Invalid input: expected numbers');
    });
  });

  describe('power', () => {
    it('should calculate power of positive numbers', () => {
      expect(calculator.power(2, 3)).toBe(8);
    });

    it('should handle zero exponent', () => {
      expect(calculator.power(5, 0)).toBe(1);
    });

    it('should handle negative exponents', () => {
      expect(calculator.power(2, -1)).toBe(0.5);
    });

    it('should handle zero base', () => {
      expect(calculator.power(0, 5)).toBe(0);
    });

    it('should throw error for non-number input', () => {
      expect(() => calculator.power(2, '3')).toThrow('Invalid input: expected numbers');
    });
  });

  describe('sqrt', () => {
    it('should calculate square root of positive number', () => {
      expect(calculator.sqrt(16)).toBe(4);
    });

    it('should calculate square root of decimal', () => {
      expect(calculator.sqrt(2)).toBeCloseTo(1.414, 3);
    });

    it('should handle zero', () => {
      expect(calculator.sqrt(0)).toBe(0);
    });

    it('should throw error for negative number', () => {
      expect(() => calculator.sqrt(-4)).toThrow('Cannot calculate square root of negative number');
    });

    it('should throw error for non-number input', () => {
      expect(() => calculator.sqrt('16')).toThrow('Invalid input: expected a number');
    });

    it('should throw error for NaN', () => {
      expect(() => calculator.sqrt(NaN)).toThrow('Invalid input: expected a number');
    });
  });

  describe('_validateNumbers', () => {
    it('should throw error for NaN inputs', () => {
      expect(() => calculator.add(NaN, 5)).toThrow('Invalid input: expected numbers');
    });
  });
});
