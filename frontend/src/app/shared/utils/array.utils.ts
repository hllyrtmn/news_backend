/**
 * Array Utility Functions (Pure)
 *
 * Side-effect free array operations
 */

export class ArrayUtils {
  /**
   * Group array items by key
   * @param array Input array
   * @param key Key to group by
   * @returns Object with grouped arrays
   */
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    if (!array || array.length === 0) {
      return {};
    }

    return array.reduce((result, item) => {
      const group = String(item[key]);
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {} as Record<string, T[]>);
  }

  /**
   * Sort array by key
   * @param array Input array
   * @param key Key to sort by
   * @param order Sort order (asc or desc)
   * @returns Sorted array (new array)
   */
  static sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    if (!array || array.length === 0) {
      return [];
    }

    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal === bVal) return 0;
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Get unique values from array
   * @param array Input array
   * @returns Array with unique values
   */
  static unique<T>(array: T[]): T[] {
    if (!array || array.length === 0) {
      return [];
    }

    return Array.from(new Set(array));
  }

  /**
   * Get unique objects by key
   * @param array Input array of objects
   * @param key Key to check uniqueness
   * @returns Array with unique objects
   */
  static uniqueBy<T>(array: T[], key: keyof T): T[] {
    if (!array || array.length === 0) {
      return [];
    }

    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  /**
   * Chunk array into smaller arrays
   * @param array Input array
   * @param size Chunk size
   * @returns Array of chunked arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    if (!array || array.length === 0 || size < 1) {
      return [];
    }

    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Find items by key value
   * @param array Input array
   * @param key Key to search
   * @param value Value to match
   * @returns Array of matching items
   */
  static findBy<T>(array: T[], key: keyof T, value: any): T[] {
    if (!array || array.length === 0) {
      return [];
    }

    return array.filter(item => item[key] === value);
  }

  /**
   * Remove item from array (immutable)
   * @param array Input array
   * @param item Item to remove
   * @returns New array without item
   */
  static remove<T>(array: T[], item: T): T[] {
    if (!array || array.length === 0) {
      return [];
    }

    return array.filter(i => i !== item);
  }

  /**
   * Remove item by index (immutable)
   * @param array Input array
   * @param index Index to remove
   * @returns New array without item at index
   */
  static removeAt<T>(array: T[], index: number): T[] {
    if (!array || array.length === 0 || index < 0 || index >= array.length) {
      return array;
    }

    return [...array.slice(0, index), ...array.slice(index + 1)];
  }

  /**
   * Move item in array (immutable)
   * @param array Input array
   * @param fromIndex Source index
   * @param toIndex Target index
   * @returns New array with moved item
   */
  static move<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    if (!array || array.length === 0) {
      return array;
    }

    const result = [...array];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  }

  /**
   * Flatten nested array
   * @param array Nested array
   * @param depth Maximum depth to flatten (default: 1)
   * @returns Flattened array
   */
  static flatten<T>(array: any[], depth: number = 1): T[] {
    if (!array || array.length === 0) {
      return [];
    }

    if (depth < 1) {
      return array;
    }

    return array.reduce((acc, val) => {
      return acc.concat(
        Array.isArray(val) ? this.flatten(val, depth - 1) : val
      );
    }, []);
  }

  /**
   * Sum array of numbers
   * @param array Array of numbers
   * @returns Sum of all numbers
   */
  static sum(array: number[]): number {
    if (!array || array.length === 0) {
      return 0;
    }

    return array.reduce((sum, num) => sum + num, 0);
  }

  /**
   * Calculate average of array
   * @param array Array of numbers
   * @returns Average value
   */
  static average(array: number[]): number {
    if (!array || array.length === 0) {
      return 0;
    }

    return this.sum(array) / array.length;
  }

  /**
   * Get min value from array
   * @param array Array of numbers
   * @returns Minimum value
   */
  static min(array: number[]): number | null {
    if (!array || array.length === 0) {
      return null;
    }

    return Math.min(...array);
  }

  /**
   * Get max value from array
   * @param array Array of numbers
   * @returns Maximum value
   */
  static max(array: number[]): number | null {
    if (!array || array.length === 0) {
      return null;
    }

    return Math.max(...array);
  }

  /**
   * Check if arrays are equal (shallow comparison)
   * @param array1 First array
   * @param array2 Second array
   * @returns True if arrays are equal
   */
  static areEqual<T>(array1: T[], array2: T[]): boolean {
    if (array1 === array2) return true;
    if (!array1 || !array2) return false;
    if (array1.length !== array2.length) return false;

    return array1.every((item, index) => item === array2[index]);
  }

  /**
   * Shuffle array (immutable)
   * @param array Input array
   * @returns Shuffled array
   */
  static shuffle<T>(array: T[]): T[] {
    if (!array || array.length === 0) {
      return [];
    }

    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
