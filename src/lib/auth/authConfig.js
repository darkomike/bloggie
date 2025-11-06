/**
 * Server-side authentication configuration
 * Handles JWT tokens, password hashing, and session management
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '7d';

export const authConfig = {
  JWT_SECRET,
  JWT_EXPIRATION,
  COOKIE_NAME: 'auth-token',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};
