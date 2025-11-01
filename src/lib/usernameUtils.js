import { collection, query, where, getDocs, db as firebaseDb } from 'firebase/firestore';
import { db } from './firebase/config';

/**
 * Derive a username from email
 * Extracts the part before @ and converts to lowercase
 * Replaces special characters with hyphens
 * @param {string} email - Email address
 * @returns {string} - Derived username
 */
export function deriveUsernameFromEmail(email) {
  if (!email) return '';
  
  // Extract email prefix (part before @)
  const prefix = email.split('@')[0];
  
  // Convert to lowercase and replace special characters with hyphens
  const username = prefix
    .toLowerCase()
    .replaceAll(/[^a-z0-9._-]/g, '-') // Replace invalid chars with hyphen
    .replaceAll(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replaceAll(/-+/g, '-'); // Replace multiple hyphens with single
  
  return username;
}

/**
 * Check if a username already exists in Firestore
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} - True if username exists, false otherwise
 */
export async function isUsernameExists(username) {
  if (!db || !username) return false;
  
  try {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase())
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking username existence:', error);
    return false;
  }
}

/**
 * Generate a unique username from email
 * If the derived username exists, appends a number
 * @param {string} email - Email address
 * @returns {Promise<string>} - Unique username
 */
export async function generateUniqueUsername(email) {
  let username = deriveUsernameFromEmail(email);
  
  if (!username) {
    username = 'user';
  }
  
  // Check if username is unique
  let exists = await isUsernameExists(username);
  let counter = 1;
  
  // Keep trying with incremented number until we find a unique one
  while (exists && counter < 1000) {
    const newUsername = `${username}-${counter}`;
    exists = await isUsernameExists(newUsername);
    if (!exists) {
      username = newUsername;
      break;
    }
    counter++;
  }
  
  return username;
}

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
export function validateUsername(username) {
  if (!username || username.trim() === '') {
    return { valid: false, error: 'Username cannot be empty' };
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 30) {
    return { valid: false, error: 'Username must be at most 30 characters' };
  }
  
  // Check valid characters: lowercase letters, numbers, hyphens, underscores, dots
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain lowercase letters, numbers, hyphens, underscores, and dots' };
  }
  
  // Check doesn't start or end with hyphen
  if (username.startsWith('-') || username.endsWith('-')) {
    return { valid: false, error: 'Username cannot start or end with a hyphen' };
  }
  
  return { valid: true };
}
