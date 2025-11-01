import { db } from './config';
import ContactModel from '../../models/contactModel';

const CONTACTS_COLLECTION = 'contacts';

const contactService = {
  async createContact({ name, email, message }) {
    try {
      const createdAt = new Date().toISOString();
      const contact = new ContactModel({ name, email, message, createdAt });
      const docRef = await db.collection(CONTACTS_COLLECTION).add(contact.toFirestore());
      contact.id = docRef.id;
      return contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      return null;
    }
  },

  async getContactById(id) {
    try {
      const doc = await db.collection(CONTACTS_COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return ContactModel.fromFirestore(doc);
    } catch (error) {
      console.error('Error fetching contact:', error);
      return null;
    }
  },

  async getAllContacts() {
    try {
      const snapshot = await db.collection(CONTACTS_COLLECTION).orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ContactModel.fromFirestore(doc));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  },

  async deleteContact(id) {
    try {
      await db.collection(CONTACTS_COLLECTION).doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  },
};

export default contactService;
