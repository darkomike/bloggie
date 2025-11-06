/**
 * JWT utility functions for server-side authentication
 */

import jwt from 'jsonwebtoken';
import { authConfig } from './authConfig';

export const jwtUtils = {
  /**
   * Sign a JWT token
   */
  sign(payload, expiresIn = authConfig.JWT_EXPIRATION) {
    return jwt.sign(payload, authConfig.JWT_SECRET, { expiresIn });
  },

  /**
   * Verify a JWT token
   */
  verify(token) {
    try {
      return jwt.verify(token, authConfig.JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  /**
   * Decode a JWT token without verification
   */
  decode(token) {
    return jwt.decode(token);
  },
};
