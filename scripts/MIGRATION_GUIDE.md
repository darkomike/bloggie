# Username Migration Script

This script migrates usernames for all users and posts from their email addresses.

## Setup

### 1. Get Firebase Service Account

First, you need to download your Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `firebase-service-account.json` in the project root

### 2. Install Dependencies

```bash
npm install firebase-admin
```

## Usage

Run the migration script:

```bash
node scripts/migrateUsernamesFromEmails.js
```

## What the Script Does

### For Users:
1. ✅ Finds all users without a username
2. ✅ Derives username from their email (e.g., "john.doe@example.com" → "john.doe")
3. ✅ Ensures uniqueness by appending counters if needed (e.g., "john.doe", "john.doe-1", "john.doe-2")
4. ✅ Updates Firestore user documents with the new usernames
5. ✅ Records the timestamp when username was generated

### For Posts:
1. ✅ Finds all posts where author doesn't have a username
2. ✅ Looks up the user data for the author
3. ✅ Updates the post with the author's username
4. ✅ Handles missing users and users without usernames gracefully

## Output

The script provides detailed logging:

```
🚀 Starting Firestore migration...
============================================================
📋 Starting username migration...

Found 5 users to process

✅ Updated user abc123: "john@example.com" → "john"
⏭️  Skipping user def456: Already has username "jane.doe"
✅ Updated user ghi789: "bob.smith@example.com" → "bob.smith"

📊 Users migration summary:
   Total processed: 5
   Updated: 2
   Skipped: 3

============================================================

📝 Starting post author username migration...

Found 10 posts to process

✅ Updated post post1: Added author username "john"
⏭️  Skipping post post2: Author already has username
✅ Updated post post3: Added author username "bob.smith"

📊 Posts migration summary:
   Total processed: 10
   Updated: 2
   Skipped: 8

============================================================

🎉 Migration completed successfully!
   Total time: 3.45s
   Users updated: 2
   Posts updated: 2
```

## Important Notes

⚠️ **Before Running:**
- This script modifies your Firestore database
- Make sure you have a backup of your data
- Test on a development Firebase project first if possible
- Ensure the Firebase service account has write permissions

✅ **Safe to Run Multiple Times:**
- Users who already have usernames are skipped
- Posts with author usernames are skipped
- You can run this script multiple times without issues

## Troubleshooting

### "Error loading Firebase service account"
- Make sure `firebase-service-account.json` exists in the project root
- The JSON file should be from Firebase Console → Project Settings → Service Accounts

### "Permission denied" errors
- Your Firebase service account may lack permissions
- Check Firestore security rules allow writes from service account
- Ensure the service account is properly configured in Firebase Console

### Script seems stuck
- The script processes users/posts sequentially
- Large databases may take longer
- You can interrupt with Ctrl+C and run again (it will skip processed users)

## After Migration

Once the migration is complete:

1. ✅ All users have usernames derived from their emails
2. ✅ All posts have author usernames for proper linking
3. ✅ User profile URLs work at `/user/{username}`
4. ✅ Author links on blog cards and posts are clickable

You can now delete `firebase-service-account.json` from your project root for security.
