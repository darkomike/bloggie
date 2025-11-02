import { db } from './config';
import NewsletterModel from '../../models/newsletterModel';
import { cacheManager } from '@/lib/cache/cacheManager';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const NEWSLETTER_COLLECTION = 'newsletter';

const newsletterService = {
  async subscribe(email) {
    try {
      const subscribedAt = new Date().toISOString();
      const newsletter = new NewsletterModel({ email, subscribedAt });
      const docRef = await db.collection(NEWSLETTER_COLLECTION).add(newsletter.toFirestore());
      newsletter.id = docRef.id;
      
      // Invalidate cache
      cacheManager.clearNamespace('NEWSLETTER');
      
      return newsletter;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return null;
    }
  },

  async getSubscriberById(id) {
    try {
      const cached = cacheManager.get('NEWSLETTER', `id_${id}`);
      if (cached) {
        console.log('📦 [Newsletter Cache] Using cached subscriber:', id);
        return cached;
      }
      
      console.log('📦 [Newsletter Cache] Cache miss for subscriber:', id);
      const coalescingKey = `NEWSLETTER:id_${id}`;
      return cacheManager.getWithCoalescing(coalescingKey, async () => {
        const doc = await db.collection(NEWSLETTER_COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        
        const subscriber = NewsletterModel.fromFirestore(doc);
        cacheManager.set('NEWSLETTER', `id_${id}`, subscriber, CACHE_CONFIG.NEWSLETTER.BY_ID);
        
        return subscriber;
      });
    } catch (error) {
      console.error('Error fetching subscriber:', error);
      return null;
    }
  },

  async getAllSubscribers() {
    try {
      const cached = cacheManager.get('NEWSLETTER', 'all_subscribers');
      if (cached) {
        console.log('📦 [Newsletter Cache] Using cached all subscribers');
        return cached;
      }
      
      console.log('📦 [Newsletter Cache] Cache miss for all subscribers');
      const coalescingKey = 'NEWSLETTER:all_subscribers';
      return cacheManager.getWithCoalescing(coalescingKey, async () => {
        const snapshot = await db.collection(NEWSLETTER_COLLECTION).orderBy('subscribedAt', 'desc').get();
        const subscribers = snapshot.docs.map(doc => NewsletterModel.fromFirestore(doc));
        
        cacheManager.set('NEWSLETTER', 'all_subscribers', subscribers, CACHE_CONFIG.NEWSLETTER.ALL);
        
        return subscribers;
      });
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      return [];
    }
  },

  async unsubscribe(id) {
    try {
      await db.collection(NEWSLETTER_COLLECTION).doc(id).delete();
      
      // Invalidate cache
      cacheManager.clearNamespace('NEWSLETTER');
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  },
};

export default newsletterService;
