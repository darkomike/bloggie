import { db } from './config';
import ContactModel from '../../models/contactModel';
import { cacheManager } from '@/lib/cache/cacheManager';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const CONTACTS_COLLECTION = 'contacts';

const contactService = {
  async createContact({ name, email, message }) {
    try {
      const createdAt = new Date().toISOString();
      const contact = new ContactModel({ name, email, message, createdAt });
      const docRef = await db.collection(CONTACTS_COLLECTION).add(contact.toFirestore());
      contact.id = docRef.id;
      
      // Invalidate cache
      cacheManager.clearNamespace('CONTACTS');
      
      return contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      return null;
    }
  },

  async getContactById(id) {
    try {
      const cached = cacheManager.get('CONTACTS', `id_${id}`);
      if (cached) {
        console.log('📦 [Contacts Cache] Using cached contact:', id);
        return cached;
      }
      
      console.log('📦 [Contacts Cache] Cache miss for contact:', id);
      const coalescingKey = `CONTACTS:id_${id}`;
      return cacheManager.getWithCoalescing(coalescingKey, async () => {
        const doc = await db.collection(CONTACTS_COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        
        const contact = ContactModel.fromFirestore(doc);
        cacheManager.set('CONTACTS', `id_${id}`, contact, CACHE_CONFIG.CONTACTS.BY_ID);
        
        return contact;
      });
    } catch (error) {
      console.error('Error fetching contact:', error);
      return null;
    }
  },

  async getAllContacts() {
    try {
      const cached = cacheManager.get('CONTACTS', 'all_contacts');
      if (cached) {
        console.log('📦 [Contacts Cache] Using cached all contacts');
        return cached;
      }
      
      console.log('📦 [Contacts Cache] Cache miss for all contacts');
      const coalescingKey = 'CONTACTS:all_contacts';
      return cacheManager.getWithCoalescing(coalescingKey, async () => {
        const snapshot = await db.collection(CONTACTS_COLLECTION).orderBy('createdAt', 'desc').get();
        const contacts = snapshot.docs.map(doc => ContactModel.fromFirestore(doc));
        
        cacheManager.set('CONTACTS', 'all_contacts', contacts, CACHE_CONFIG.CONTACTS.ALL);
        
        return contacts;
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  },

  async deleteContact(id) {
    try {
      await db.collection(CONTACTS_COLLECTION).doc(id).delete();
      
      // Invalidate cache
      cacheManager.clearNamespace('CONTACTS');
      
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  },
};

export default contactService;
