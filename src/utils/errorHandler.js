/**
 * Error Handler Utility
 * Centralized error handling following DRY and Single Responsibility principles
 */

export class ErrorHandler {
  /**
   * Handle Firebase errors with user-friendly messages
   */
  static handleFirebaseError(error) {
    const errorMap = {
      'auth/user-not-found': 'User not found. Please check your credentials.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'The requested resource was not found.',
      'already-exists': 'This resource already exists.',
      'unavailable': 'Service temporarily unavailable. Please try again.',
    };

    const errorCode = error?.code || 'unknown';
    const errorMessage = errorMap[errorCode] || error?.message || 'An unexpected error occurred.';

    return {
      code: errorCode,
      message: errorMessage,
      originalError: error,
    };
  }

  /**
   * Handle API errors
   */
  static handleApiError(error, defaultMessage = 'An error occurred') {
    if (error?.response) {
      // Server responded with error status
      return {
        status: error.response.status,
        message: error.response.data?.message || defaultMessage,
        data: error.response.data,
      };
    }

    if (error?.request) {
      // Request made but no response
      return {
        status: 0,
        message: 'No response from server. Please check your connection.',
        data: null,
      };
    }

    // Something else happened
    return {
      status: -1,
      message: error?.message || defaultMessage,
      data: null,
    };
  }

  /**
   * Log error with context
   */
  static logError(context, error, additionalInfo = {}) {
    console.error(`[${context}] Error:`, {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      ...additionalInfo,
    });
  }

  /**
   * Create standardized error response
   */
  static createErrorResponse(message, code = 'ERROR', status = 500) {
    return {
      success: false,
      error: {
        code,
        message,
        status,
      },
    };
  }

  /**
   * Create standardized success response
   */
  static createSuccessResponse(data = null, message = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }
}
