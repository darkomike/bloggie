# 🚀 Quick Fix for Firebase Error

## The Problem

You're seeing this error:
```
Error [FirebaseError]: Firebase: Error (auth/invalid-api-key)
```

## The Solution (2 Steps)

### Step 1: Create .env.local file

Your `.env.example` already has Firebase credentials! Just copy it:

```bash
cp .env.example .env.local
```

Or manually create `.env.local` and paste the contents from `.env.example`

### Step 2: Restart the dev server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

That's it! The app should now load without errors.

## What's Happening?

- `.env.example` has your Firebase config but Next.js doesn't read it
- Next.js only reads from `.env.local` (which is git-ignored for security)
- Once you create `.env.local`, Firebase will initialize properly

## Next Steps

After the app loads:

1. **Enable Firestore** in Firebase Console
2. **Add blog posts** (see SAMPLE_DATA.md)
3. **Customize** the design and content

## Still Having Issues?

Make sure your `.env.local` file contains:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- All other Firebase variables from `.env.example`

---

Need more help? Check README.md for detailed setup instructions.
