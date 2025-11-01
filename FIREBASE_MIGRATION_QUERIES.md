# Firebase Queries for Username Migration

## Option 1: Direct Firebase Console (Firestore)

### 1. Find All Users Without Usernames

Go to Firebase Console → Firestore Database → Run Query

```
Collection: users
Filter: username
Condition: does not exist (or is empty)
```

This will show you all users that need username migration.

---

## Option 2: Firebase CLI Query

### Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Query Users Without Usernames

```bash
firebase firestore:query users --limit=100 | grep -v username
```

---

## Option 3: JavaScript/Node.js Query

### Basic Query to Find Users Without Usernames

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function findUsersWithoutUsernames() {
  const snapshot = await db.collection('users')
    .where('username', '==', null)
    .get();
  
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    email: doc.data().email,
    displayName: doc.data().displayName,
  }));
}

// Or if field doesn't exist
async function findUsersWithMissingUsername() {
  const snapshot = await db.collection('users').get();
  
  return snapshot.docs
    .filter(doc => !doc.data().username)
    .map(doc => ({
      uid: doc.id,
      email: doc.data().email,
      displayName: doc.data().displayName,
    }));
}
```

---

## Option 4: Batch Update Query

### Update All Users With Generated Usernames

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function generateUsernameFromEmail(email) {
  return email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

async function ensureUniqueUsername(baseUsername) {
  let username = baseUsername;
  let counter = 1;
  
  while (true) {
    const exists = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();
    
    if (exists.empty) return username;
    username = `${baseUsername}-${counter}`;
    counter++;
  }
}

async function migrateAllUsernames() {
  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500; // Firestore limit

  const snapshot = await db.collection('users').get();

  for (const userDoc of snapshot.docs) {
    const userData = userDoc.data();
    
    // Skip if already has username
    if (userData.username) continue;
    
    // Skip if no email
    if (!userData.email) continue;

    try {
      const baseUsername = await generateUsernameFromEmail(userData.email);
      const uniqueUsername = await ensureUniqueUsername(baseUsername);

      batch.update(userDoc.ref, {
        username: uniqueUsername,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      batchCount++;

      // Commit batch every 500 updates
      if (batchCount === BATCH_SIZE) {
        await batch.commit();
        console.log(`✅ Committed ${batchCount} username updates`);
        batchCount = 0;
      }
    } catch (error) {
      console.error(`Error processing user ${userDoc.id}:`, error);
    }
  }

  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
    console.log(`✅ Committed final ${batchCount} username updates`);
  }
}

// Run migration
migrateAllUsernames()
  .then(() => console.log('✅ Migration complete!'))
  .catch(err => console.error('❌ Migration failed:', err));
```

---

## Option 5: Update Posts With Author Usernames

### Query to Find Posts Without Author Username

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function findPostsWithoutAuthorUsername() {
  const snapshot = await db.collection('posts').get();
  
  return snapshot.docs
    .filter(doc => {
      const post = doc.data();
      return post.author && !post.author.username;
    })
    .map(doc => ({
      postId: doc.id,
      title: doc.data().title,
      authorUid: doc.data().author?.uid,
    }));
}

// Find count
async function countPostsNeedingMigration() {
  const posts = await findPostsWithoutAuthorUsername();
  return posts.length;
}
```

### Update Posts With Author Usernames

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function updatePostsWithAuthorUsernames() {
  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  const snapshot = await db.collection('posts').get();

  for (const postDoc of snapshot.docs) {
    const postData = postDoc.data();
    
    // Skip if author already has username
    if (postData.author?.username) continue;
    
    // Skip if no author UID
    if (!postData.author?.uid) continue;

    try {
      // Get user data
      const userDoc = await db.collection('users')
        .doc(postData.author.uid)
        .get();

      if (!userDoc.exists()) continue;

      const userData = userDoc.data();
      
      if (!userData.username) continue;

      batch.update(postDoc.ref, {
        'author.username': userData.username,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      batchCount++;

      if (batchCount === BATCH_SIZE) {
        await batch.commit();
        console.log(`✅ Updated ${batchCount} posts with author usernames`);
        batchCount = 0;
      }
    } catch (error) {
      console.error(`Error updating post ${postDoc.id}:`, error);
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`✅ Updated final ${batchCount} posts`);
  }
}

// Run migration
updatePostsWithAuthorUsernames()
  .then(() => console.log('✅ Posts migration complete!'))
  .catch(err => console.error('❌ Posts migration failed:', err));
```

---

## Option 6: Complete Migration Script

### All-in-One Migration

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Helper functions
function deriveUsernameFromEmail(email) {
  return email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

async function ensureUniqueUsername(baseUsername) {
  let username = baseUsername;
  let counter = 1;
  
  while (true) {
    const exists = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();
    
    if (exists.empty) return username;
    username = `${baseUsername}-${counter}`;
    counter++;
  }
}

// Main migration
async function runFullMigration() {
  console.log('🚀 Starting full migration...\n');
  
  const stats = { usersUpdated: 0, postsUpdated: 0, errors: 0 };
  
  // Phase 1: Migrate users
  console.log('📋 Phase 1: Migrating user usernames...\n');
  
  const usersBatch = db.batch();
  let usersCount = 0;
  
  const usersSnapshot = await db.collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    
    if (userData.username || !userData.email) continue;
    
    try {
      const baseUsername = deriveUsernameFromEmail(userData.email);
      const uniqueUsername = await ensureUniqueUsername(baseUsername);
      
      usersBatch.update(userDoc.ref, {
        username: uniqueUsername,
      });
      
      stats.usersUpdated++;
      usersCount++;
      console.log(`✅ ${userData.email} → ${uniqueUsername}`);
      
      if (usersCount === 500) {
        await usersBatch.commit();
        console.log(`\n📊 Committed 500 user updates\n`);
        usersCount = 0;
      }
    } catch (error) {
      stats.errors++;
      console.error(`❌ Error with ${userData.email}:`, error.message);
    }
  }
  
  if (usersCount > 0) {
    await usersBatch.commit();
    console.log(`\n📊 Committed final ${usersCount} user updates\n`);
  }
  
  // Phase 2: Migrate posts
  console.log('\n📝 Phase 2: Migrating post author usernames...\n');
  
  const postsBatch = db.batch();
  let postsCount = 0;
  
  const postsSnapshot = await db.collection('posts').get();
  
  for (const postDoc of postsSnapshot.docs) {
    const postData = postDoc.data();
    
    if (postData.author?.username || !postData.author?.uid) continue;
    
    try {
      const userDoc = await db.collection('users')
        .doc(postData.author.uid)
        .get();
      
      if (!userDoc.exists()) continue;
      
      const userData = userDoc.data();
      
      if (!userData.username) continue;
      
      postsBatch.update(postDoc.ref, {
        'author.username': userData.username,
      });
      
      stats.postsUpdated++;
      postsCount++;
      console.log(`✅ Post "${postData.title}" → author: ${userData.username}`);
      
      if (postsCount === 500) {
        await postsBatch.commit();
        console.log(`\n📊 Committed 500 post updates\n`);
        postsCount = 0;
      }
    } catch (error) {
      stats.errors++;
      console.error(`❌ Error with post ${postDoc.id}:`, error.message);
    }
  }
  
  if (postsCount > 0) {
    await postsBatch.commit();
    console.log(`\n📊 Committed final ${postsCount} post updates\n`);
  }
  
  // Summary
  console.log('═'.repeat(60));
  console.log('\n🎉 Migration Complete!\n');
  console.log('📊 Summary:');
  console.log(`   Users updated: ${stats.usersUpdated}`);
  console.log(`   Posts updated: ${stats.postsUpdated}`);
  console.log(`   Errors: ${stats.errors}\n`);
  
  process.exit(0);
}

// Run
runFullMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
```

---

## Usage

### Run the Complete Migration Script

```bash
# 1. Save service account (get from Firebase Console)
# → Save as firebase-service-account.json

# 2. Save the script above as migrate.js

# 3. Install dependencies
npm install firebase-admin

# 4. Run migration
node migrate.js

# 5. Clean up
rm firebase-service-account.json
```

---

## Monitoring the Migration

### Check Migration Progress

```javascript
// Count users updated
async function countUsersWithUsernames() {
  const snapshot = await db.collection('users')
    .where('username', '!=', null)
    .get();
  return snapshot.size;
}

// Count users still needing migration
async function countUsersMissingUsernames() {
  const snapshot = await db.collection('users').get();
  return snapshot.docs.filter(doc => !doc.data().username).length;
}

// Check posts updated
async function countPostsWithAuthorUsernames() {
  const snapshot = await db.collection('posts').get();
  return snapshot.docs.filter(doc => doc.data().author?.username).length;
}
```

---

## Safety Tips

✅ **Safe to run multiple times** - Skips already-migrated users/posts
✅ **Atomic updates** - Uses batch writes (max 500 per commit)
✅ **Error handling** - Continues if single item fails
✅ **Reversible** - Can delete usernames to rollback

---

## Rollback Query

If you need to remove all usernames:

```javascript
async function rollbackUsernames() {
  const batch = db.batch();
  let count = 0;
  
  const snapshot = await db.collection('users').get();
  
  for (const doc of snapshot.docs) {
    batch.update(doc.ref, {
      username: admin.firestore.FieldValue.delete(),
    });
    count++;
    
    if (count === 500) {
      await batch.commit();
      count = 0;
    }
  }
  
  if (count > 0) await batch.commit();
  
  console.log('✅ Rollback complete');
}
```

---

## Questions?

- **Firestore Query Limit**: Can't query non-indexed fields. Workaround: fetch all and filter locally
- **Performance**: For 10k+ users, consider pagination with cursor
- **Real-time Updates**: Use `.onSnapshot()` instead of `.get()` to watch changes
