const { DataProcessor } = require('../../../src/services/dataProcessor');

describe('DataProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new DataProcessor();
  });

  describe('filter', () => {
    it('should filter array based on predicate', () => {
      const data = [1, 2, 3, 4, 5];
      const result = processor.filter(data, n => n > 3);
      expect(result).toEqual([4, 5]);
    });

    it('should return empty array when no matches', () => {
      const data = [1, 2, 3];
      const result = processor.filter(data, n => n > 10);
      expect(result).toEqual([]);
    });

    it('should throw error for non-array input', () => {
      expect(() => processor.filter('not array', n => n)).toThrow('Data must be an array');
    });

    it('should throw error for non-function predicate', () => {
      expect(() => processor.filter([1, 2], 'not function')).toThrow('Predicate must be a function');
    });
  });

  describe('map', () => {
    it('should transform array elements', () => {
      const data = [1, 2, 3];
      const result = processor.map(data, n => n * 2);
      expect(result).toEqual([2, 4, 6]);
    });

    it('should handle objects', () => {
      const data = [{ name: 'a' }, { name: 'b' }];
      const result = processor.map(data, obj => obj.name);
      expect(result).toEqual(['a', 'b']);
    });

    it('should throw error for non-array input', () => {
      expect(() => processor.map({}, n => n)).toThrow('Data must be an array');
    });

    it('should throw error for non-function transform', () => {
      expect(() => processor.map([1, 2], null)).toThrow('Transform must be a function');
    });
  });

  describe('groupBy', () => {
    it('should group by string key', () => {
      const data = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 }
      ];
      const result = processor.groupBy(data, 'type');
      expect(result).toEqual({
        a: [{ type: 'a', value: 1 }, { type: 'a', value: 3 }],
        b: [{ type: 'b', value: 2 }]
      });
    });

    it('should group by function', () => {
      const data = [1, 2, 3, 4, 5];
      const result = processor.groupBy(data, n => n % 2 === 0 ? 'even' : 'odd');
      expect(result).toEqual({
        odd: [1, 3, 5],
        even: [2, 4]
      });
    });

    it('should handle empty array', () => {
      const result = processor.groupBy([], 'key');
      expect(result).toEqual({});
    });

    it('should throw error for non-array input', () => {
      expect(() => processor.groupBy('not array', 'key')).toThrow('Data must be an array');
    });
  });

  describe('getStatistics', () => {
    it('should calculate statistics for array of numbers', () => {
      const result = processor.getStatistics([1, 2, 3, 4, 5]);
      expect(result).toEqual({
        min: 1,
        max: 5,
        sum: 15,
        avg: 3,
        count: 5
      });
    });

    it('should handle single element', () => {
      const result = processor.getStatistics([42]);
      expect(result).toEqual({
        min: 42,
        max: 42,
        sum: 42,
        avg: 42,
        count: 1
      });
    });

    it('should handle empty array', () => {
      const result = processor.getStatistics([]);
      expect(result).toEqual({
        min: null,
        max: null,
        sum: 0,
        avg: null,
        count: 0
      });
    });

    it('should filter out non-numbers', () => {
      const result = processor.getStatistics([1, 'two', 3, null, 5]);
      expect(result).toEqual({
        min: 1,
        max: 5,
        sum: 9,
        avg: 3,
        count: 3
      });
    });

    it('should handle array with only invalid values', () => {
      const result = processor.getStatistics(['a', null, undefined]);
      expect(result).toEqual({
        min: null,
        max: null,
        sum: 0,
        avg: null,
        count: 0
      });
    });

    it('should throw error for non-array input', () => {
      expect(() => processor.getStatistics(123)).toThrow('Input must be an array');
    });
  });

  describe('unique', () => {
    it('should remove duplicate primitives', () => {
      const result = processor.unique([1, 2, 2, 3, 3, 3]);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should remove duplicate strings', () => {
      const result = processor.unique(['a', 'b', 'a', 'c']);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should deduplicate objects by key', () => {
      const data = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' }
      ];
      const result = processor.unique(data, 'id');
      expect(result).toEqual([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' }
      ]);
    });

    it('should handle empty array', () => {
      const result = processor.unique([]);
      expect(result).toEqual([]);
    });

    it('should throw error for non-array input', () => {
      expect(() => processor.unique('not array')).toThrow('Data must be an array');
    });
  });

  describe('sort', () => {
    it('should sort by key ascending', () => {
      const data = [{ v: 3 }, { v: 1 }, { v: 2 }];
      const result = processor.sort(data, 'v');
      expect(result).toEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
    });

    it('should sort by key descending', () => {
      const data = [{ v: 1 }, { v: 3 }, { v: 2 }];
      const result = processor.sort(data, 'v', 'desc');
      expect(result).toEqual([{ v: 3 }, { v: 2 }, { v: 1 }]);
    });

    it('should sort using comparison function', () => {
      const data = [3, 1, 2];
      const result = processor.sort(data, (a, b) => b - a);
      expect(result).toEqual([3, 2, 1]);
    });

    it('should not mutate original array', () => {
      const data = [3, 1, 2];
      processor.sort(data, (a, b) => a - b);
      expect(data).toEqual([3, 1, 2]);
    });

    it('should handle empty array', () => {
      const result = processor.sort([], 'key');
      expect(result).toEqual([]);
    });

    it('should throw error for non-array input', () => {
      expect(() => processor.sort({}, 'key')).toThrow('Data must be an array');
    });
  });
});
