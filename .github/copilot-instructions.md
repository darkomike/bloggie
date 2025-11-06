# Professional Blog Web App - Copilot Instructions

## Project Overview
This is a professional blog web application built with Next.js 15, Firebase, and Resend.

## Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Storage) + Custom Server-Side Auth
- **Email**: Resend
- **Styling**: TailwindCSS with Typography plugin

## Architecture Principles
- Clean separation of concerns
- Service-based architecture for external integrations
- Server and client components appropriately used
- Environment variables for sensitive data
- JavaScript throughout (no TypeScript)

## Project Structure
```
src/
├── app/           # Next.js App Router pages & API routes
├── components/    # Reusable React components
└── lib/           # Services, utilities, and configurations
    ├── firebase/  # Firebase config and services
    ├── resend/    # Email service
    └── utils.js   # Helper utilities
```

## Code Style Guidelines
- Use functional components with hooks
- Follow ESLint configuration
- Use arrow functions for consistency
- Keep components small and focused
- Use TailwindCSS utility classes
- Proper error handling in async functions

## Development Workflow
1. Never commit sensitive data (.env files)
2. Test Firebase security rules before deployment
3. Validate user inputs on both client and server
4. Use environment variables for all credentials
5. Follow the existing folder structure

## Setup Complete ✅
All core features have been implemented:
- ✅ Next.js 15 with App Router
- ✅ Firebase integration (Firestore, Storage) - NO Firebase Auth
- ✅ Custom server-side JWT authentication system
- ✅ Resend email service
- ✅ Core components (Header, Footer, BlogCard, BlogPost, NewsletterForm)
- ✅ API routes (Newsletter, Contact, Auth)
- ✅ Utility functions following SOLID principles
- ✅ Clean architecture with base service pattern
- ✅ React Context API for state management (no external dependencies)
- ✅ Comprehensive documentation

## Next Steps for Development
1. Configure Firebase project and add credentials to .env.local
2. Add blog posts to Firestore database
3. Customize branding and colors
4. Create additional pages (About, Contact, etc.)
5. Implement search functionality
6. Add authentication for admin panel
7. Deploy to production
