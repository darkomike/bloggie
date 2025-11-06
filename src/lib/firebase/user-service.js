/**
 * User Service
 * Handles user-related operations with Firebase
 * Extends BaseFirebaseService following SOLID principles
 */

import {
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { BaseFirebaseService } from './base-service';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const USERS_COLLECTION = 'users';

class UserService extends BaseFirebaseService {
  constructor() {
    super(USERS_COLLECTION, 'USERS', CACHE_CONFIG.USERS);
  }

  /**
   * Get all users with optional limit
   */
  async getAllUsers(limitCount) {
    const cacheKey = `all_${limitCount || 'unlimited'}`;
    const constraints = [orderBy('createdAt', 'desc')];
    
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.USERS.USERS_LIST
    );
  }

  /**
   * Get user by UID
   */
  async getUserById(uid) {
    return this.getById(uid, CACHE_CONFIG.USERS.USER_BY_ID);
  }

  /**
   * Get user by UID without cache (for session refresh)
   */
  async getUserByIdFresh(uid) {
    if (!this.checkFirestore() || !uid) return null;

    const { getDoc } = await import('firebase/firestore');
    const docRef = this.getDocRef(uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;

    return { id: docSnap.id, ...docSnap.data() };
  }

  /**
   * Create or update user (upsert)
   */
  async upsertUser(user) {
    if (!user.uid) {
      throw new Error('User UID is required');
    }

    const userData = {
      ...user,
      createdAt: this.normalizeTimestamp(user.createdAt),
      updatedAt: Timestamp.now(),
    };

    return this.upsert(user.uid, userData);
  }

  /**
   * Update user
   */
  async updateUser(uid, userData) {
    return this.update(uid, userData);
  }

  /**
   * Delete user
   */
  async deleteUser(uid) {
    return this.delete(uid);
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username, excludeUid = null) {
    if (!this.checkFirestore() || !username) return false;

    try {
      const constraints = [where('username', '==', username.toLowerCase())];
      const users = await this.fetchDocuments(constraints);

      if (users.length === 0) return true;

      // If excludeUid is provided, check if the username belongs to a different user
      if (excludeUid) {
        return users[0].id === excludeUid;
      }

      return false;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  /**
   * Change user username
   */
  async changeUsername(uid, newUsername) {
    if (!this.checkFirestore() || !uid || !newUsername) {
      throw new Error('Invalid parameters for username change');
    }

    // Check if new username is available (excluding current user's UID)
    const isAvailable = await this.isUsernameAvailable(newUsername, uid);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }

    await this.update(uid, {
      username: newUsername.toLowerCase(),
    });

    return { success: true };
  }

  /**
   * Remove user photo URL
   */
  async removeUserPhoto(uid) {
    if (!this.checkFirestore() || !uid) {
      throw new Error('Invalid user ID');
    }

    await this.update(uid, { photoURL: null });
    console.log(`Photo URL set to null for user: ${uid}`);

    return { success: true };
  }
}

// Export singleton instance
export const userService = new UserService();
