import { blogService } from '@/lib/firebase/blog-service';
import BlogCard from '@/components/BlogCard';
import NewsletterForm from '@/components/NewsletterForm';
import HeroSection from '@/components/HeroSection';
import Link from 'next/link';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function getStats() {
  try {
    // Fetch all published posts
    const postsRef = collection(db, 'posts');
    const publishedQuery = query(postsRef, where('published', '==', true));
    const postsSnapshot = await getDocs(publishedQuery);
    
    const posts = postsSnapshot.docs.map(doc => doc.data());
    const totalPosts = posts.length;
    
    // Get unique categories
    const categoriesSet = new Set(posts.map(post => post.category).filter(Boolean));
    const totalCategories = categoriesSet.size;
    
    // Get unique authors
    const authorsSet = new Set(posts.map(post => post.authorId).filter(Boolean));
    const totalAuthors = authorsSet.size;
    
    // Calculate total views
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    return {
      totalPosts,
      totalCategories,
      totalAuthors,
      totalViews,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalPosts: 0,
      totalCategories: 10,
      totalAuthors: 0,
      totalViews: 0,
    };
  }
}

async function getCategoryStats() {
  try {
    const postsRef = collection(db, 'posts');
    const publishedQuery = query(postsRef, where('published', '==', true));
    const postsSnapshot = await getDocs(publishedQuery);
    
    const posts = postsSnapshot.docs.map(doc => doc.data());
    
    // Count posts per category
    const categoryCounts = {};
    for (const post of posts) {
      if (post.category) {
        categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
      }
    }
    
    return categoryCounts;
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return {};
  }
}

function formatNumber(num) {
  if (num === 0) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export default async function Home() {
  // Fetch latest blog posts
  let posts = [];
  try {
    posts = await blogService.getAllPosts(6);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }

  // Fetch real statistics
  const dbStats = await getStats();
  const categoryCounts = await getCategoryStats();

  const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                                process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const categories = [
    { 
      name: 'Technology', 
      count: categoryCounts['Technology'] || 0, 
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Design', 
      count: categoryCounts['Design'] || 0, 
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    { 
      name: 'Business', 
      count: categoryCounts['Business'] || 0, 
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Lifestyle', 
      count: categoryCounts['Lifestyle'] || 0, 
      color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  const stats = [
    { 
      label: 'Articles Published', 
      value: dbStats.totalPosts > 0 ? formatNumber(dbStats.totalPosts) : '0',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      label: 'Active Readers', 
      value: dbStats.totalViews > 0 ? formatNumber(dbStats.totalViews) : '0',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      label: 'Categories', 
      value: dbStats.totalCategories > 0 ? dbStats.totalCategories.toString() : '10',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      label: 'Authors', 
      value: dbStats.totalAuthors > 0 ? dbStats.totalAuthors.toString() : '0',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
  ];

  const testimonials = [
    {
      id: 'testimonial-1',
      quote: "This blog has completely transformed how I approach my work. The insights are invaluable.",
      author: "Sarah Johnson",
      role: "Product Designer",
      avatar: "SJ"
    },
    {
      id: 'testimonial-2',
      quote: "High-quality content that's actually useful. I look forward to every new article.",
      author: "Michael Chen",
      role: "Software Engineer",
      avatar: "MC"
    },
    {
      id: 'testimonial-3',
      quote: "The best tech blog I've found. Clear explanations and practical examples.",
      author: "Emily Rodriguez",
      role: "Startup Founder",
      avatar: "ER"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {!isFirebaseConfigured && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900/20 dark:border-yellow-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Firebase Not Configured
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                  <p>
                    To get started, create a <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env.local</code> file 
                    and add your Firebase credentials. See <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">README.md</code> for setup instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection stats={stats} />

      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Explore Topics</h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Browse articles by category
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/category/${category.name.toLowerCase()}`}
                className={`group rounded-xl p-4 sm:p-6 text-center transition-all hover:scale-105 hover:shadow-lg ${category.color}`}
              >
                <div className="mb-2 sm:mb-3 flex justify-center [&>svg]:h-8 [&>svg]:w-8 sm:[&>svg]:h-10 sm:[&>svg]:w-10">{category.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-1">{category.name}</h3>
                <p className="text-xs sm:text-sm opacity-75">{category.count} articles</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="mb-2 sm:mb-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Latest Articles</h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                Read our most recent blog posts
              </p>
            </div>
            {posts.length > 0 && (
              <Link
                href="/blog"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 self-start sm:self-auto"
              >
                View All
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg px-4">No posts available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">What Readers Say</h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Join our community of satisfied readers
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-xl bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-lg"
              >
                <div className="mb-4 flex items-center">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-sm sm:text-base">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{testimonial.author}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic">&ldquo;{testimonial.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-3 sm:mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Quality Content</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">Well-researched and professionally written articles across various topics</p>
            </div>

            <div className="text-center">
              <div className="mb-3 sm:mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Regular Updates</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">Fresh, relevant content published regularly to keep you informed</p>
            </div>

            <div className="text-center">
              <div className="mb-3 sm:mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Expert Authors</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">Learn from industry professionals and experienced practitioners</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 py-12 sm:py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold">Stay Updated</h2>
            <p className="text-base sm:text-lg text-blue-100 px-4">Subscribe to our newsletter and never miss a new article</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
