import { db } from './config';
import NewsletterModel from '../../models/newsletterModel';

const NEWSLETTER_COLLECTION = 'newsletter';

const newsletterService = {
  async subscribe(email) {
    try {
      const subscribedAt = new Date().toISOString();
      const newsletter = new NewsletterModel({ email, subscribedAt });
      const docRef = await db.collection(NEWSLETTER_COLLECTION).add(newsletter.toFirestore());
      newsletter.id = docRef.id;
      return newsletter;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return null;
    }
  },

  async getSubscriberById(id) {
    try {
      const doc = await db.collection(NEWSLETTER_COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return NewsletterModel.fromFirestore(doc);
    } catch (error) {
      console.error('Error fetching subscriber:', error);
      return null;
    }
  },

  async getAllSubscribers() {
    try {
      const snapshot = await db.collection(NEWSLETTER_COLLECTION).orderBy('subscribedAt', 'desc').get();
      return snapshot.docs.map(doc => NewsletterModel.fromFirestore(doc));
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      return [];
    }
  },

  async unsubscribe(id) {
    try {
      await db.collection(NEWSLETTER_COLLECTION).doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  },
};

export default newsletterService;
