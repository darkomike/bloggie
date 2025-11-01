/**
 * Browser-based migration tool for generating usernames from emails
 * This is a client-side alternative that can be run from the browser console
 * 
 * WARNING: This requires authenticated user with Firestore write access
 * Only use for development/testing purposes
 * 
 * Usage:
 * 1. Copy this file content
 * 2. Go to your Next.js app in browser
 * 3. Open browser DevTools console
 * 4. Paste the code
 * 5. Run: await migrateUsernamesFromEmails()
 */

import { db } from '@/lib/firebase/config';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

/**
 * Derive a username from an email
 */
function deriveUsernameFromEmail(email) {
  return email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

/**
 * Check if username exists
 */
async function isUsernameExists(username) {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Generate unique username
 */
async function generateUniqueUsername(baseUsername) {
  let username = baseUsername;
  let counter = 1;
  
  while (await isUsernameExists(username)) {
    username = `${baseUsername}-${counter}`;
    counter++;
  }
  
  return username;
}

/**
 * Main migration function
 */
export async function migrateUsernamesFromEmails() {
  console.log('🚀 Starting browser-based username migration...\n');
  
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;
    let usersUpdated = 0;

    console.log(`Found ${totalUsers} users\n`);

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;

      if (userData.username) {
        console.log(`⏭️  Skipping ${uid}: Already has username`);
        continue;
      }

      if (!userData.email) {
        console.log(`⏭️  Skipping ${uid}: No email`);
        continue;
      }

      try {
        const baseUsername = deriveUsernameFromEmail(userData.email);
        const uniqueUsername = await generateUniqueUsername(baseUsername);

        await updateDoc(doc(db, 'users', uid), {
          username: uniqueUsername,
        });

        console.log(`✅ ${uid}: "${userData.email}" → "${uniqueUsername}"`);
        usersUpdated++;
      } catch (error) {
        console.error(`❌ Error updating ${uid}:`, error.message);
      }
    }

    // Get all posts
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    const totalPosts = postsSnapshot.size;
    let postsUpdated = 0;

    console.log(`\nFound ${totalPosts} posts\n`);

    // Process each post
    for (const postDoc of postsSnapshot.docs) {
      const postData = postDoc.data();
      const postId = postDoc.id;

      if (postData.author?.username) {
        continue;
      }

      if (!postData.author?.uid) {
        continue;
      }

      try {
        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('uid', '==', postData.author.uid)
        ));

        if (userDoc.empty) continue;

        const userData = userDoc.docs[0].data();
        
        if (!userData.username) continue;

        await updateDoc(doc(db, 'posts', postId), {
          'author.username': userData.username,
        });

        console.log(`✅ Post ${postId}: Added username "${userData.username}"`);
        postsUpdated++;
      } catch (error) {
        console.error(`❌ Error updating post ${postId}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`   Users updated: ${usersUpdated}`);
    console.log(`   Posts updated: ${postsUpdated}`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}
