/**
 * Migration script to generate and assign usernames to all users from their emails
 * and update all posts to include author username
 * 
 * Usage: node scripts/migrateUsernamesFromEmails.js
 * 
 * This script will:
 * 1. For each user without a username, derive one from their email
 * 2. Ensure username uniqueness by appending counters if needed
 * 3. Update user documents in Firestore with their new usernames
 * 4. Update all posts to include author username from their author.uid
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('❌ Error loading Firebase service account. Make sure firebase-service-account.json exists in project root.');
  console.error('Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

/**
 * Derive a username from an email
 * @param {string} email - The email address
 * @returns {string} - The derived username
 */
function deriveUsernameFromEmail(email) {
  return email
    .split('@')[0] // Get part before @
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-') // Replace invalid chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, 30); // Max 30 chars
}

/**
 * Check if a username exists in Firestore
 * @param {string} username - The username to check
 * @returns {Promise<boolean>} - True if username exists
 */
async function isUsernameExists(username) {
  const querySnapshot = await db
    .collection('users')
    .where('username', '==', username)
    .limit(1)
    .get();
  return !querySnapshot.empty;
}

/**
 * Generate a unique username
 * @param {string} baseUsername - The base username
 * @returns {Promise<string>} - A unique username
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
 * Migrate usernames for all users
 */
async function migrateUsernames() {
  console.log('📋 Starting username migration...\n');

  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    let usersUpdated = 0;
    let usersSkipped = 0;

    console.log(`Found ${totalUsers} users to process\n`);

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;

      // Skip if user already has a username
      if (userData.username) {
        console.log(`⏭️  Skipping user ${uid}: Already has username "${userData.username}"`);
        usersSkipped++;
        continue;
      }

      // Skip if user has no email
      if (!userData.email) {
        console.log(`⏭️  Skipping user ${uid}: No email found`);
        usersSkipped++;
        continue;
      }

      try {
        // Derive username from email
        const baseUsername = deriveUsernameFromEmail(userData.email);
        
        // Generate unique username
        const uniqueUsername = await generateUniqueUsername(baseUsername);

        // Update user document
        await db.collection('users').doc(uid).update({
          username: uniqueUsername,
          usernameGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Updated user ${uid}: "${userData.email}" → "${uniqueUsername}"`);
        usersUpdated++;
      } catch (error) {
        console.error(`❌ Error updating user ${uid}:`, error.message);
      }
    }

    console.log(`\n📊 Users migration summary:`);
    console.log(`   Total processed: ${totalUsers}`);
    console.log(`   Updated: ${usersUpdated}`);
    console.log(`   Skipped: ${usersSkipped}\n`);

    return usersUpdated;
  } catch (error) {
    console.error('❌ Error during user migration:', error.message);
    throw error;
  }
}

/**
 * Migrate post author usernames
 */
async function migratePostAuthorUsernames() {
  console.log('📝 Starting post author username migration...\n');

  try {
    // Get all posts
    const postsSnapshot = await db.collection('posts').get();
    const totalPosts = postsSnapshot.size;
    let postsUpdated = 0;
    let postsSkipped = 0;

    console.log(`Found ${totalPosts} posts to process\n`);

    // Process each post
    for (const postDoc of postsSnapshot.docs) {
      const postData = postDoc.data();
      const postId = postDoc.id;

      // Skip if author already has username
      if (postData.author?.username) {
        console.log(`⏭️  Skipping post ${postId}: Author already has username`);
        postsSkipped++;
        continue;
      }

      // Skip if no author UID
      if (!postData.author?.uid) {
        console.log(`⏭️  Skipping post ${postId}: No author UID found`);
        postsSkipped++;
        continue;
      }

      try {
        // Get user data to find username
        const userDoc = await db.collection('users').doc(postData.author.uid).get();
        
        if (!userDoc.exists()) {
          console.log(`⏭️  Skipping post ${postId}: Author user not found`);
          postsSkipped++;
          continue;
        }

        const userData = userDoc.data();
        
        if (!userData.username) {
          console.log(`⏭️  Skipping post ${postId}: Author has no username`);
          postsSkipped++;
          continue;
        }

        // Update post with author username
        await db.collection('posts').doc(postId).update({
          'author.username': userData.username,
        });

        console.log(`✅ Updated post ${postId}: Added author username "${userData.username}"`);
        postsUpdated++;
      } catch (error) {
        console.error(`❌ Error updating post ${postId}:`, error.message);
      }
    }

    console.log(`\n📊 Posts migration summary:`);
    console.log(`   Total processed: ${totalPosts}`);
    console.log(`   Updated: ${postsUpdated}`);
    console.log(`   Skipped: ${postsSkipped}\n`);

    return postsUpdated;
  } catch (error) {
    console.error('❌ Error during post migration:', error.message);
    throw error;
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting Firestore migration...\n');
    console.log('═'.repeat(60));

    // Migrate usernames
    const usersUpdated = await migrateUsernames();

    console.log('═'.repeat(60));
    console.log();

    // Migrate post author usernames
    const postsUpdated = await migratePostAuthorUsernames();

    console.log('═'.repeat(60));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`   Total time: ${duration}s`);
    console.log(`   Users updated: ${usersUpdated}`);
    console.log(`   Posts updated: ${postsUpdated}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
runMigration();
