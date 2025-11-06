/**
 * Validation Utilities
 * Following Single Responsibility Principle
 */

import { VALIDATION_RULES } from '@/constants';

export class ValidationUtil {
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate username format
   */
  static isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    const { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH } = VALIDATION_RULES;
    const usernameRegex = new RegExp(`^[a-zA-Z0-9_]{${USERNAME_MIN_LENGTH},${USERNAME_MAX_LENGTH}}$`);
    return usernameRegex.test(username);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password) {
    if (!password || typeof password !== 'string') return false;
    return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate slug format
   */
  static isValidSlug(slug) {
    if (!slug || typeof slug !== 'string') return false;
    // Slug: lowercase, hyphens, alphanumeric
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  /**
   * Validate file size
   */
  static isValidFileSize(fileSize, maxSize = VALIDATION_RULES.MAX_FILE_SIZE) {
    return fileSize <= maxSize;
  }

  /**
   * Validate image type
   */
  static isValidImageType(fileType) {
    return VALIDATION_RULES.ALLOWED_IMAGE_TYPES.includes(fileType);
  }

  /**
   * Sanitize string (remove dangerous characters)
   */
  static sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate required fields
   */
  static validateRequired(data, requiredFields) {
    const errors = {};
    
    requiredFields.forEach(field => {
      const value = data[field];
      const isEmptyString = typeof value === 'string' && !value.trim();
      
      if (!value || isEmptyString) {
        errors[field] = `${field} is required`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
