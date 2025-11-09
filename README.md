# Bloggie - Professional Blog Platform

A modern blogging platform with Next.js 15, React 19, and Firebase. Custom JWT auth, analytics, engagement tools, and dark mode.

## Features

- ✍️ **Blog Management** - Create, edit, publish with markdown
- 👤 **Custom Auth** - JWT-based (no Firebase Auth)
- 📊 **Analytics** - Dashboard with charts and metrics
- 💬 **Engagement** - Comments, likes, shares, views
- 👥 **Social** - Profiles, follows, photo uploads
- 🌓 **Dark Mode** - Theme persistence
- 📧 **Newsletter** - Resend integration
- 📱 **Responsive** - Mobile-first design

## Tech Stack

**Frontend:** Next.js 15, React 19, TailwindCSS  
**Backend:** Firebase, Vercel Blob, Resend  
**Auth:** JWT, bcrypt

## Quick Start

```bash
git clone https://github.com/darkomike/bloggie.git
cd bloggie
npm install
```

### Environment Variables (.env.local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
JWT_SECRET=
BLOB_READ_WRITE_TOKEN=
RESEND_API_KEY=
```

### Run

```bash
npm run dev    # Development at localhost:3000
npm run build  # Production build
npm start      # Production server
```

## Project Structure

```
src/
├── app/           # Pages & API routes
├── components/    # React components
├── lib/           # Services & utilities
├── models/        # Data models
└── utils/         # Helpers
```

## Firebase Collections

`posts`, `users`, `comments`, `likes`, `views`, `shares`, `follows`, `newsletter`, `contacts`

## Authentication

- Server-side JWT with HTTP-only cookies
- bcrypt password hashing
- Protected routes

API: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`

## Dashboard

- **Stats:** Posts, views, comments, likes
- **Charts:** Performance, engagement, categories
- **Activity:** Recent posts, comments, liked posts

## Data Models

**Post:** id, title, slug, content, category, author, published  
**User:** id, username, email, photoURL, bio  
**Comment:** id, postId, user, text

## Deployment

Vercel (recommended): Push to GitHub → Import to Vercel → Add env vars → Deploy

## Common Issues

- Comments: Check `comment.text` and `comment.user.name`
- Photos: Verify 2MB limit and Blob token
- Dark mode: Check ThemeProvider
- Build: Run `npm run lint`

## Security

- JWT authentication
- bcrypt hashing
- Input validation
- 2MB upload limit
- Firebase security rules

## Performance

- Parallel data fetching
- Client-side caching
- Image optimization
- Code splitting

## Scripts

```bash
npm run dev    # Development
npm run build  # Build
npm run lint   # Check code
```

## Author

**Michael Ofosu Darko**
GitHub: [@darkomike](https://github.com/darkomike)  
Portfolio: [michaelofosudarko.vercel.app](https://michaelofosudarko.vercel.app/)

## License

Private and proprietary

---

Built with ❤️ using Next.js, React, and Firebase

