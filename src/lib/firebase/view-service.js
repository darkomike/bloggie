/**
 * View Service
 * Handles view tracking operations with Firebase
 * Extends BaseFirebaseService following SOLID principles
 */

import { where, Timestamp } from 'firebase/firestore';
import { BaseFirebaseService } from './base-service';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const VIEWS_COLLECTION = 'views';

/**
 * Transform function for view documents
 */
const transformView = (data) => ({
  id: data.id,
  ...data,
  createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
});

class ViewService extends BaseFirebaseService {
  constructor() {
    super(VIEWS_COLLECTION, 'VIEWS', CACHE_CONFIG.VIEWS);
  }

  /**
   * Get all views (for homepage stats)
   */
  async getAllViews() {
    return this.getAll([], 'all_views', CACHE_CONFIG.VIEWS.ALL_VIEWS, transformView);
  }

  /**
   * Get all views for a post
   */
  async getViewsByPost(postId) {
    const cacheKey = `post_${postId}`;
    const constraints = [where('postId', '==', postId)];

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.VIEWS.BY_POST,
      transformView
    );
  }

  /**
   * Add a view
   */
  async addView(viewData) {
    if (!this.checkFirestore()) return null;

    const data = {
      ...viewData,
      createdAt: Timestamp.now(),
    };

    const result = await this.create(data);

    // Invalidate cache
    this.invalidateCache();

    return result.id;
  }

  /**
   * Remove a view
   */
  async removeView(id) {
    if (!this.checkFirestore()) return null;

    await this.delete(id);

    // Invalidate cache
    this.invalidateCache();

    return id;
  }

  /**
   * Get view by ID
   */
  async getViewById(id) {
    const view = await this.getById(id, CACHE_CONFIG.VIEWS.BY_ID);
    return view ? transformView(view) : null;
  }
}

// Export singleton instance
export const viewService = new ViewService();
