# 📝 Bloggie - Professional Blog Platform# Bloggie - Professional Blog Platform



A modern, full-featured blog web application built with Next.js 15, Firebase, and cutting-edge React 19. Features custom JWT authentication, real-time engagement tracking, and a beautiful responsive UI with dark mode support.A modern, clean, and professional blog web application built with Next.js 15, Firebase, and Resend for email services.



![Next.js](https://img.shields.io/badge/Next.js-15.0.4-black)## 🚀 Features

![React](https://img.shields.io/badge/React-19.0.0-blue)

![Firebase](https://img.shields.io/badge/Firebase-11.0.2-orange)- **Modern Tech Stack**: Built with Next.js 15 (App Router), React 19, and JavaScript

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38bdf8)- **Firebase Backend**: Firestore for database (NO Firebase Auth or Storage)

- **Custom Authentication**: Server-side JWT-based authentication system

## 🌟 Features- **Email Integration**: Resend for newsletter and contact form emails

- **Responsive Design**: Mobile-first design with TailwindCSS

### Core Functionality- **SEO Optimized**: Server-side rendering for better SEO

- ✍️ **Rich Text Blogging** - Create, edit, and publish blog posts with markdown support- **Clean Architecture**: Well-organized code structure following SOLID principles

- 👤 **Custom Authentication** - Server-side JWT authentication (no Firebase Auth)

- 📊 **Analytics Dashboard** - Comprehensive insights with charts and statistics## 📁 Project Structure

- 💬 **Comment System** - Real-time commenting with user engagement

- ❤️ **Like & Share** - Social engagement features with tracking```

- 👁️ **View Tracking** - Monitor post views and reader engagementbloggie/

- 🔍 **Search & Categories** - Easy content discovery├── src/

- 📧 **Newsletter Integration** - Email subscriptions via Resend│   ├── app/                    # Next.js App Router pages

- 🌓 **Dark Mode** - Beautiful theme toggle with system preference detection│   │   ├── api/               # API routes

- 📱 **Fully Responsive** - Mobile-first design│   │   │   ├── contact/       # Contact form API

│   │   │   └── newsletter/    # Newsletter subscription API

### User Features│   │   ├── layout.js          # Root layout

- **User Profiles** - Customizable profiles with photo uploads (Vercel Blob storage)│   │   ├── page.js            # Home page

- **Follow System** - Follow other users and build your network│   │   └── globals.css        # Global styles

- **Personal Dashboard** - Track your content performance│   ├── components/            # React components

- **Social Sharing** - Share posts on X (Twitter), Facebook, LinkedIn, WhatsApp│   │   ├── Header.js          # Navigation header

- **Recent Activity** - View liked posts and comments on your content│   │   ├── Footer.js          # Footer component

│   │   ├── BlogCard.js        # Blog post card

### Technical Highlights│   │   ├── BlogPost.js        # Full blog post display

- **Server-Side Rendering** - Fast page loads and SEO optimization│   │   └── NewsletterForm.js  # Newsletter subscription form

- **React Context API** - Clean state management (no external dependencies)│   └── lib/                   # Library code and services

- **Service-Based Architecture** - Modular, maintainable codebase│       ├── firebase/          # Firebase configuration and services

- **SOLID Principles** - Clean code architecture│       │   ├── config.js      # Firebase initialization

- **Cache Management** - Optimized data fetching with invalidation│       │   └── blog-service.js # Blog CRUD operations

- **Type Safety** - PropTypes validation throughout│       └── resend/            # Email service

- **Security** - JWT tokens, environment variables, input validation│           └── email-service.js # Email sending functions

├── public/                    # Static files

## 🏗️ Architecture├── .env.example              # Environment variables template

├── package.json              # Dependencies

### Project Structure├── tailwind.config.js        # Tailwind CSS configuration

```├── next.config.mjs           # Next.js configuration

bloggie/└── README.md                 # This file

├── src/```

│   ├── app/                    # Next.js App Router

│   │   ├── api/               # API routes## 🛠️ Tech Stack

│   │   │   ├── auth/          # Authentication endpoints

│   │   │   ├── contact/       # Contact form handler- **Framework**: Next.js 15 (App Router)

│   │   │   ├── newsletter/    # Newsletter subscription- **Language**: JavaScript (ES6+)

│   │   │   └── upload/        # File upload (Vercel Blob)- **Styling**: TailwindCSS with Typography plugin

│   │   ├── blog/              # Blog pages- **Database**: Firebase Firestore

│   │   │   ├── [slug]/        # Individual post pages- **Authentication**: Custom Server-Side JWT Authentication

│   │   │   ├── edit/          # Post editor- **Storage**: Vercel Blob

│   │   │   └── new/           # Create new post- **Email**: Resend

│   │   ├── dashboard/         # User dashboard- **Markdown**: React Markdown with Syntax Highlighting

│   │   ├── profile/           # User profile- **Date Handling**: date-fns

│   │   ├── category/          # Category pages- **State Management**: React Context API (built-in)

│   │   ├── login/             # Login page

│   │   ├── signup/            # Registration page## 📋 Prerequisites

│   │   └── layout.js          # Root layout

│   │- Node.js 18+ and npm

│   ├── components/            # React components- A Firebase account

│   │   ├── AuthProvider.js   # Authentication context- A Resend account (for email services)

│   │   ├── ThemeProvider.js  # Theme management

│   │   ├── Header.js          # Navigation header## ⚙️ Setup Instructions

│   │   ├── Footer.js          # Site footer

│   │   ├── BlogCard.js        # Blog post preview### 1. Install dependencies

│   │   ├── BlogPost.js        # Full post display

│   │   ├── NewsletterForm.js  # Newsletter subscription```bash

│   │   └── ...                # Other componentsnpm install

│   │```

│   ├── lib/                   # Core libraries

│   │   ├── firebase/          # Firebase services### 2. Firebase Setup

│   │   │   ├── config.js      # Firebase configuration

│   │   │   ├── blog-service.js1. Go to [Firebase Console](https://console.firebase.google.com/)

│   │   │   ├── comment-service.js2. Create a new project

│   │   │   ├── like-service.js3. Enable Firestore Database

│   │   │   ├── view-service.js

│   │   │   ├── share-service.js### 3. Resend Setup

│   │   │   ├── follow-service.js

│   │   │   ├── user-service.js1. Sign up at [Resend](https://resend.com/)

│   │   │   └── newsletter-service.js2. Get your API key from the dashboard

│   │   │

│   │   ├── auth/              # Authentication### 4. Environment Variables

│   │   │   ├── jwtUtils.js    # JWT token handling

│   │   │   ├── passwordUtils.js # Password hashing (bcrypt)Create a `.env.local` file:

│   │   │   └── authConfig.js  # Auth configuration

│   │   │```bash

│   │   ├── cache/             # Cache managementcp .env.example .env.local

│   │   │   ├── cacheManager.js```

│   │   │   ├── cacheInvalidation.js

│   │   │   └── cacheConfig.jsUpdate with your credentials (see .env.example for details)

│   │   │

│   │   ├── resend/            # Email service### 5. Run the development server

│   │   │   └── ...

│   │   │```bash

│   │   └── vercel-blob-service.js # Image uploadsnpm run dev

│   │```

│   ├── models/                # Data models

│   │   ├── postModel.jsOpen [http://localhost:3000](http://localhost:3000)

│   │   ├── commentModel.js

│   │   ├── userModel.js## 📝 Available Scripts

│   │   ├── likeModel.js

│   │   ├── viewModel.js- `npm run dev` - Start development server with Turbopack

│   │   ├── shareModel.js- `npm run build` - Build for production

│   │   └── followModel.js- `npm start` - Start production server

│   │- `npm run lint` - Run ESLint

│   ├── hooks/                 # Custom React hooks

│   │   └── useCachedData.js## 🎨 Key Components

│   │

│   └── utils/                 # Utility functions- **Header**: Navigation with responsive menu

│       ├── timeUtils.js- **Footer**: Links and newsletter signup

│       └── stringUtils.js- **BlogCard**: Preview card for blog posts

│- **BlogPost**: Full post with markdown support

├── public/                    # Static assets- **NewsletterForm**: Email subscription form

│   └── assets/

│       ├── icons/## 🔒 Security

│       └── images/

│- Firebase Security Rules configured

└── config files               # Configuration- Environment variables for secrets

    ├── next.config.js         # Next.js config- Input validation on API routes

    ├── tailwind.config.js     # Tailwind CSS config- CSRF protection via Next.js

    ├── eslint.config.mjs      # ESLint rules

    └── package.json           # Dependencies## 📦 Deployment

```

Deploy to Vercel with one click or any Next.js compatible platform.

## 🚀 Getting Started

---

### Prerequisites

- Node.js 18+ and npm/yarnBuilt with ❤️ using Next.js, Firebase, and Resend

- Firebase project (Firestore + Storage)

- Vercel Blob storage account

- Resend account (for emails)```bash

npm run dev

### Installation# or

yarn dev

1. **Clone the repository**# or

   ```bashpnpm dev

   git clone https://github.com/darkomike/bloggie.git# or

   cd bloggiebun dev

   ``````



2. **Install dependencies**Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

   ```bash

   npm installYou can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

   ```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

3. **Set up environment variables**

   ## Learn More

   Create `.env.local` in the root directory:

   ```envTo learn more about Next.js, take a look at the following resources:

   # Firebase Configuration

   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucketYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id## Deploy on Vercel

   

   # JWT Secret (generate a strong random string)The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

   JWT_SECRET=your_super_secret_jwt_key_min_32_characters

   Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   
   # Resend Email Service
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Configure Firebase**
   
   Set up Firestore collections:
   - `posts` - Blog posts
   - `users` - User profiles
   - `comments` - Post comments
   - `likes` - Like records
   - `views` - View tracking
   - `shares` - Share tracking
   - `follows` - User follows
   - `newsletter` - Newsletter subscriptions
   - `contacts` - Contact form submissions

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == userId;
    }
    
    // Posts collection
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.author.id;
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.user.id;
    }
    
    // Likes, Views, Shares, Follows
    match /{collection}/{docId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### Tailwind Configuration

Custom theme with dark mode support:
- **Colors**: Blue, purple, emerald, pink gradients
- **Typography**: Prose styling for blog content
- **Responsive**: Mobile-first breakpoints
- **Animations**: Smooth transitions and hover effects

## 📊 Dashboard Features

### Statistics Cards
- **Total Posts** - All your published and draft posts
- **Total Views** - Aggregate view count with average per post
- **Comments** - Total discussions on your content
- **Total Likes** - Engagement metrics

### Analytics Charts
- **Post Performance** - Bar chart showing views per post
- **Engagement Breakdown** - Pie chart (views, likes, comments)
- **Category Distribution** - Content categorization overview

### Recent Activity
- **Recent Posts** - Last 5 articles with view counts and status
- **Recent Comments** - Latest 5 comments on your posts
- **Liked Posts** - Posts you've liked with preview

### Quick Actions
- Create new post
- Edit profile
- Manage categories

## 🎨 UI/UX Features

### Design System
- **Gradient Backgrounds** - Multi-stop vibrant gradients
- **Glassmorphism** - Backdrop blur effects
- **Micro-interactions** - Hover states, scale transforms, rotations
- **Loading States** - Skeleton loaders and spinners
- **Empty States** - Helpful messages with CTAs
- **Toast Notifications** - User feedback

### Responsive Design
- Mobile: Single column, touch-optimized
- Tablet: 2-column grid layouts
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

**Darko Mike**
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
