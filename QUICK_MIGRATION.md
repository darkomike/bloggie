# Quick Migration Reference

## 🚀 Fastest Way to Migrate (5 minutes)

### 1. Download Firebase Service Account
```bash
# Go to: https://console.firebase.google.com/
# → Your Project → Project Settings → Service Accounts
# → Generate New Private Key
# Save as: firebase-service-account.json
```

### 2. Run the Migration
```bash
# Copy this entire script into a file called migrate.js:

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function deriveUsername(email) {
  return email.split('@')[0].toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 30);
}

async function ensureUnique(base) {
  let username = base, counter = 1;
  while (!(await db.collection('users').where('username', '==', username).limit(1).get()).empty) {
    username = `${base}-${counter++}`;
  }
  return username;
}

(async () => {
  console.log('🚀 Starting migration...\n');
  let updated = 0;
  
  // Update users
  for (const userDoc of (await db.collection('users').get()).docs) {
    const {email, username} = userDoc.data();
    if (username || !email) continue;
    
    const unique = await ensureUnique(deriveUsername(email));
    await userDoc.ref.update({username: unique});
    console.log(`✅ ${email} → ${unique}`);
    updated++;
  }
  
  console.log(`\n📊 Updated ${updated} users\n`);
  
  // Update posts
  updated = 0;
  for (const postDoc of (await db.collection('posts').get()).docs) {
    const post = postDoc.data();
    if (post.author?.username || !post.author?.uid) continue;
    
    const userDoc = await db.collection('users').doc(post.author.uid).get();
    if (!userDoc.exists() || !userDoc.data().username) continue;
    
    await postDoc.ref.update({'author.username': userDoc.data().username});
    console.log(`✅ ${post.title}`);
    updated++;
  }
  
  console.log(`\n📊 Updated ${updated} posts\n🎉 Done!`);
  process.exit(0);
})();
```

### 3. Run It
```bash
npm install firebase-admin
node migrate.js
rm firebase-service-account.json  # cleanup
```

---

## 📊 Expected Output
```
🚀 Starting migration...

✅ john.doe@example.com → john.doe
✅ jane@company.com → jane
✅ bob.smith@gmail.com → bob.smith

📊 Updated 3 users

✅ My First Blog Post
✅ A Great Article
✅ Why I Love Coding

📊 Updated 3 posts

🎉 Done!
```

---

## 🎯 What It Does
- ✅ Finds all users without usernames
- ✅ Creates username from email (john.doe@example.com → john.doe)
- ✅ Ensures uniqueness (adds -1, -2, etc. if needed)
- ✅ Updates all posts with author username
- ✅ Safe to run multiple times (skips already-migrated data)

---

## Alternative: Use Homepage
Just refresh your homepage at `http://localhost:3000/` and watch the migration run automatically in the bottom-right corner notification! 🎉

---

## ⚠️ Important
- Delete `firebase-service-account.json` after migration (security!)
- Backup your database first if you're nervous
- Can be undone with FIREBASE_MIGRATION_QUERIES.md rollback section

---

## Still Have Questions?
- See: `FIREBASE_MIGRATION_QUERIES.md` - Advanced queries and options
- See: `scripts/README.md` - Server-side script setup
- See: `RUN_MIGRATION.md` - Detailed step-by-step guide
