import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { cacheManager } from '@/lib/cache/cacheManager';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const USERS_COLLECTION = 'users';

const checkFirestore = () => {
  if (!db) {
    console.warn('Firestore is not initialized. Returning empty data.');
    return false;
  }
  return true;
};

const fetchUsers = async (constraints) => {
  if (!checkFirestore()) return [];
  const q = query(collection(db, USERS_COLLECTION), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const userService = {
  // Get all users
  async getAllUsers(limitCount) {
    // Check cache first
    const cacheKey = `all_${limitCount || 'unlimited'}`;
    const cached = cacheManager.get('USERS', cacheKey);
    if (cached) {
      console.log('📦 [UserService Cache] ✅ Using cached users list (HIT)');
      console.log(`   └─ Saved ${cached.length} users from cache`);
      return cached;
    }

    console.log('📦 [UserService Cache] ❌ Cache miss, fetching users from Firebase...');
    const constraints = [orderBy('createdAt', 'desc')];
    if (limitCount) constraints.push(limit(limitCount));
    const users = await fetchUsers(constraints);
    
    console.log(`📦 [UserService Cache] ✅ Fetched ${users.length} users, now caching...`);
    // Cache the result
    cacheManager.set('USERS', cacheKey, users, CACHE_CONFIG.USERS.USERS_LIST);
    return users;
  },

  // Get user by UID
  async getUserById(uid) {
    // Check cache first
    const cached = cacheManager.get('USERS', uid);
    if (cached) {
      console.log(`📦 [UserService Cache] ✅ Using cached user: ${uid} (HIT)`);
      return cached;
    }

    console.log(`📦 [UserService Cache] ❌ Cache miss for user: ${uid}, fetching from Firebase...`);
    if (!checkFirestore()) return null;
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    
    const user = {
      id: docSnap.id,
      ...docSnap.data(),
    };
    
    console.log(`📦 [UserService Cache] ✅ Fetched user "${user.displayName}", now caching...`);
    // Cache the result
    cacheManager.set('USERS', uid, user, CACHE_CONFIG.USERS.USER_BY_ID);
    return user;
  },

  // Create or update user
  async upsertUser(user) {
    const userData = { ...user };
    userData.createdAt = userData.createdAt instanceof Timestamp ? userData.createdAt : (userData.createdAt ? Timestamp.fromDate(new Date(userData.createdAt)) : Timestamp.now());
    userData.updatedAt = Timestamp.now();
    const docRef = doc(db, USERS_COLLECTION, userData.uid);
    await setDoc(docRef, userData, { merge: true });
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  },

  // Update user
  async updateUser(uid, user) {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const updateData = { ...user };
    updateData.updatedAt = Timestamp.now();
    await updateDoc(docRef, updateData);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  },

  // Delete user
  async deleteUser(uid) {
    const docRef = doc(db, USERS_COLLECTION, uid);
    try {
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  // Check if username is available
  async isUsernameAvailable(username, excludeUid = null) {
    if (!checkFirestore() || !username) return false;
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('username', '==', username.toLowerCase())
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return true;
      
      // If excludeUid is provided, check if the username belongs to a different user
      if (excludeUid) {
        const existingUser = snapshot.docs[0];
        return existingUser.id === excludeUid;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  },

  // Change user username
  async changeUsername(uid, newUsername) {
    if (!checkFirestore() || !uid || !newUsername) return null;
    
    try {
      // Check if new username is available (excluding current user's UID)
      const isAvailable = await this.isUsernameAvailable(newUsername, uid);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }
      
      const docRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(docRef, {
        username: newUsername.toLowerCase(),
        updatedAt: Timestamp.now(),
      });
      
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } catch (error) {
      console.error('Error changing username:', error);
      throw error;
    }
  },
};
