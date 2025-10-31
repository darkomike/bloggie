# Sample Blog Post Data

Use this sample data to create your first blog posts in Firebase Firestore.

## Sample Post 1: Technology Post

```javascript
{
  title: "Getting Started with Next.js 15",
  slug: "getting-started-with-nextjs-15",
  excerpt: "Learn how to build modern web applications with Next.js 15 and the new App Router.",
  content: `# Getting Started with Next.js 15

Next.js 15 brings exciting new features and improvements to the React framework.

## What's New

The latest version includes:

- **Improved Performance**: Faster builds and optimized runtime
- **App Router**: File-based routing with Server Components
- **Turbopack**: Lightning-fast bundler (beta)
- **Enhanced Image Optimization**: Better loading and performance

## Installation

Getting started is simple:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Server Components

Server Components are the future of React:

\`\`\`javascript
export default async function Page() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}
\`\`\`

## Conclusion

Next.js 15 makes it easier than ever to build fast, modern web applications.`,
  coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
  author: {
    id: "author-1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Full-stack developer passionate about modern web technologies and clean code.",
    social: {
      twitter: "https://twitter.com/sarahjohnson",
      github: "https://github.com/sarahjohnson",
      linkedin: "https://linkedin.com/in/sarahjohnson"
    }
  },
  category: "Technology",
  tags: ["nextjs", "react", "web-development", "javascript"],
  publishedAt: new Date("2025-10-15"),
  published: true,
  readingTime: 5,
  views: 0
}
```

## Sample Post 2: Tutorial Post

```javascript
{
  title: "Building a Blog with Firebase and Next.js",
  slug: "building-blog-firebase-nextjs",
  excerpt: "A comprehensive guide to creating a modern blog platform using Firebase Firestore and Next.js.",
  content: `# Building a Blog with Firebase and Next.js

In this tutorial, we'll build a complete blog platform from scratch.

## Prerequisites

Before we begin, make sure you have:

- Node.js 18+ installed
- A Firebase account
- Basic knowledge of React

## Step 1: Project Setup

First, create a new Next.js project:

\`\`\`bash
npx create-next-app@latest my-blog
cd my-blog
npm install firebase
\`\`\`

## Step 2: Firebase Configuration

Create a Firebase project and add your config:

\`\`\`javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
\`\`\`

## Step 3: Create Blog Posts

Use Firestore to store your posts:

\`\`\`javascript
import { collection, addDoc } from 'firebase/firestore';

const createPost = async (post) => {
  await addDoc(collection(db, 'posts'), post);
};
\`\`\`

## Conclusion

You now have a fully functional blog platform! 🎉`,
  coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop",
  author: {
    id: "author-2",
    name: "Michael Chen",
    email: "michael@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    bio: "Software engineer and technical writer with a passion for teaching others.",
    social: {
      twitter: "https://twitter.com/michaelchen",
      github: "https://github.com/michaelchen"
    }
  },
  category: "Tutorial",
  tags: ["firebase", "nextjs", "tutorial", "fullstack"],
  publishedAt: new Date("2025-10-20"),
  published: true,
  readingTime: 8,
  views: 0
}
```

## Sample Post 3: Design Post

```javascript
{
  title: "Modern Web Design Principles for 2025",
  slug: "modern-web-design-principles-2025",
  excerpt: "Explore the latest trends and best practices in web design that will define the user experience in 2025.",
  content: `# Modern Web Design Principles for 2025

The web design landscape continues to evolve. Here are the key principles for creating exceptional user experiences.

## 1. Mobile-First Approach

Design for mobile devices first, then scale up:

- Responsive layouts
- Touch-friendly interactions
- Optimized performance

## 2. Minimalism and Clarity

Less is more in modern design:

- Clean interfaces
- Ample white space
- Clear typography

## 3. Accessibility First

Make your site accessible to everyone:

- Proper color contrast
- Keyboard navigation
- Screen reader support
- Semantic HTML

## 4. Performance Matters

Speed is crucial:

- Lazy loading images
- Code splitting
- Optimized assets
- Fast page loads

## Conclusion

Following these principles will help you create websites that users love in 2025 and beyond.`,
  coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop",
  author: {
    id: "author-3",
    name: "Emily Rodriguez",
    email: "emily@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    bio: "UX/UI designer focused on creating beautiful and accessible web experiences.",
    social: {
      website: "https://emilyrodriguez.design",
      linkedin: "https://linkedin.com/in/emilyrodriguez"
    }
  },
  category: "Design",
  tags: ["design", "ux", "ui", "web-design", "accessibility"],
  publishedAt: new Date("2025-10-25"),
  published: true,
  readingTime: 6,
  views: 0
}
```

## How to Add These Posts to Firestore

### Option 1: Using Firebase Console

1. Go to Firebase Console > Firestore Database
2. Click "Start collection"
3. Collection ID: `posts`
4. Add a document with auto-generated ID
5. Copy and paste the fields from above

### Option 2: Using JavaScript (Recommended)

Create a script to seed your database:

```javascript
// scripts/seedPosts.js
import { db } from '../src/lib/firebase/config.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const samplePosts = [
  // Paste sample posts here
];

async function seedPosts() {
  for (const post of samplePosts) {
    // Convert Date to Firestore Timestamp
    const postData = {
      ...post,
      publishedAt: Timestamp.fromDate(post.publishedAt)
    };
    
    await addDoc(collection(db, 'posts'), postData);
    console.log(`Added: ${post.title}`);
  }
}

seedPosts().then(() => {
  console.log('All posts added!');
}).catch(console.error);
```

## Categories for Filtering

Create these category documents in a `categories` collection:

```javascript
[
  {
    name: "Technology",
    slug: "technology",
    description: "Latest in tech, programming, and software development"
  },
  {
    name: "Tutorial",
    slug: "tutorial",
    description: "Step-by-step guides and how-to articles"
  },
  {
    name: "Design",
    slug: "design",
    description: "Web design, UX/UI, and visual design topics"
  },
  {
    name: "Business",
    slug: "business",
    description: "Business insights, entrepreneurship, and growth"
  }
]
```

## Testing Your Blog

After adding these posts:

1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. You should see the posts on the homepage
4. Click on a post to view the full content

Happy blogging! 🚀
