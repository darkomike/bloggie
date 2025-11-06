/**
 * Password hashing utilities using bcrypt
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const passwordUtils = {
  /**
   * Hash a password
   */
  async hash(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  /**
   * Compare a password with its hash
   */
  async compare(password, hash) {
    return bcrypt.compare(password, hash);
  },
};
