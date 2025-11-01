# Username Migration - Quick Start Guide

## Overview

You have **two options** to migrate usernames:

### Option 1: Server-Side Migration (Recommended)
Use `scripts/migrateUsernamesFromEmails.js` - Requires Firebase Admin SDK

**Pros:**
- ✅ More reliable and secure
- ✅ Runs server-side with admin privileges
- ✅ Better error handling
- ✅ Detailed logging

**Cons:**
- ❌ Need Firebase service account JSON file
- ❌ Requires Node.js CLI

### Option 2: Browser-Based Migration (Quick)
Use `scripts/migrateUsernamesFromEmails.client.js` - Runs in browser

**Pros:**
- ✅ No service account needed
- ✅ Quick setup, copy-paste code
- ✅ See progress in real-time

**Cons:**
- ❌ Less secure (client-side)
- ❌ May timeout on large databases
- ❌ Browser must stay open

---

## Option 1: Server-Side Migration

### Step 1: Download Firebase Service Account

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to **Project Settings** → **Service Accounts**
3. Click **Generate New Private Key**
4. Save the file as `firebase-service-account.json` in your project root

### Step 2: Install Dependencies

```bash
npm install firebase-admin
```

### Step 3: Run Migration

```bash
node scripts/migrateUsernamesFromEmails.js
```

### Step 4: Cleanup

Delete the service account file after migration:
```bash
rm firebase-service-account.json
```

---

## Option 2: Browser-Based Migration

### Step 1: Copy the Migration Function

Open `scripts/migrateUsernamesFromEmails.client.js` and copy the entire file.

### Step 2: Create a Page to Run It

Create a new file: `src/app/admin/migrate/page.js`

```javascript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function MigrationPage() {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleMigrate = async () => {
    setRunning(true);
    setLogs([]);

    // Paste the migration function code here...
    // Then call: await migrateUsernamesFromEmails();
  };

  if (!user) return <div>Please sign in</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Username Migration</h1>
      <button
        onClick={handleMigrate}
        disabled={running}
        className="bg-blue-600 text-white px-6 py-2 rounded mb-4"
      >
        {running ? 'Migrating...' : 'Start Migration'}
      </button>
      <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
}
```

### Step 3: Visit the Page

Go to `http://localhost:3000/admin/migrate` and click **Start Migration**

---

## What Gets Migrated

### Users
- Email: `john.doe@example.com` → Username: `john.doe`
- Email: `jane@company.com` → Username: `jane`
- If username taken → `john.doe-1`, `john.doe-2`, etc.

### Posts
- Updates all posts to include author username
- Posts can now link to `/user/{author.username}`

---

## After Migration

✅ All users have usernames
✅ Author links work on blog cards
✅ User profile pages accessible at `/user/{username}`
✅ Old posts still work with backward compatibility

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module 'firebase-admin'" | Run `npm install firebase-admin` |
| "Service account not found" | Download it from Firebase Console |
| "Permission denied" errors | Check Firestore rules allow service account access |
| Script timeout | Use server-side option instead |
| Username conflicts | Script automatically appends counters |

---

## Rollback (if needed)

If something goes wrong, you can remove usernames:

```javascript
// This will remove all usernames (revert migration)
const usersSnapshot = await getDocs(collection(db, 'users'));
for (const userDoc of usersSnapshot.docs) {
  await updateDoc(doc(db, 'users', userDoc.id), {
    username: deleteField(),
  });
}
```

---

## Questions?

Check `scripts/MIGRATION_GUIDE.md` for detailed information.
