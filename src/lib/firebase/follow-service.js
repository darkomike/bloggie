import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Follow } from '@/models/followModel';

const FOLLOWS_COLLECTION = 'follows';

/**
 * Check if Firestore is configured
 */
const checkFirestore = () => {
  if (!db) {
    console.warn('Firestore is not configured');
    return false;
  }
  return true;
};

/**
 * Get user ID by username
 * @param {string} username - Username to search for
 * @returns {Promise<string|null>} User ID or null if not found
 */
export async function getUserIdByUsername(username) {
  if (!checkFirestore() || !username) return null;

  try {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase())
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].id;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

/**
 * Get user data by username
 * @param {string} username - Username to search for
 * @returns {Promise<object|null>} User data or null if not found
 */
export async function getUserByUsername(username) {
  if (!checkFirestore() || !username) return null;

  try {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase())
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return {
      uid: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

/**
 * Follow a user
 * @param {string} followerId - ID of user who is following
 * @param {string} followingId - ID of user to follow
 * @param {object} followerData - Follower user data (name, photoURL)
 * @param {object} followingData - Following user data (name, photoURL)
 * @returns {Promise<Follow>} Created follow document
 */
export async function followUser(followerId, followingId, followerData = {}, followingData = {}) {
  if (!checkFirestore() || !followerId || !followingId) return null;

  // Don't allow users to follow themselves
  if (followerId === followingId) {
    console.warn('Users cannot follow themselves');
    return null;
  }

  try {
    const followRef = await addDoc(collection(db, FOLLOWS_COLLECTION), {
      followerId,
      followingId,
      createdAt: serverTimestamp(),
      followerName: followerData.displayName || '',
      followerPhotoURL: followerData.photoURL || '',
      followingName: followingData.displayName || '',
      followingPhotoURL: followingData.photoURL || '',
    });

    return Follow.fromFirestore(
      {
        followerId,
        followingId,
        createdAt: new Date(),
        followerName: followerData.displayName || '',
        followerPhotoURL: followerData.photoURL || '',
        followingName: followingData.displayName || '',
        followingPhotoURL: followingData.photoURL || '',
      },
      followRef.id
    );
  } catch (error) {
    console.error('Error following user:', error);
    return null;
  }
}

/**
 * Unfollow a user
 * @param {string} followerId - ID of user who is following
 * @param {string} followingId - ID of user to unfollow
 * @returns {Promise<boolean>} Success status
 */
export async function unfollowUser(followerId, followingId) {
  if (!checkFirestore() || !followerId || !followingId) return false;

  try {
    const q = query(
      collection(db, FOLLOWS_COLLECTION),
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn('Follow relationship not found');
      return false;
    }

    await deleteDoc(doc(db, FOLLOWS_COLLECTION, snapshot.docs[0].id));
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
}

/**
 * Check if a user is following another user
 * @param {string} followerId - ID of user who might be following
 * @param {string} followingId - ID of user being checked
 * @returns {Promise<boolean>} Whether user is following
 */
export async function isFollowing(followerId, followingId) {
  if (!checkFirestore() || !followerId || !followingId) return false;

  try {
    const q = query(
      collection(db, FOLLOWS_COLLECTION),
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

/**
 * Get all users that a user is following
 * @param {string} userId - ID of user
 * @returns {Promise<Array<Follow>>} Array of follow relationships
 */
export async function getFollowing(userId) {
  if (!checkFirestore() || !userId) return [];

  try {
    const q = query(
      collection(db, FOLLOWS_COLLECTION),
      where('followerId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => Follow.fromFirestore(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
}

/**
 * Get all followers of a user
 * @param {string} userId - ID of user
 * @returns {Promise<Array<Follow>>} Array of follow relationships
 */
export async function getFollowers(userId) {
  if (!checkFirestore() || !userId) return [];

  try {
    const q = query(
      collection(db, FOLLOWS_COLLECTION),
      where('followingId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => Follow.fromFirestore(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
}

/**
 * Get follower count for a user
 * @param {string} userId - ID of user
 * @returns {Promise<number>} Follower count
 */
export async function getFollowerCount(userId) {
  if (!checkFirestore() || !userId) return 0;

  try {
    const q = query(
      collection(db, FOLLOWS_COLLECTION),
      where('followingId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching follower count:', error);
    return 0;
  }
}

/**
 * Get following count for a user
 * @param {string} userId - ID of user
 * @returns {Promise<number>} Following count
 */
export async function getFollowingCount(userId) {
  if (!checkFirestore() || !userId) return 0;

  try {
    const q = query(
      collection(db, FOLLOWS_COLLECTION),
      where('followerId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching following count:', error);
    return 0;
  }
}

/**
 * Get all follows (admin use)
 * @returns {Promise<Array<Follow>>} Array of all follows
 */
export async function getAllFollows() {
  if (!checkFirestore()) return [];

  try {
    const snapshot = await getDocs(collection(db, FOLLOWS_COLLECTION));
    return snapshot.docs.map((doc) => Follow.fromFirestore(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching all follows:', error);
    return [];
  }
}

/**
 * Delete all follows (admin use - careful!)
 * @returns {Promise<boolean>} Success status
 */
export async function deleteAllFollows() {
  if (!checkFirestore()) return false;

  try {
    const snapshot = await getDocs(collection(db, FOLLOWS_COLLECTION));
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
    return true;
  } catch (error) {
    console.error('Error deleting all follows:', error);
    return false;
  }
}

/**
 * Export all functions as a service object
 */
export const followService = {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowing,
  getFollowers,
  getFollowerCount,
  getFollowingCount,
  getAllFollows,
  deleteAllFollows,
  getUserIdByUsername,
  getUserByUsername,
};
