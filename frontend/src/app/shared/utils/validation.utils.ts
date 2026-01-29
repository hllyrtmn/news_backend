/**
 * Validation Utility Functions (Pure)
 *
 * Side-effect free validation operations
 */

export class ValidationUtils {
  /**
   * Validate email address
   * @param email Email string
   * @returns True if valid email
   */
  static isEmail(email: string): boolean {
    if (!email) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   * @param url URL string
   * @returns True if valid URL
   */
  static isUrl(url: string): boolean {
    if (!url) {
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate phone number (Turkish format)
   * @param phone Phone number string
   * @returns True if valid phone number
   */
  static isPhone(phone: string): boolean {
    if (!phone) {
      return false;
    }

    // Turkish phone: +90 5XX XXX XX XX or 05XX XXX XX XX
    const phoneRegex = /^(\+90|0)?5\d{9}$/;
    const cleaned = phone.replace(/[\s-]/g, '');
    return phoneRegex.test(cleaned);
  }

  /**
   * Validate password strength
   * @param password Password string
   * @param minLength Minimum length (default: 8)
   * @returns Strength score (0-4) and feedback
   */
  static validatePassword(
    password: string,
    minLength: number = 8
  ): { score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    if (!password) {
      return { score: 0, feedback: ['Şifre gereklidir'] };
    }

    // Length check
    if (password.length < minLength) {
      feedback.push(`En az ${minLength} karakter olmalıdır`);
    } else {
      score++;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      feedback.push('En az bir büyük harf içermelidir');
    } else {
      score++;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      feedback.push('En az bir küçük harf içermelidir');
    } else {
      score++;
    }

    // Number check
    if (!/\d/.test(password)) {
      feedback.push('En az bir rakam içermelidir');
    } else {
      score++;
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('En az bir özel karakter içermelidir');
    }

    return { score, feedback };
  }

  /**
   * Validate credit card number (Luhn algorithm)
   * @param cardNumber Card number string
   * @returns True if valid card number
   */
  static isCreditCard(cardNumber: string): boolean {
    if (!cardNumber) {
      return false;
    }

    const cleaned = cardNumber.replace(/\s/g, '');

    if (!/^\d+$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate Turkish ID number (TC Kimlik No)
   * @param idNumber ID number string
   * @returns True if valid TC ID number
   */
  static isTurkishIdNumber(idNumber: string): boolean {
    if (!idNumber || idNumber.length !== 11) {
      return false;
    }

    if (!/^\d{11}$/.test(idNumber)) {
      return false;
    }

    if (idNumber[0] === '0') {
      return false;
    }

    const digits = idNumber.split('').map(Number);
    const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
    const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
    const digit10 = (sum1 - sum2) % 10;

    if (digit10 !== digits[9]) {
      return false;
    }

    const sum3 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    const digit11 = sum3 % 10;

    return digit11 === digits[10];
  }

  /**
   * Validate slug format
   * @param slug Slug string
   * @returns True if valid slug
   */
  static isSlug(slug: string): boolean {
    if (!slug) {
      return false;
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  /**
   * Validate hex color code
   * @param color Color string
   * @returns True if valid hex color
   */
  static isHexColor(color: string): boolean {
    if (!color) {
      return false;
    }

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  /**
   * Validate alphanumeric string
   * @param value String to validate
   * @returns True if alphanumeric
   */
  static isAlphanumeric(value: string): boolean {
    if (!value) {
      return false;
    }

    return /^[a-zA-Z0-9]+$/.test(value);
  }

  /**
   * Validate numeric string
   * @param value String to validate
   * @returns True if numeric
   */
  static isNumeric(value: string): boolean {
    if (!value) {
      return false;
    }

    return /^\d+$/.test(value);
  }

  /**
   * Validate IP address (IPv4)
   * @param ip IP address string
   * @returns True if valid IPv4
   */
  static isIPv4(ip: string): boolean {
    if (!ip) {
      return false;
    }

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return false;
    }

    return ip.split('.').every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  /**
   * Validate date string (YYYY-MM-DD)
   * @param dateString Date string
   * @returns True if valid date format
   */
  static isDate(dateString: string): boolean {
    if (!dateString) {
      return false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Validate file extension
   * @param filename Filename string
   * @param allowedExtensions Array of allowed extensions
   * @returns True if extension is allowed
   */
  static hasAllowedExtension(filename: string, allowedExtensions: string[]): boolean {
    if (!filename || !allowedExtensions || allowedExtensions.length === 0) {
      return false;
    }

    const extension = filename.split('.').pop()?.toLowerCase();
    return allowedExtensions.some(ext => ext.toLowerCase() === extension);
  }

  /**
   * Validate string length
   * @param value String to validate
   * @param min Minimum length
   * @param max Maximum length
   * @returns True if length is within range
   */
  static isLengthValid(value: string, min: number, max: number): boolean {
    if (!value) {
      return min === 0;
    }

    return value.length >= min && value.length <= max;
  }
}
