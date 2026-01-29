/**
 * Date Utility Functions (Pure)
 *
 * Side-effect free date operations
 */

export class DateUtils {
  /**
   * Format date to Turkish locale format
   * @param date Date object or ISO string
   * @param format Format string (default: DD.MM.YYYY)
   * @returns Formatted date string
   */
  static formatDate(date: Date | string, format: string = 'DD.MM.YYYY'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
      return '';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', String(year))
      .replace('HH', hours)
      .replace('mm', minutes);
  }

  /**
   * Get relative time (e.g., "2 saat önce")
   * @param date Date object or ISO string
   * @returns Relative time string in Turkish
   */
  static dateAgo(date: Date | string): string {
    const now = new Date();
    const past = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(past.getTime())) {
      return '';
    }

    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 30) return `${diffDay} gün önce`;
    if (diffMonth < 12) return `${diffMonth} ay önce`;
    return `${diffYear} yıl önce`;
  }

  /**
   * Check if date is today
   * @param date Date object or ISO string
   * @returns True if date is today
   */
  static isToday(date: Date | string): boolean {
    const today = new Date();
    const check = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(check.getTime())) {
      return false;
    }

    return today.toDateString() === check.toDateString();
  }

  /**
   * Check if date is yesterday
   * @param date Date object or ISO string
   * @returns True if date is yesterday
   */
  static isYesterday(date: Date | string): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const check = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(check.getTime())) {
      return false;
    }

    return yesterday.toDateString() === check.toDateString();
  }

  /**
   * Get date range (start and end of day)
   * @param date Date object or ISO string
   * @returns Object with start and end dates
   */
  static getDateRange(date: Date | string): { start: Date; end: Date } {
    const d = typeof date === 'string' ? new Date(date) : date;

    const start = new Date(d);
    start.setHours(0, 0, 0, 0);

    const end = new Date(d);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  /**
   * Parse date string to Date object
   * @param dateString Date string in various formats
   * @returns Date object or null if invalid
   */
  static parseDate(dateString: string): Date | null {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Add days to date
   * @param date Date object
   * @param days Number of days to add (can be negative)
   * @returns New date object
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Get difference in days between two dates
   * @param date1 First date
   * @param date2 Second date
   * @returns Number of days difference
   */
  static daysDifference(date1: Date, date2: Date): number {
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
