/**
 * Base Firebase Service
 * Implements common CRUD operations and caching patterns
 * Following SOLID principles:
 * - Single Responsibility: Handles Firebase operations
 * - Open/Closed: Extended by specific services
 * - Liskov Substitution: Can be replaced by child services
 * - Interface Segregation: Minimal required interface
 * - Dependency Inversion: Depends on abstractions (cache, db)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { cacheManager } from '@/lib/cache/cacheManager';

export class BaseFirebaseService {
  constructor(collectionName, cacheNamespace, cacheConfig) {
    this.collectionName = collectionName;
    this.cacheNamespace = cacheNamespace;
    this.cacheConfig = cacheConfig;
  }

  /**
   * Check if Firestore is initialized
   */
  checkFirestore() {
    if (!db) {
      console.warn('Firestore is not initialized. Returning empty data.');
      return false;
    }
    return true;
  }

  /**
   * Get collection reference
   */
  getCollectionRef() {
    return collection(db, this.collectionName);
  }

  /**
   * Get document reference
   */
  getDocRef(id) {
    return doc(db, this.collectionName, id);
  }

  /**
   * Fetch documents with query constraints
   */
  async fetchDocuments(constraints = [], transform = null) {
    if (!this.checkFirestore()) return [];
    
    const q = query(this.getCollectionRef(), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = { id: doc.id, ...doc.data() };
      return transform ? transform(data, doc) : data;
    });
  }

  /**
   * Get document by ID with caching
   */
  async getById(id, ttl = null) {
    if (!id) return null;

    // Check cache
    const cached = cacheManager.get(this.cacheNamespace, id);
    if (cached) {
      this.logCacheHit(id);
      return cached;
    }

    this.logCacheMiss(id);

    // Use request coalescing
    const coalescingKey = `${this.cacheNamespace}:${id}`;
    return cacheManager.getWithCoalescing(coalescingKey, async () => {
      if (!this.checkFirestore()) return null;
      
      const docRef = this.getDocRef(id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;

      const data = { id: docSnap.id, ...docSnap.data() };
      
      // Cache with provided TTL or default
      const cacheTTL = ttl || this.cacheConfig?.BY_ID || 0;
      cacheManager.set(this.cacheNamespace, id, data, cacheTTL);
      
      return data;
    });
  }

  /**
   * Get multiple documents with caching
   */
  async getAll(constraints = [], cacheKey = 'all', ttl = null, transform = null) {
    // Check cache
    const cached = cacheManager.get(this.cacheNamespace, cacheKey);
    if (cached) {
      this.logCacheHit(cacheKey, cached.length);
      return cached;
    }

    this.logCacheMiss(cacheKey);

    // Use request coalescing
    const coalescingKey = `${this.cacheNamespace}:${cacheKey}`;
    return cacheManager.getWithCoalescing(coalescingKey, async () => {
      const documents = await this.fetchDocuments(constraints, transform);
      
      // Cache with provided TTL or default
      const cacheTTL = ttl || this.cacheConfig?.LIST || 0;
      cacheManager.set(this.cacheNamespace, cacheKey, documents, cacheTTL);
      
      return documents;
    });
  }

  /**
   * Create a new document
   */
  async create(data, transform = null) {
    if (!this.checkFirestore()) return null;

    const docData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(this.getCollectionRef(), docData);
    const addedDoc = await getDoc(docRef);

    // Invalidate cache
    this.invalidateCache();

    const result = { id: addedDoc.id, ...addedDoc.data() };
    return transform ? transform(result) : result;
  }

  /**
   * Update a document
   */
  async update(id, data) {
    if (!this.checkFirestore() || !id) return null;

    const docRef = this.getDocRef(id);
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);

    // Invalidate specific cache and namespace
    cacheManager.delete(this.cacheNamespace, id);
    
    return { success: true };
  }

  /**
   * Upsert a document (create or update)
   */
  async upsert(id, data) {
    if (!this.checkFirestore() || !id) return null;

    const docRef = this.getDocRef(id);
    const docData = {
      ...data,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(docRef, docData, { merge: true });

    // Invalidate cache
    cacheManager.delete(this.cacheNamespace, id);

    return { success: true };
  }

  /**
   * Delete a document
   */
  async delete(id) {
    if (!this.checkFirestore() || !id) return false;

    try {
      const docRef = this.getDocRef(id);
      await deleteDoc(docRef);

      // Invalidate cache
      this.invalidateCache(id);

      return true;
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      return false;
    }
  }

  /**
   * Invalidate cache for this service
   */
  invalidateCache(specificKey = null) {
    if (specificKey) {
      cacheManager.delete(this.cacheNamespace, specificKey);
    }
    // Clear namespace to invalidate all lists
    cacheManager.clearNamespace(this.cacheNamespace);
  }

  /**
   * Normalize timestamps
   */
  normalizeTimestamp(timestamp) {
    if (timestamp instanceof Timestamp) {
      return timestamp;
    }
    if (timestamp instanceof Date) {
      return Timestamp.fromDate(timestamp);
    }
    if (typeof timestamp === 'string') {
      return Timestamp.fromDate(new Date(timestamp));
    }
    return Timestamp.now();
  }

  /**
   * Logging helpers
   */
  logCacheHit(key, count = null) {
    const message = count !== null 
      ? `📦 [${this.cacheNamespace} Cache] ✅ Using cached ${key} (${count} items)`
      : `📦 [${this.cacheNamespace} Cache] ✅ Using cached ${key}`;
    console.log(message);
  }

  logCacheMiss(key) {
    console.log(`📦 [${this.cacheNamespace} Cache] ❌ Cache miss: ${key}`);
  }
}
