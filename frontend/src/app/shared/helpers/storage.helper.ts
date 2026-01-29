/**
 * Storage Helper Functions
 *
 * Type-safe localStorage wrapper
 */

export class StorageHelper {
  /**
   * Set item in localStorage
   * @param key Storage key
   * @param value Value to store (will be JSON stringified)
   */
  static set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Storage error (set):', error);
    }
  }

  /**
   * Get item from localStorage
   * @param key Storage key
   * @returns Parsed value or null if not found/error
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Storage error (get):', error);
      return null;
    }
  }

  /**
   * Get item with default value
   * @param key Storage key
   * @param defaultValue Default value if not found
   * @returns Stored value or default
   */
  static getWithDefault<T>(key: string, defaultValue: T): T {
    const value = this.get<T>(key);
    return value !== null ? value : defaultValue;
  }

  /**
   * Remove item from localStorage
   * @param key Storage key
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage error (remove):', error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage error (clear):', error);
    }
  }

  /**
   * Check if key exists in localStorage
   * @param key Storage key
   * @returns True if key exists
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from localStorage
   * @returns Array of keys
   */
  static keys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Storage error (keys):', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes
   * @returns Approximate size in bytes
   */
  static getSize(): number {
    let size = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Storage error (getSize):', error);
    }
    return size;
  }

  /**
   * Set item with expiration
   * @param key Storage key
   * @param value Value to store
   * @param expiresInMs Expiration time in milliseconds
   */
  static setWithExpiry<T>(key: string, value: T, expiresInMs: number): void {
    const item = {
      value,
      expiry: Date.now() + expiresInMs
    };
    this.set(key, item);
  }

  /**
   * Get item with expiration check
   * @param key Storage key
   * @returns Value or null if expired/not found
   */
  static getWithExpiry<T>(key: string): T | null {
    const item = this.get<{ value: T; expiry: number }>(key);

    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.remove(key);
      return null;
    }

    return item.value;
  }

  /**
   * Remove items matching pattern
   * @param pattern Regex pattern to match keys
   */
  static removePattern(pattern: RegExp): void {
    try {
      const keys = this.keys();
      keys.forEach(key => {
        if (pattern.test(key)) {
          this.remove(key);
        }
      });
    } catch (error) {
      console.error('Storage error (removePattern):', error);
    }
  }
}
