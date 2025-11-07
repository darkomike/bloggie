# Bloggie - Professional Blog Platform# 📝 Bloggie - Professional Blog Platform# Bloggie - Professional Blog Platform



A modern, full-featured blogging platform built with Next.js 15, React 19, and Firebase. Features custom authentication, real-time engagement, analytics dashboard, and a beautiful dark mode interface.



## ✨ Key FeaturesA modern, full-featured blog web application built with Next.js 15, Firebase, and cutting-edge React 19. Features custom JWT authentication, real-time engagement tracking, and a beautiful responsive UI with dark mode support.A modern, clean, and professional blog web application built with Next.js 15, Firebase, and Resend for email services.



**Content Management**

- Create, edit, and publish blog posts with markdown support

- Category organization and tagging system![Next.js](https://img.shields.io/badge/Next.js-15.0.4-black)## 🚀 Features

- Draft and published post management

- Rich text editing experience![React](https://img.shields.io/badge/React-19.0.0-blue)



**User System**![Firebase](https://img.shields.io/badge/Firebase-11.0.2-orange)- **Modern Tech Stack**: Built with Next.js 15 (App Router), React 19, and JavaScript

- Custom JWT authentication (no Firebase Auth)

- User profiles with photo uploads![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38bdf8)- **Firebase Backend**: Firestore for database (NO Firebase Auth or Storage)

- Follow system to connect with other users

- Personal analytics dashboard- **Custom Authentication**: Server-side JWT-based authentication system



**Engagement**## 🌟 Features- **Email Integration**: Resend for newsletter and contact form emails

- Comment system with real-time updates

- Like and share functionality- **Responsive Design**: Mobile-first design with TailwindCSS

- View tracking and analytics

- Social sharing (X, Facebook, LinkedIn, WhatsApp)### Core Functionality- **SEO Optimized**: Server-side rendering for better SEO



**UI/UX**- ✍️ **Rich Text Blogging** - Create, edit, and publish blog posts with markdown support- **Clean Architecture**: Well-organized code structure following SOLID principles

- Dark mode with theme persistence

- Fully responsive mobile-first design- 👤 **Custom Authentication** - Server-side JWT authentication (no Firebase Auth)

- Beautiful gradient designs and animations

- Loading states and empty state designs- 📊 **Analytics Dashboard** - Comprehensive insights with charts and statistics## 📁 Project Structure



**Additional Features**- 💬 **Comment System** - Real-time commenting with user engagement

- Newsletter subscription via Resend

- Contact form with email notifications- ❤️ **Like & Share** - Social engagement features with tracking```

- Search and category filtering

- SEO optimized with SSR- 👁️ **View Tracking** - Monitor post views and reader engagementbloggie/



## 🛠️ Tech Stack- 🔍 **Search & Categories** - Easy content discovery├── src/



**Frontend**- 📧 **Newsletter Integration** - Email subscriptions via Resend│   ├── app/                    # Next.js App Router pages

- Next.js 15.0.4 (App Router)

- React 19.0.0- 🌓 **Dark Mode** - Beautiful theme toggle with system preference detection│   │   ├── api/               # API routes

- TailwindCSS 3.4.1

- React Icons 5.4.0- 📱 **Fully Responsive** - Mobile-first design│   │   │   ├── contact/       # Contact form API

- Recharts 2.15.0 (for analytics)

│   │   │   └── newsletter/    # Newsletter subscription API

**Backend & Services**

- Firebase 11.0.2 (Firestore database)### User Features│   │   ├── layout.js          # Root layout

- Vercel Blob (file storage)

- Resend 4.0.1 (email service)- **User Profiles** - Customizable profiles with photo uploads (Vercel Blob storage)│   │   ├── page.js            # Home page



**Authentication & Security**- **Follow System** - Follow other users and build your network│   │   └── globals.css        # Global styles

- JSON Web Tokens (jsonwebtoken 9.0.2)

- bcrypt 5.1.1 (password hashing)- **Personal Dashboard** - Track your content performance│   ├── components/            # React components

- Custom server-side authentication

- **Social Sharing** - Share posts on X (Twitter), Facebook, LinkedIn, WhatsApp│   │   ├── Header.js          # Navigation header

**State Management**

- React Context API (AuthProvider, ThemeProvider)- **Recent Activity** - View liked posts and comments on your content│   │   ├── Footer.js          # Footer component

- Custom hooks for data fetching

- Client-side caching with invalidation│   │   ├── BlogCard.js        # Blog post card



## 📁 Project Structure### Technical Highlights│   │   ├── BlogPost.js        # Full blog post display



```- **Server-Side Rendering** - Fast page loads and SEO optimization│   │   └── NewsletterForm.js  # Newsletter subscription form

bloggie/

├── src/- **React Context API** - Clean state management (no external dependencies)│   └── lib/                   # Library code and services

│   ├── app/                    # Next.js pages & routes

│   │   ├── api/               # API endpoints- **Service-Based Architecture** - Modular, maintainable codebase│       ├── firebase/          # Firebase configuration and services

│   │   │   ├── auth/          # Login, signup, logout, session

│   │   │   ├── contact/       # Contact form handler- **SOLID Principles** - Clean code architecture│       │   ├── config.js      # Firebase initialization

│   │   │   ├── newsletter/    # Newsletter subscription

│   │   │   └── upload/        # Image upload (Vercel Blob)- **Cache Management** - Optimized data fetching with invalidation│       │   └── blog-service.js # Blog CRUD operations

│   │   ├── blog/              # Blog pages

│   │   ├── dashboard/         # User dashboard with analytics- **Type Safety** - PropTypes validation throughout│       └── resend/            # Email service

│   │   ├── profile/           # User profile page

│   │   ├── login/             # Login page- **Security** - JWT tokens, environment variables, input validation│           └── email-service.js # Email sending functions

│   │   └── signup/            # Registration page

│   │├── public/                    # Static files

│   ├── components/            # React components

│   │   ├── AuthProvider.js   # Authentication context## 🏗️ Architecture├── .env.example              # Environment variables template

│   │   ├── ThemeProvider.js  # Dark/light mode

│   │   ├── Header.js          # Navigation├── package.json              # Dependencies

│   │   ├── Footer.js          # Footer

│   │   ├── BlogCard.js        # Post preview card### Project Structure├── tailwind.config.js        # Tailwind CSS configuration

│   │   ├── BlogPost.js        # Full post display

│   │   └── ...```├── next.config.mjs           # Next.js configuration

│   │

│   ├── lib/                   # Core librariesbloggie/└── README.md                 # This file

│   │   ├── firebase/          # Firebase services

│   │   │   ├── blog-service.js├── src/```

│   │   │   ├── comment-service.js

│   │   │   ├── like-service.js│   ├── app/                    # Next.js App Router

│   │   │   ├── view-service.js

│   │   │   ├── user-service.js│   │   ├── api/               # API routes## 🛠️ Tech Stack

│   │   │   └── ...

│   │   ├── auth/              # JWT & password utilities│   │   │   ├── auth/          # Authentication endpoints

│   │   ├── cache/             # Cache management

│   │   └── resend/            # Email service│   │   │   ├── contact/       # Contact form handler- **Framework**: Next.js 15 (App Router)

│   │

│   ├── models/                # Data models│   │   │   ├── newsletter/    # Newsletter subscription- **Language**: JavaScript (ES6+)

│   │   ├── postModel.js

│   │   ├── userModel.js│   │   │   └── upload/        # File upload (Vercel Blob)- **Styling**: TailwindCSS with Typography plugin

│   │   ├── commentModel.js

│   │   └── ...│   │   ├── blog/              # Blog pages- **Database**: Firebase Firestore

│   │

│   └── utils/                 # Utility functions│   │   │   ├── [slug]/        # Individual post pages- **Authentication**: Custom Server-Side JWT Authentication

│

└── public/                    # Static assets│   │   │   ├── edit/          # Post editor- **Storage**: Vercel Blob

```

│   │   │   └── new/           # Create new post- **Email**: Resend

## 🚀 Getting Started

│   │   ├── dashboard/         # User dashboard- **Markdown**: React Markdown with Syntax Highlighting

### Prerequisites

- Node.js 18 or higher│   │   ├── profile/           # User profile- **Date Handling**: date-fns

- npm or yarn

- Firebase project│   │   ├── category/          # Category pages- **State Management**: React Context API (built-in)

- Vercel Blob storage account

- Resend account│   │   ├── login/             # Login page



### Installation│   │   ├── signup/            # Registration page## 📋 Prerequisites



1. **Clone the repository**│   │   └── layout.js          # Root layout

```bash

git clone https://github.com/darkomike/bloggie.git│   │- Node.js 18+ and npm

cd bloggie

```│   ├── components/            # React components- A Firebase account



2. **Install dependencies**│   │   ├── AuthProvider.js   # Authentication context- A Resend account (for email services)

```bash

npm install│   │   ├── ThemeProvider.js  # Theme management

```

│   │   ├── Header.js          # Navigation header## ⚙️ Setup Instructions

3. **Environment Setup**

│   │   ├── Footer.js          # Site footer

Create a `.env.local` file in the root directory:

│   │   ├── BlogCard.js        # Blog post preview### 1. Install dependencies

```env

# Firebase Configuration│   │   ├── BlogPost.js        # Full post display

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com│   │   ├── NewsletterForm.js  # Newsletter subscription```bash

NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com│   │   └── ...                # Other componentsnpm install

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id│   │```



# JWT Secret (use a strong random string, min 32 characters)│   ├── lib/                   # Core libraries

JWT_SECRET=your_super_secret_jwt_key_here

│   │   ├── firebase/          # Firebase services### 2. Firebase Setup

# Vercel Blob Storage

BLOB_READ_WRITE_TOKEN=your_vercel_blob_token│   │   │   ├── config.js      # Firebase configuration



# Resend Email Service│   │   │   ├── blog-service.js1. Go to [Firebase Console](https://console.firebase.google.com/)

RESEND_API_KEY=your_resend_api_key

```│   │   │   ├── comment-service.js2. Create a new project



4. **Firebase Setup**│   │   │   ├── like-service.js3. Enable Firestore Database



Create these Firestore collections:│   │   │   ├── view-service.js

- `posts` - Blog posts

- `users` - User profiles│   │   │   ├── share-service.js### 3. Resend Setup

- `comments` - Post comments

- `likes` - Like tracking│   │   │   ├── follow-service.js

- `views` - View tracking

- `shares` - Share tracking│   │   │   ├── user-service.js1. Sign up at [Resend](https://resend.com/)

- `follows` - User follows

- `newsletter` - Newsletter subscribers│   │   │   └── newsletter-service.js2. Get your API key from the dashboard

- `contacts` - Contact form submissions

│   │   │

5. **Run Development Server**

```bash│   │   ├── auth/              # Authentication### 4. Environment Variables

npm run dev

```│   │   │   ├── jwtUtils.js    # JWT token handling



Visit `http://localhost:3000`│   │   │   ├── passwordUtils.js # Password hashing (bcrypt)Create a `.env.local` file:



## 📊 Dashboard Features│   │   │   └── authConfig.js  # Auth configuration



The user dashboard provides comprehensive analytics and content management:│   │   │```bash



**Statistics Overview**│   │   ├── cache/             # Cache managementcp .env.example .env.local

- Total posts (published and drafts)

- Total views with average per post│   │   │   ├── cacheManager.js```

- Comments count and engagement metrics

- Total likes received│   │   │   ├── cacheInvalidation.js



**Analytics Charts**│   │   │   └── cacheConfig.jsUpdate with your credentials (see .env.example for details)

- Post performance bar chart (views per post)

- Engagement breakdown pie chart (views, likes, comments)│   │   │

- Category distribution overview

│   │   ├── resend/            # Email service### 5. Run the development server

**Activity Feeds**

- Recent posts table with status badges│   │   │   └── ...

- Recent comments on your posts

- Posts you've liked│   │   │```bash



**Quick Actions**│   │   └── vercel-blob-service.js # Image uploadsnpm run dev

- Create new post button

- Edit profile link│   │```

- View all posts

│   ├── models/                # Data models

## 🎨 Design System

│   │   ├── postModel.jsOpen [http://localhost:3000](http://localhost:3000)

**Color Palette**

- Primary: Blue gradients (from-blue-500 to-indigo-600)│   │   ├── commentModel.js

- Secondary: Purple/Pink gradients

- Success: Emerald/Teal gradients│   │   ├── userModel.js## 📝 Available Scripts

- Accent: Rose/Fuchsia gradients

│   │   ├── likeModel.js

**Components**

- Gradient backgrounds with multi-stop colors│   │   ├── viewModel.js- `npm run dev` - Start development server with Turbopack

- Glassmorphism effects (backdrop-blur)

- Smooth animations and hover effects│   │   ├── shareModel.js- `npm run build` - Build for production

- Responsive grid layouts (1/2/4 columns)

- Loading skeletons and spinners│   │   └── followModel.js- `npm start` - Start production server

- Empty states with helpful CTAs

│   │- `npm run lint` - Run ESLint

**Typography**

- TailwindCSS Typography plugin for blog content│   ├── hooks/                 # Custom React hooks

- Responsive font sizes

- Line height optimization for readability│   │   └── useCachedData.js## 🎨 Key Components



## 🔐 Authentication│   │



Custom JWT-based authentication system:│   └── utils/                 # Utility functions- **Header**: Navigation with responsive menu



**Features**│       ├── timeUtils.js- **Footer**: Links and newsletter signup

- Secure password hashing with bcrypt

- JWT tokens stored in HTTP-only cookies│       └── stringUtils.js- **BlogCard**: Preview card for blog posts

- Server-side session validation

- Protected API routes│- **BlogPost**: Full post with markdown support

- Automatic session refresh

├── public/                    # Static assets- **NewsletterForm**: Email subscription form

**API Endpoints**

- `POST /api/auth/signup` - User registration│   └── assets/

- `POST /api/auth/login` - User login

- `POST /api/auth/logout` - Session termination│       ├── icons/## 🔒 Security

- `GET /api/auth/session` - Get current user

│       └── images/

**Security**

- Passwords hashed with bcrypt (10 salt rounds)│- Firebase Security Rules configured

- JWT tokens with expiration

- Input validation on all forms└── config files               # Configuration- Environment variables for secrets

- XSS protection

- CSRF protection via HTTP-only cookies    ├── next.config.js         # Next.js config- Input validation on API routes



## 📱 Social Features    ├── tailwind.config.js     # Tailwind CSS config- CSRF protection via Next.js



**Engagement System**    ├── eslint.config.mjs      # ESLint rules

- Comments with user avatars

- One-click like functionality    └── package.json           # Dependencies## 📦 Deployment

- View tracking (automatic)

- Share buttons for multiple platforms```



**Sharing Platforms**Deploy to Vercel with one click or any Next.js compatible platform.

- X (Twitter) with hashtags

- Facebook## 🚀 Getting Started

- LinkedIn

- WhatsApp---

- Copy link with clipboard API

### Prerequisites

**Follow System**

- Follow/unfollow users- Node.js 18+ and npm/yarnBuilt with ❤️ using Next.js, Firebase, and Resend

- View follower counts

- Follow lists and modals- Firebase project (Firestore + Storage)



## 🗄️ Data Models- Vercel Blob storage account



**Post**- Resend account (for emails)```bash

```javascript

{npm run dev

  id: string,

  title: string,### Installation# or

  slug: string,

  content: string,          // Markdownyarn dev

  excerpt: string,

  category: string,1. **Clone the repository**# or

  author: {

    id: string,   ```bashpnpm dev

    name: string,

    email: string,   git clone https://github.com/darkomike/bloggie.git# or

    username: string,

    photoURL: string   cd bloggiebun dev

  },

  coverImage: string,   ``````

  tags: string[],

  published: boolean,

  createdAt: ISO string,

  updatedAt: ISO string2. **Install dependencies**Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

}

```   ```bash



**User**   npm installYou can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

```javascript

{   ```

  id: string,

  username: string,         // UniqueThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

  displayName: string,

  email: string,3. **Set up environment variables**

  photoURL: string,

  bio: string,   ## Learn More

  socialLinks: {

    twitter: string,   Create `.env.local` in the root directory:

    linkedin: string,

    github: string,   ```envTo learn more about Next.js, take a look at the following resources:

    website: string

  },   # Firebase Configuration

  createdAt: ISO string,

  updatedAt: ISO string   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

}

```   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



**Comment**   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

```javascript

{   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucketYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

  id: string,

  postId: string,   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

  user: {

    id: string,   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id## Deploy on Vercel

    name: string,

    email: string,   

    username: string

  },   # JWT Secret (generate a strong random string)The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

  text: string,

  createdAt: ISO string,   JWT_SECRET=your_super_secret_jwt_key_min_32_characters

  updatedAt: ISO string

}   Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

   # Vercel Blob Storage

## 🚀 Deployment   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

   

**Vercel (Recommended)**   # Resend Email Service

   RESEND_API_KEY=your_resend_api_key

1. Push your code to GitHub   ```

2. Import project in Vercel dashboard

3. Add environment variables4. **Configure Firebase**

4. Deploy automatically   

   Set up Firestore collections:

**Environment Variables Checklist**   - `posts` - Blog posts

- ✅ All 6 Firebase config variables   - `users` - User profiles

- ✅ JWT_SECRET   - `comments` - Post comments

- ✅ BLOB_READ_WRITE_TOKEN   - `likes` - Like records

- ✅ RESEND_API_KEY   - `views` - View tracking

   - `shares` - Share tracking

**Build Settings**   - `follows` - User follows

- Framework Preset: Next.js   - `newsletter` - Newsletter subscriptions

- Build Command: `npm run build`   - `contacts` - Contact form submissions

- Output Directory: `.next`

- Install Command: `npm install`5. **Run the development server**

   ```bash

## 🛠️ Development   npm run dev

   ```

**Available Scripts**

```bash6. **Open your browser**

npm run dev      # Start development server (port 3000)   ```

npm run build    # Build for production   http://localhost:3000

npm run start    # Start production server   ```

npm run lint     # Run ESLint

```## 🔧 Configuration



**Code Guidelines**### Firebase Security Rules

- Use functional components with hooks

- PropTypes for type checking```javascript

- Service layer for business logicrules_version = '2';

- Error handling with try-catchservice cloud.firestore {

- Loading states for async operations  match /databases/{database}/documents {

- Cache invalidation on data changes    // Users collection

    match /users/{userId} {

## 🐛 Common Issues & Solutions      allow read: if true;

      allow create: if request.auth != null;

**Comments not showing on dashboard**      allow update, delete: if request.auth.uid == userId;

- Verify comment data structure (use `comment.text` not `content`)    }

- Check `comment.user.name` or `comment.user.username`    

- View browser console for debug logs    // Posts collection

    match /posts/{postId} {

**User photo not updating after upload**      allow read: if true;

- Session API bypasses cache for fresh data      allow create: if request.auth != null;

- Check 2MB file size limit      allow update, delete: if request.auth.uid == resource.data.author.id;

- Verify Vercel Blob token    }

    

**Dark mode not persisting**    // Comments collection

- Check localStorage    match /comments/{commentId} {

- Verify ThemeProvider wrapper in layout      allow read: if true;

- Clear browser cache      allow create: if request.auth != null;

      allow update, delete: if request.auth.uid == resource.data.user.id;

**Build errors**    }

- Run `npm run lint` to check for issues    

- Verify all environment variables are set    // Likes, Views, Shares, Follows

- Check Next.js and React versions compatibility    match /{collection}/{docId} {

      allow read: if true;

## 📈 Performance      allow create: if request.auth != null;

      allow delete: if request.auth.uid == resource.data.userId;

**Optimization Strategies**    }

- Parallel data fetching with Promise.all  }

- Client-side caching with smart invalidation}

- Next.js Image optimization```

- Code splitting by route

- Lazy loading of heavy components### Tailwind Configuration

- Indexed Firestore queries

- Limited query results (pagination)Custom theme with dark mode support:

- **Colors**: Blue, purple, emerald, pink gradients

**Performance Metrics**- **Typography**: Prose styling for blog content

- First Contentful Paint: < 1.5s- **Responsive**: Mobile-first breakpoints

- Time to Interactive: < 3.0s- **Animations**: Smooth transitions and hover effects

- Lighthouse Score: 90+

## 📊 Dashboard Features

## 🔒 Security Best Practices

### Statistics Cards

- ✅ JWT tokens for authentication- **Total Posts** - All your published and draft posts

- ✅ bcrypt password hashing- **Total Views** - Aggregate view count with average per post

- ✅ Server-side input validation- **Comments** - Total discussions on your content

- ✅ XSS protection (sanitized inputs)- **Total Likes** - Engagement metrics

- ✅ CSRF protection (HTTP-only cookies)

- ✅ Environment variables for secrets### Analytics Charts

- ✅ Firebase security rules configured- **Post Performance** - Bar chart showing views per post

- ✅ 2MB file upload limit enforced- **Engagement Breakdown** - Pie chart (views, likes, comments)

- **Category Distribution** - Content categorization overview

## 📄 License

### Recent Activity

This project is private and proprietary.- **Recent Posts** - Last 5 articles with view counts and status

- **Recent Comments** - Latest 5 comments on your posts

## 👨‍💻 Author- **Liked Posts** - Posts you've liked with preview



**Michael Ofosu Darko**### Quick Actions

- GitHub: [@darkomike](https://github.com/darkomike)- Create new post

- Project: [Bloggie](https://github.com/darkomike/bloggie)- Edit profile

- Manage categories

## 🙏 Acknowledgments

## 🎨 UI/UX Features

Built with these amazing technologies:

- [Next.js](https://nextjs.org/) - React framework### Design System

- [Firebase](https://firebase.google.com/) - Backend platform- **Gradient Backgrounds** - Multi-stop vibrant gradients

- [Vercel](https://vercel.com/) - Hosting and blob storage- **Glassmorphism** - Backdrop blur effects

- [Resend](https://resend.com/) - Email service- **Micro-interactions** - Hover states, scale transforms, rotations

- [TailwindCSS](https://tailwindcss.com/) - CSS framework- **Loading States** - Skeleton loaders and spinners

- [React Icons](https://react-icons.github.io/react-icons/) - Icon library- **Empty States** - Helpful messages with CTAs

- [Recharts](https://recharts.org/) - Chart library- **Toast Notifications** - User feedback



---### Responsive Design

- Mobile: Single column, touch-optimized

**Built with ❤️ by Michael Ofosu Darko**- Tablet: 2-column grid layouts

- Desktop: 4-column grids, side-by-side content

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus indicators
- Semantic HTML

## 🔐 Authentication System

### Custom JWT Implementation
- **No Firebase Auth** - Custom server-side authentication
- **Secure Password Hashing** - bcrypt with salt rounds
- **HTTP-only Cookies** - JWT stored securely
- **Session Management** - Token refresh and validation
- **Protected Routes** - Middleware-based protection

### API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/session` - Get current user (with cache bypass)

## 📱 Social Features

### Engagement System
- **Comments** - Real-time threaded discussions
- **Likes** - One-click appreciation
- **Shares** - Cross-platform sharing (X, Facebook, LinkedIn, WhatsApp)
- **Views** - Automatic tracking
- **Follows** - User-to-user connections

### Sharing Capabilities
```javascript
// Share URLs generated for each platform
- X (Twitter): With hashtags and via mention
- Facebook: Direct post sharing
- LinkedIn: Professional sharing
- WhatsApp: Mobile-friendly sharing
- Copy Link: Clipboard with toast notification
```

## 🗃️ Data Models

### Post Model
```javascript
{
  id: string,
  title: string,
  slug: string,
  content: string (markdown),
  excerpt: string,
  category: string,
  author: { id, name, email, username, photoURL },
  coverImage: string,
  tags: string[],
  published: boolean,
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### User Model
```javascript
{
  id: string (uid),
  username: string (unique),
  displayName: string,
  email: string,
  photoURL: string,
  bio: string,
  socialLinks: {
    twitter: string,
    linkedin: string,
    github: string,
    website: string
  },
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### Comment Model
```javascript
{
  id: string,
  postId: string,
  user: { id, name, email, username },
  text: string,
  createdAt: ISO string,
  updatedAt: ISO string
}
```

## 🛠️ Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
```

### Code Style
- **ESLint** - Enforced code quality
- **Prettier** - Consistent formatting
- **PropTypes** - Runtime type checking
- **Comments** - JSDoc style documentation

### Best Practices
1. **Component Structure** - Functional components with hooks
2. **Service Layer** - Separate business logic from UI
3. **Error Handling** - Try-catch blocks with user feedback
4. **Loading States** - Show feedback during async operations
5. **Caching** - Minimize Firebase reads
6. **Security** - Validate inputs, sanitize data
7. **Performance** - Code splitting, lazy loading, memoization

## 📦 Dependencies

### Core
- **Next.js 15.0.4** - React framework
- **React 19.0.0** - UI library
- **React DOM 19.0.0** - DOM rendering

### Firebase
- **firebase 11.0.2** - Backend services
- **@vercel/blob 0.27.0** - File storage

### UI & Styling
- **tailwindcss 3.4.1** - Utility-first CSS
- **@tailwindcss/typography 0.5.16** - Prose styling
- **react-icons 5.4.0** - Icon library
- **recharts 2.15.0** - Charts and analytics

### Authentication & Security
- **bcrypt 5.1.1** - Password hashing
- **jsonwebtoken 9.0.2** - JWT tokens
- **js-cookie 3.0.5** - Cookie management

### Email
- **resend 4.0.1** - Email service

### Development
- **eslint 9** - Code linting
- **prop-types 15.8.1** - Type checking

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables Checklist
- [ ] Firebase credentials (7 variables)
- [ ] JWT_SECRET
- [ ] BLOB_READ_WRITE_TOKEN
- [ ] RESEND_API_KEY

### Build Optimization
- Static page generation where possible
- Image optimization with Next.js Image
- Code splitting by route
- Lazy loading of components

## 🐛 Troubleshooting

### Common Issues

**Issue: "doc.data is not a function"**
- Solution: Use transformComment function in comment-service.js

**Issue: User photo not updating**
- Solution: Clear cache, session API bypasses cache on auth

**Issue: Comments not showing**
- Solution: Check comment.text field (not content), verify user.name

**Issue: Large file uploads failing**
- Solution: 2MB limit enforced, check file size validation

**Issue: Dark mode not persisting**
- Solution: Check localStorage and ThemeProvider initialization

## 📈 Performance

### Optimization Strategies
1. **Parallel Data Fetching** - Promise.all for concurrent requests
2. **Cache Management** - Client-side caching with invalidation
3. **Image Optimization** - Next.js Image with Vercel Blob
4. **Code Splitting** - Dynamic imports for routes
5. **Database Queries** - Indexed fields, limited results
6. **Bundle Size** - Tree shaking, no unused dependencies

### Metrics
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s

## 🔒 Security

### Implemented Measures
- **JWT Tokens** - Secure authentication
- **Password Hashing** - bcrypt with salt
- **Input Validation** - Server-side validation
- **XSS Protection** - Sanitized user inputs
- **CSRF Protection** - HTTP-only cookies
- **Environment Variables** - Sensitive data protection
- **Firebase Rules** - Database access control

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**Michael Ofosu Darko**
- GitHub: [@darkomike](https://github.com/darkomike)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- Vercel for hosting and blob storage
- Resend for email services
- TailwindCSS for the utility-first approach
- React Icons for beautiful icons
- Recharts for data visualization

## 📞 Support

For issues, questions, or contributions:
1. Open an issue on GitHub
2. Review existing documentation
3. Check troubleshooting section

---

**Built with ❤️ using Next.js 15, React 19, and Firebase**
