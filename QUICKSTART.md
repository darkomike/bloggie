# Quick Start Guide - Bloggie

## Initial Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Firebase
1. Create project at https://console.firebase.google.com/
2. Enable Firestore, Auth, and Storage
3. Copy your config from Project Settings

### 3. Setup Resend
1. Sign up at https://resend.com/
2. Get your API key

### 4. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 5. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Creating Your First Blog Post

Add to Firestore `posts` collection:

```javascript
{
  title: "My First Post",
  slug: "my-first-post",
  excerpt: "This is an introduction to my first blog post",
  content: "# Welcome\n\nThis is my first blog post content in markdown...",
  author: {
    id: "author-1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://example.com/avatar.jpg",
    bio: "Software developer and writer"
  },
  category: "Technology",
  tags: ["javascript", "nextjs", "web-development"],
  publishedAt: new Date(),
  published: true,
  readingTime: 5
}
```

## Project Files Overview

### Core Configuration
- `next.config.mjs` - Next.js settings
- `tailwind.config.js` - Styling configuration  
- `.env.local` - Your secrets (not in git)
- `package.json` - Dependencies

### Key Directories
- `src/app/` - Pages and API routes
- `src/components/` - Reusable UI components
- `src/lib/` - Services and utilities

### Important Files
- `src/lib/firebase/config.js` - Firebase initialization
- `src/lib/firebase/blog-service.js` - Blog CRUD operations
- `src/lib/resend/email-service.js` - Email functions
- `src/components/Header.js` - Site navigation
- `src/components/Footer.js` - Site footer

## Common Tasks

### Add a New Page
Create `src/app/about/page.js`:
```javascript
export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold">About Us</h1>
      <p className="mt-4">Welcome to our blog...</p>
    </div>
  );
}
```

### Create a New Component
Create `src/components/MyComponent.js`:
```javascript
export default function MyComponent({ title }) {
  return (
    <div className="p-4">
      <h2>{title}</h2>
    </div>
  );
}
```

### Add an API Route
Create `src/app/api/hello/route.js`:
```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello World' });
}
```

## Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    },
  },
}
```

### Update Site Metadata
Edit `src/app/layout.js`:
```javascript
export const metadata = {
  title: "Your Blog Name",
  description: "Your blog description",
};
```

## Deployment Checklist

- [ ] Set environment variables in hosting platform
- [ ] Configure Firebase Security Rules
- [ ] Update NEXT_PUBLIC_APP_URL
- [ ] Test email functionality
- [ ] Add your domain to Resend
- [ ] Enable Firebase App Check (optional)

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Firebase connection issues
- Check environment variables in `.env.local`
- Verify Firebase config is correct
- Ensure Firestore is enabled

### Email not sending
- Verify RESEND_API_KEY is set
- Check API key is valid
- For production, verify your domain in Resend

## Next Steps

1. ✅ Setup complete? Add your first blog post
2. 🎨 Customize colors and branding
3. 📝 Create About and Contact pages
4. 🔐 Add authentication for admin panel
5. 📊 Setup analytics
6. 🚀 Deploy to production

---

Need help? Check the main README.md or Next.js documentation.
