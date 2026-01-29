/**
 * String Utility Functions (Pure)
 *
 * Side-effect free string operations
 */

export class StringUtils {
  /**
   * Convert string to URL-friendly slug
   * @param text Input text
   * @returns Slugified string
   */
  static slugify(text: string): string {
    // Turkish character map
    const trMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'C',
      'ğ': 'g', 'Ğ': 'G',
      'ı': 'i', 'İ': 'I',
      'ö': 'o', 'Ö': 'O',
      'ş': 's', 'Ş': 'S',
      'ü': 'u', 'Ü': 'U'
    };

    // Replace Turkish characters
    let result = text;
    Object.entries(trMap).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, 'g'), value);
    });

    return result
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')       // Remove special characters
      .replace(/[\s_-]+/g, '-')       // Replace spaces with -
      .replace(/^-+|-+$/g, '');       // Trim - from start and end
  }

  /**
   * Truncate text to specified length
   * @param text Input text
   * @param length Maximum length (default: 100)
   * @param suffix Suffix to add when truncated (default: '...')
   * @returns Truncated string
   */
  static truncate(text: string, length: number = 100, suffix: string = '...'): string {
    if (!text || text.length <= length) {
      return text;
    }

    return text.substring(0, length).trim() + suffix;
  }

  /**
   * Truncate text by words
   * @param text Input text
   * @param wordCount Maximum word count
   * @param suffix Suffix to add when truncated (default: '...')
   * @returns Truncated string
   */
  static truncateWords(text: string, wordCount: number, suffix: string = '...'): string {
    if (!text) {
      return text;
    }

    const words = text.trim().split(/\s+/);
    if (words.length <= wordCount) {
      return text;
    }

    return words.slice(0, wordCount).join(' ') + suffix;
  }

  /**
   * Capitalize first letter of string
   * @param text Input text
   * @returns Capitalized string
   */
  static capitalize(text: string): string {
    if (!text) {
      return text;
    }

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Capitalize first letter of each word
   * @param text Input text
   * @returns Title cased string
   */
  static titleCase(text: string): string {
    if (!text) {
      return text;
    }

    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Remove HTML tags from string
   * @param html HTML string
   * @returns Plain text
   */
  static stripHtml(html: string): string {
    if (!html) {
      return html;
    }

    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Escape HTML special characters
   * @param text Input text
   * @returns Escaped string
   */
  static escapeHtml(text: string): string {
    if (!text) {
      return text;
    }

    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, char => escapeMap[char]);
  }

  /**
   * Generate random string
   * @param length Length of random string
   * @returns Random string
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Check if string is empty or whitespace
   * @param text Input text
   * @returns True if empty/whitespace
   */
  static isEmpty(text: string | null | undefined): boolean {
    return !text || text.trim().length === 0;
  }

  /**
   * Convert kebab-case to camelCase
   * @param text Input text in kebab-case
   * @returns camelCase string
   */
  static kebabToCamel(text: string): string {
    return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Convert camelCase to kebab-case
   * @param text Input text in camelCase
   * @returns kebab-case string
   */
  static camelToKebab(text: string): string {
    return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Highlight search term in text
   * @param text Input text
   * @param searchTerm Term to highlight
   * @param highlightClass CSS class for highlight
   * @returns HTML string with highlighted terms
   */
  static highlight(text: string, searchTerm: string, highlightClass: string = 'highlight'): string {
    if (!text || !searchTerm) {
      return text;
    }

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
  }
}
