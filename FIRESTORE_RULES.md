# Firestore Security Rules

Use these security rules in your Firebase Console under Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Posts collection
    match /posts/{postId} {
      // Anyone can read published posts
      allow read: if resource.data.published == true;
      
      // Only authenticated users can read unpublished posts
      allow read: if isSignedIn() && resource.data.published == false;
      
      // Only authenticated users can create/update/delete posts
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isSignedIn();
    }
    
    // Newsletter collection
    match /newsletter/{emailId} {
      // Anyone can subscribe (create)
      allow create: if true;
      
      // Only authenticated users can read/delete
      allow read, delete: if isSignedIn();
      
      // No updates allowed
      allow update: if false;
    }
    
    // Contacts collection
    match /contacts/{contactId} {
      // Anyone can create contact submissions
      allow create: if true;
      
      // Only authenticated users can read/delete
      allow read, delete: if isSignedIn();
      
      // No updates allowed
      allow update: if false;
    }
    
    // Categories collection (optional - for future use)
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isSignedIn();
    }
    
    // Comments collection (optional - for future use)
    match /comments/{commentId} {
      // Anyone can read approved comments
      allow read: if resource.data.approved == true;
      
      // Authenticated users can read their own comments
      allow read: if isSignedIn() && resource.data.author.email == request.auth.token.email;
      
      // Authenticated users can create comments
      allow create: if isSignedIn();
      
      // Users can update their own comments
      allow update: if isSignedIn() && resource.data.author.email == request.auth.token.email;
      
      // Only authenticated users can delete comments
      allow delete: if isSignedIn();
    }
  }
}
```

## How to Apply These Rules

1. Go to Firebase Console
2. Select your project
3. Navigate to **Firestore Database**
4. Click on the **Rules** tab
5. Replace the existing rules with the above code
6. Click **Publish**

## Testing Your Rules

You can test these rules in the Firebase Console:

1. Go to **Firestore Database > Rules**
2. Click on **Rules Playground**
3. Test different scenarios:
   - Reading published posts (should work)
   - Creating a newsletter subscription (should work)
   - Writing a post without authentication (should fail)

## Important Notes

- These rules assume you'll add authentication for admin users
- Newsletter subscriptions are open to everyone
- Contact form submissions are open to everyone
- All administrative actions require authentication
- You may need to adjust these rules based on your specific needs

## Future Enhancements

Consider adding these rules when you implement the features:

- **User profiles**: Restrict users to only edit their own profile
- **Comments moderation**: Add admin roles for approving comments
- **Draft posts**: Allow authors to save drafts
- **File uploads**: Secure storage rules for images
