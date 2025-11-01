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
    const constraints = [orderBy('createdAt', 'desc')];
    if (limitCount) constraints.push(limit(limitCount));
    return await fetchUsers(constraints);
  },

  // Get user by UID
  async getUserById(uid) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  },

  // Create or update user
  async upsertUser(user) {
    const userData = user instanceof UserModel ? user.toFirestore() : user;
    userData.createdAt = userData.createdAt ? Timestamp.fromDate(userData.createdAt) : Timestamp.now();
    userData.updatedAt = Timestamp.now();
    const docRef = doc(db, USERS_COLLECTION, userData.uid);
    await setDoc(docRef, userData, { merge: true });
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return UserModel.fromFirestore({ id: docSnap.id, ...docSnap.data() });
  },

  // Update user
  async updateUser(uid, user) {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const updateData = user instanceof UserModel ? user.toFirestore() : user;
    updateData.updatedAt = Timestamp.now();
    await updateDoc(docRef, updateData);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return UserModel.fromFirestore({ id: docSnap.id, ...docSnap.data() });
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
      return UserModel.fromFirestore({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
      console.error('Error changing username:', error);
      throw error;
    }
  },
};
