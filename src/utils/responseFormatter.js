/**
 * API Response Formatter
 * Standardized API responses following consistent patterns
 */

export class ResponseFormatter {
  /**
   * Success response with data
   */
  static success(data = null, message = 'Success', metadata = {}) {
    return new Response(
      JSON.stringify({
        success: true,
        message,
        data,
        ...metadata,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Created response (201)
   */
  static created(data = null, message = 'Resource created successfully') {
    return new Response(
      JSON.stringify({
        success: true,
        message,
        data,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Bad request error (400)
   */
  static badRequest(message = 'Bad request', errors = {}) {
    return new Response(
      JSON.stringify({
        success: false,
        message,
        errors,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Unauthorized error (401)
   */
  static unauthorized(message = 'Unauthorized') {
    return new Response(
      JSON.stringify({
        success: false,
        message,
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Forbidden error (403)
   */
  static forbidden(message = 'Forbidden') {
    return new Response(
      JSON.stringify({
        success: false,
        message,
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Not found error (404)
   */
  static notFound(message = 'Resource not found') {
    return new Response(
      JSON.stringify({
        success: false,
        message,
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Server error (500)
   */
  static serverError(message = 'Internal server error', error = null) {
    const response = {
      success: false,
      message,
    };

    // Include error details in development
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = {
        message: error.message,
        stack: error.stack,
      };
    }

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Validation error response
   */
  static validationError(errors = {}) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Validation failed',
        errors,
      }),
      {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
