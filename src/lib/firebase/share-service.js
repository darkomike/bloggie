/**
 * Share Service
 * Handles share tracking operations with Firebase
 * Extends BaseFirebaseService following SOLID principles
 */

import { where, Timestamp } from 'firebase/firestore';
import { BaseFirebaseService } from './base-service';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const SHARES_COLLECTION = 'shares';

/**
 * Transform function for share documents
 */
const transformShare = (data) => ({
  id: data.id,
  ...data,
  createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
});

class ShareService extends BaseFirebaseService {
  constructor() {
    super(SHARES_COLLECTION, 'SHARES', CACHE_CONFIG.SHARES);
  }

  /**
   * Get all shares for a post
   */
  async getSharesByPost(postId) {
    const cacheKey = `post_${postId}`;
    const constraints = [where('postId', '==', postId)];

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.SHARES.BY_POST,
      transformShare
    );
  }

  /**
   * Add a share
   */
  async addShare(shareData) {
    if (!this.checkFirestore()) return null;

    const data = {
      ...shareData,
      createdAt: Timestamp.now(),
    };

    const result = await this.create(data);

    // Invalidate cache
    this.invalidateCache();

    return result.id;
  }

  /**
   * Remove a share
   */
  async removeShare(id) {
    if (!this.checkFirestore()) return null;

    await this.delete(id);

    // Invalidate cache
    this.invalidateCache();

    return id;
  }

  /**
   * Get share by ID
   */
  async getShareById(id) {
    const share = await this.getById(id, CACHE_CONFIG.SHARES.BY_ID);
    return share ? transformShare(share) : null;
  }
}

// Export singleton instance
export const shareService = new ShareService();
