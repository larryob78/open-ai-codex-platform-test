/**
 * Calculator service for mathematical operations
 */
class Calculator {
  /**
   * Adds two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} Sum of a and b
   */
  add(a, b) {
    this._validateNumbers(a, b);
    return a + b;
  }

  /**
   * Subtracts second number from first
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} Difference of a and b
   */
  subtract(a, b) {
    this._validateNumbers(a, b);
    return a - b;
  }

  /**
   * Multiplies two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} Product of a and b
   */
  multiply(a, b) {
    this._validateNumbers(a, b);
    return a * b;
  }

  /**
   * Divides first number by second
   * @param {number} a - Dividend
   * @param {number} b - Divisor
   * @returns {number} Quotient of a and b
   * @throws {Error} If divisor is zero
   */
  divide(a, b) {
    this._validateNumbers(a, b);
    if (b === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return a / b;
  }

  /**
   * Calculates the power of a number
   * @param {number} base - The base number
   * @param {number} exponent - The exponent
   * @returns {number} base raised to the power of exponent
   */
  power(base, exponent) {
    this._validateNumbers(base, exponent);
    return Math.pow(base, exponent);
  }

  /**
   * Calculates the square root of a number
   * @param {number} n - The number
   * @returns {number} Square root of n
   * @throws {Error} If number is negative
   */
  sqrt(n) {
    if (typeof n !== 'number' || isNaN(n)) {
      throw new Error('Invalid input: expected a number');
    }
    if (n < 0) {
      throw new Error('Cannot calculate square root of negative number');
    }
    return Math.sqrt(n);
  }

  /**
   * Validates that inputs are valid numbers
   * @private
   */
  _validateNumbers(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number' || isNaN(a) || isNaN(b)) {
      throw new Error('Invalid input: expected numbers');
    }
  }
}

module.exports = { Calculator };
