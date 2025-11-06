# Bloggie - Professional Blog Platform

A modern, clean, and professional blog web application built with Next.js 15, Firebase, and Resend for email services.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 15 (App Router), React 19, and JavaScript
- **Firebase Backend**: Firestore for database (NO Firebase Auth or Storage)
- **Custom Authentication**: Server-side JWT-based authentication system
- **Email Integration**: Resend for newsletter and contact form emails
- **Responsive Design**: Mobile-first design with TailwindCSS
- **SEO Optimized**: Server-side rendering for better SEO
- **Clean Architecture**: Well-organized code structure following SOLID principles

## 📁 Project Structure

```
bloggie/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── contact/       # Contact form API
│   │   │   └── newsletter/    # Newsletter subscription API
│   │   ├── layout.js          # Root layout
│   │   ├── page.js            # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── Header.js          # Navigation header
│   │   ├── Footer.js          # Footer component
│   │   ├── BlogCard.js        # Blog post card
│   │   ├── BlogPost.js        # Full blog post display
│   │   └── NewsletterForm.js  # Newsletter subscription form
│   └── lib/                   # Library code and services
│       ├── firebase/          # Firebase configuration and services
│       │   ├── config.js      # Firebase initialization
│       │   └── blog-service.js # Blog CRUD operations
│       └── resend/            # Email service
│           └── email-service.js # Email sending functions
├── public/                    # Static files
├── .env.example              # Environment variables template
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind CSS configuration
├── next.config.mjs           # Next.js configuration
└── README.md                 # This file
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: TailwindCSS with Typography plugin
- **Database**: Firebase Firestore
- **Authentication**: Custom Server-Side JWT Authentication
- **Storage**: Vercel Blob
- **Email**: Resend
- **Markdown**: React Markdown with Syntax Highlighting
- **Date Handling**: date-fns
- **State Management**: React Context API (built-in)

## 📋 Prerequisites

- Node.js 18+ and npm
- A Firebase account
- A Resend account (for email services)

## ⚙️ Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database

### 3. Resend Setup

1. Sign up at [Resend](https://resend.com/)
2. Get your API key from the dashboard

### 4. Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Update with your credentials (see .env.example for details)

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Key Components

- **Header**: Navigation with responsive menu
- **Footer**: Links and newsletter signup
- **BlogCard**: Preview card for blog posts
- **BlogPost**: Full post with markdown support
- **NewsletterForm**: Email subscription form

## 🔒 Security

- Firebase Security Rules configured
- Environment variables for secrets
- Input validation on API routes
- CSRF protection via Next.js

## 📦 Deployment

Deploy to Vercel with one click or any Next.js compatible platform.

---

Built with ❤️ using Next.js, Firebase, and Resend


```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
