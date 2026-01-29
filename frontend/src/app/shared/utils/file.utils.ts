/**
 * File Utility Functions (Pure)
 *
 * Side-effect free file operations
 */

export class FileUtils {
  /**
   * Format file size in bytes to human readable format
   * @param bytes File size in bytes
   * @param decimals Number of decimal places (default: 2)
   * @returns Formatted file size string
   */
  static formatSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    if (isNaN(bytes)) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }

  /**
   * Get file extension from filename
   * @param filename Filename with extension
   * @returns File extension (without dot)
   */
  static getExtension(filename: string): string {
    if (!filename) {
      return '';
    }

    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  }

  /**
   * Get filename without extension
   * @param filename Filename with extension
   * @returns Filename without extension
   */
  static getFilenameWithoutExtension(filename: string): string {
    if (!filename) {
      return '';
    }

    const parts = filename.split('.');
    if (parts.length > 1) {
      parts.pop();
    }
    return parts.join('.');
  }

  /**
   * Check if file is image
   * @param filename Filename or File object
   * @returns True if file is image
   */
  static isImage(filename: string | File): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const ext = typeof filename === 'string'
      ? this.getExtension(filename)
      : this.getExtension(filename.name);

    return imageExtensions.includes(ext);
  }

  /**
   * Check if file is video
   * @param filename Filename or File object
   * @returns True if file is video
   */
  static isVideo(filename: string | File): boolean {
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv'];
    const ext = typeof filename === 'string'
      ? this.getExtension(filename)
      : this.getExtension(filename.name);

    return videoExtensions.includes(ext);
  }

  /**
   * Check if file is audio
   * @param filename Filename or File object
   * @returns True if file is audio
   */
  static isAudio(filename: string | File): boolean {
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
    const ext = typeof filename === 'string'
      ? this.getExtension(filename)
      : this.getExtension(filename.name);

    return audioExtensions.includes(ext);
  }

  /**
   * Check if file is document
   * @param filename Filename or File object
   * @returns True if file is document
   */
  static isDocument(filename: string | File): boolean {
    const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    const ext = typeof filename === 'string'
      ? this.getExtension(filename)
      : this.getExtension(filename.name);

    return docExtensions.includes(ext);
  }

  /**
   * Validate image file
   * @param file File object
   * @param maxSize Maximum file size in bytes (default: 5MB)
   * @param allowedExtensions Allowed extensions (default: jpg, jpeg, png, webp)
   * @returns Validation result with error message
   */
  static validateImage(
    file: File,
    maxSize: number = 5 * 1024 * 1024, // 5MB
    allowedExtensions: string[] = ['jpg', 'jpeg', 'png', 'webp']
  ): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'Dosya seçilmedi' };
    }

    // Check extension
    const ext = this.getExtension(file.name);
    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Geçersiz dosya formatı. İzin verilenler: ${allowedExtensions.join(', ')}`
      };
    }

    // Check size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Dosya boyutu çok büyük. Maksimum: ${this.formatSize(maxSize)}`
      };
    }

    // Check MIME type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Dosya bir resim değil' };
    }

    return { valid: true };
  }

  /**
   * Get file MIME type from extension
   * @param extension File extension
   * @returns MIME type
   */
  static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',

      // Videos
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',

      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',

      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      // Others
      'txt': 'text/plain',
      'json': 'application/json',
      'xml': 'application/xml',
      'zip': 'application/zip'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Convert File to Base64 string
   * @param file File object
   * @returns Promise with base64 string
   */
  static async toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Download file from blob
   * @param blob Blob or File object
   * @param filename Download filename
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Convert data URL to Blob
   * @param dataUrl Data URL string
   * @returns Blob object
   */
  static dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  /**
   * Generate unique filename
   * @param originalName Original filename
   * @returns Unique filename with timestamp
   */
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const ext = this.getExtension(originalName);
    const name = this.getFilenameWithoutExtension(originalName);

    return `${name}-${timestamp}.${ext}`;
  }

  /**
   * Sanitize filename (remove special characters)
   * @param filename Filename to sanitize
   * @returns Sanitized filename
   */
  static sanitizeFilename(filename: string): string {
    if (!filename) {
      return '';
    }

    const ext = this.getExtension(filename);
    const name = this.getFilenameWithoutExtension(filename);

    // Remove special characters, replace spaces with -
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    return ext ? `${sanitized}.${ext}` : sanitized;
  }
}
