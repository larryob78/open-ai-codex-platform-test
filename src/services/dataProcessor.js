/**
 * Data processing service for transforming and analyzing data
 */
class DataProcessor {
  /**
   * Filters an array based on a predicate function
   * @param {Array} data - The array to filter
   * @param {Function} predicate - The filter function
   * @returns {Array} Filtered array
   */
  filter(data, predicate) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    if (typeof predicate !== 'function') {
      throw new Error('Predicate must be a function');
    }
    return data.filter(predicate);
  }

  /**
   * Maps an array using a transform function
   * @param {Array} data - The array to transform
   * @param {Function} transform - The transform function
   * @returns {Array} Transformed array
   */
  map(data, transform) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    if (typeof transform !== 'function') {
      throw new Error('Transform must be a function');
    }
    return data.map(transform);
  }

  /**
   * Groups array items by a key
   * @param {Array} data - The array to group
   * @param {string|Function} key - The key to group by
   * @returns {Object} Grouped data
   */
  groupBy(data, key) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    return data.reduce((groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  /**
   * Calculates statistics for an array of numbers
   * @param {Array<number>} numbers - Array of numbers
   * @returns {Object} Statistics object with min, max, sum, avg, count
   */
  getStatistics(numbers) {
    if (!Array.isArray(numbers)) {
      throw new Error('Input must be an array');
    }
    if (numbers.length === 0) {
      return { min: null, max: null, sum: 0, avg: null, count: 0 };
    }

    const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));

    if (validNumbers.length === 0) {
      return { min: null, max: null, sum: 0, avg: null, count: 0 };
    }

    const sum = validNumbers.reduce((acc, n) => acc + n, 0);

    return {
      min: Math.min(...validNumbers),
      max: Math.max(...validNumbers),
      sum,
      avg: sum / validNumbers.length,
      count: validNumbers.length
    };
  }

  /**
   * Removes duplicate values from an array
   * @param {Array} data - The array to deduplicate
   * @param {string} [key] - Optional key for object deduplication
   * @returns {Array} Deduplicated array
   */
  unique(data, key = null) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    if (key) {
      const seen = new Set();
      return data.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    }

    return [...new Set(data)];
  }

  /**
   * Sorts an array by a key or comparison function
   * @param {Array} data - The array to sort
   * @param {string|Function} keyOrCompare - Key or comparison function
   * @param {string} [order='asc'] - Sort order ('asc' or 'desc')
   * @returns {Array} Sorted array
   */
  sort(data, keyOrCompare, order = 'asc') {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    const copy = [...data];

    if (typeof keyOrCompare === 'function') {
      return copy.sort(keyOrCompare);
    }

    return copy.sort((a, b) => {
      const aVal = a[keyOrCompare];
      const bVal = b[keyOrCompare];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return order === 'desc' ? -comparison : comparison;
    });
  }
}

module.exports = { DataProcessor };
