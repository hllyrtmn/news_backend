/**
 * Number Utility Functions (Pure)
 *
 * Side-effect free number operations
 */

export class NumberUtils {
  /**
   * Format number with Turkish locale
   * @param num Number to format
   * @param decimals Number of decimal places (default: 0)
   * @returns Formatted number string
   */
  static formatNumber(num: number, decimals: number = 0): string {
    if (isNaN(num)) {
      return '0';
    }

    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }

  /**
   * Abbreviate large numbers (1K, 1M, etc.)
   * @param num Number to abbreviate
   * @param decimals Number of decimal places (default: 1)
   * @returns Abbreviated number string
   */
  static abbreviate(num: number, decimals: number = 1): string {
    if (isNaN(num)) {
      return '0';
    }

    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(decimals)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(decimals)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(decimals)}K`;
    }

    return num.toString();
  }

  /**
   * Calculate percentage
   * @param value Current value
   * @param total Total value
   * @param decimals Number of decimal places (default: 0)
   * @returns Percentage value
   */
  static percentage(value: number, total: number, decimals: number = 0): number {
    if (total === 0 || isNaN(value) || isNaN(total)) {
      return 0;
    }

    const percent = (value / total) * 100;
    return Number(percent.toFixed(decimals));
  }

  /**
   * Format currency (Turkish Lira)
   * @param amount Amount to format
   * @param showSymbol Show currency symbol (default: true)
   * @returns Formatted currency string
   */
  static formatCurrency(amount: number, showSymbol: boolean = true): string {
    if (isNaN(amount)) {
      return showSymbol ? '0 ₺' : '0';
    }

    const formatted = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    return showSymbol ? `${formatted} ₺` : formatted;
  }

  /**
   * Clamp number between min and max
   * @param num Number to clamp
   * @param min Minimum value
   * @param max Maximum value
   * @returns Clamped number
   */
  static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  /**
   * Check if number is in range
   * @param num Number to check
   * @param min Minimum value
   * @param max Maximum value
   * @returns True if in range
   */
  static inRange(num: number, min: number, max: number): boolean {
    return num >= min && num <= max;
  }

  /**
   * Round to specified decimal places
   * @param num Number to round
   * @param decimals Decimal places (default: 2)
   * @returns Rounded number
   */
  static round(num: number, decimals: number = 2): number {
    if (isNaN(num)) {
      return 0;
    }

    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }

  /**
   * Calculate difference percentage between two numbers
   * @param oldValue Old value
   * @param newValue New value
   * @returns Percentage change (positive for increase, negative for decrease)
   */
  static percentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) {
      return newValue > 0 ? 100 : 0;
    }

    return this.round(((newValue - oldValue) / oldValue) * 100);
  }

  /**
   * Generate random number between min and max
   * @param min Minimum value
   * @param max Maximum value
   * @returns Random number
   */
  static random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate random integer between min and max
   * @param min Minimum value
   * @param max Maximum value
   * @returns Random integer
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max + 1));
  }

  /**
   * Check if number is even
   * @param num Number to check
   * @returns True if even
   */
  static isEven(num: number): boolean {
    return num % 2 === 0;
  }

  /**
   * Check if number is odd
   * @param num Number to check
   * @returns True if odd
   */
  static isOdd(num: number): boolean {
    return num % 2 !== 0;
  }

  /**
   * Format file size in bytes to human readable format
   * @param bytes File size in bytes
   * @param decimals Number of decimal places (default: 2)
   * @returns Formatted file size string
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    if (isNaN(bytes)) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }
}
