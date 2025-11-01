# Username Migration Summary

## What's Been Done ✅

### 1. **Migration Scripts Created**
- **`scripts/migrateUsernamesFromEmails.js`** - Server-side Node.js script
  - Uses Firebase Admin SDK
  - Derives usernames from email addresses
  - Ensures username uniqueness with auto-incrementing counters
  - Updates both users and posts in one run
  - Detailed progress logging

- **`scripts/migrateUsernamesFromEmails.client.js`** - Browser-based script
  - Client-side alternative for quick testing
  - Can be run from browser console
  - Good for development/small databases

### 2. **Documentation**
- **`scripts/README.md`** - Quick start guide comparing both options
- **`scripts/MIGRATION_GUIDE.md`** - Comprehensive setup and troubleshooting

### 3. **Code Updates**
- Updated `BlogCard.js` - Fallback to UID if username missing
- Updated `blog/[slug]/page.js` - Fallback to UID for author links
- Updated `user/[id]/page.js` - Try username first, then UID lookup
- Updated `PostModel.js` - Document author object structure

### 4. **NPM Script Added**
```bash
npm run migrate:usernames
```

## How to Use ⚡

### Quick Start (Recommended - Server-Side)

```bash
# 1. Download Firebase service account from Console
#    Project Settings → Service Accounts → Generate Key

# 2. Save as firebase-service-account.json in project root

# 3. Install dependencies (if not already installed)
npm install firebase-admin

# 4. Run migration
npm run migrate:usernames

# 5. Delete the service account file (for security)
rm firebase-service-account.json
```

### Alternative (Browser-Based)

```bash
# 1. Copy scripts/migrateUsernamesFromEmails.client.js

# 2. Create admin page or add to browser console

# 3. Run: await migrateUsernamesFromEmails()

# 4. Watch progress in console
```

## Migration Details 🔍

### For Each User:
1. ✅ Check if already has username (skip if yes)
2. ✅ Derive from email: `john.doe@example.com` → `john.doe`
3. ✅ Check uniqueness in Firestore
4. ✅ If taken, append counter: `john.doe-1`, `john.doe-2`, etc.
5. ✅ Update Firestore document

### For Each Post:
1. ✅ Check if author already has username (skip if yes)
2. ✅ Look up user data in Firestore
3. ✅ Add username to post's author object
4. ✅ Update post document

## What Happens After Migration ✨

| Before | After |
|--------|-------|
| `/user/{uid}` | `/user/{username}` |
| Author links broken | Author links work! |
| Posts have no username | Posts have author username |
| Manual username setup | Auto-generated usernames |

## Features Working After Migration 🎯

- ✅ Click author name on blog cards → goes to author profile
- ✅ Click author on blog post → goes to author profile  
- ✅ User profile page shows all author's posts
- ✅ Profile URLs are user-friendly: `/user/john.doe`
- ✅ Backward compatible - old UID URLs still work

## Safety & Rollback 🛡️

### Safe to Run Multiple Times
- Skips users who already have usernames
- Skips posts that already have author usernames
- Idempotent operation

### Rollback (if needed)
```javascript
// Remove all usernames from users
const usersSnapshot = await getDocs(collection(db, 'users'));
for (const userDoc of usersSnapshot.docs) {
  await updateDoc(doc(db, 'users', userDoc.id), {
    username: firebase.firestore.FieldValue.delete(),
  });
}
```

## Troubleshooting 🔧

| Problem | Solution |
|---------|----------|
| "Cannot find firebase-admin" | `npm install firebase-admin` |
| "Service account not found" | Download from Firebase Console |
| "Permission denied" | Check Firestore security rules |
| "Script times out" | Use server-side script instead |
| Need to see what would change | Add `--dry-run` flag (can be added to script) |

## Files Created/Modified 📁

### New Files
- `scripts/migrateUsernamesFromEmails.js` - Main server-side script
- `scripts/migrateUsernamesFromEmails.client.js` - Browser-based script
- `scripts/README.md` - Quick start
- `scripts/MIGRATION_GUIDE.md` - Detailed guide
- `src/lib/usernameUtils.js` - Username utilities

### Modified Files
- `src/components/BlogCard.js` - Fallback URL logic
- `src/app/blog/[slug]/page.js` - Fallback URL logic
- `src/app/user/[id]/page.js` - Lookup both username and UID
- `src/models/postModel.js` - Updated comments
- `package.json` - Added npm script

## Next Steps 📋

1. ✅ Run the migration script
2. ✅ Verify users have usernames
3. ✅ Test author links on blog cards
4. ✅ Test user profile pages
5. ✅ Deploy to production
6. ✅ Monitor for any issues

## Questions? 💬

Check the documentation:
- `scripts/README.md` - Quick overview
- `scripts/MIGRATION_GUIDE.md` - Detailed guide with examples
- Migration scripts have inline comments

## Version Info 📦

- Firebase: ^11.0.1
- Node.js: 14+ (for server-side script)
- Browser: Modern (for client-side script)

Happy migrating! 🚀
