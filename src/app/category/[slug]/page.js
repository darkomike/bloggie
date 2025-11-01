'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { blogService } from '@/lib/firebase/blog-service';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';

const CATEGORY_INFO = {
  technology: {
    name: 'Technology',
    description: 'Explore the latest in tech innovations, software development, AI, and digital transformation.',
    color: 'blue',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  design: {
    name: 'Design',
    description: 'Discover creative design principles, UI/UX best practices, and visual storytelling.',
    color: 'purple',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  business: {
    name: 'Business',
    description: 'Learn about entrepreneurship, marketing strategies, and business growth tactics.',
    color: 'green',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  lifestyle: {
    name: 'Lifestyle',
    description: 'Tips for better living, wellness, productivity, and personal development.',
    color: 'pink',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  science: {
    name: 'Science',
    description: 'Fascinating discoveries, research breakthroughs, and scientific insights.',
    color: 'indigo',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  travel: {
    name: 'Travel',
    description: 'Travel guides, destination tips, and adventures from around the world.',
    color: 'cyan',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  food: {
    name: 'Food',
    description: 'Delicious recipes, culinary techniques, and food culture exploration.',
    color: 'orange',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  health: {
    name: 'Health',
    description: 'Health tips, fitness advice, mental wellness, and medical insights.',
    color: 'red',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  education: {
    name: 'Education',
    description: 'Learning resources, teaching methods, and educational technology.',
    color: 'yellow',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  entertainment: {
    name: 'Entertainment',
    description: 'Movies, music, gaming, and pop culture news and reviews.',
    color: 'fuchsia',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug?.toLowerCase();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryInfo = CATEGORY_INFO[slug] || {
    name: slug?.charAt(0).toUpperCase() + slug?.slice(1),
    description: `Explore articles about ${slug}`,
    color: 'gray',
    icon: (
      <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  };

  const colorClasses = {
    blue: {
      bg: 'from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900',
      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      accent: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bg: 'from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-900',
      badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      icon: 'text-purple-600 dark:text-purple-400',
      accent: 'text-purple-600 dark:text-purple-400',
    },
    green: {
      bg: 'from-green-600 to-emerald-600 dark:from-green-800 dark:to-emerald-900',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      icon: 'text-green-600 dark:text-green-400',
      accent: 'text-green-600 dark:text-green-400',
    },
    pink: {
      bg: 'from-pink-600 to-rose-600 dark:from-pink-800 dark:to-rose-900',
      badge: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300',
      icon: 'text-pink-600 dark:text-pink-400',
      accent: 'text-pink-600 dark:text-pink-400',
    },
    indigo: {
      bg: 'from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900',
      badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
      icon: 'text-indigo-600 dark:text-indigo-400',
      accent: 'text-indigo-600 dark:text-indigo-400',
    },
    cyan: {
      bg: 'from-cyan-600 to-blue-600 dark:from-cyan-800 dark:to-blue-900',
      badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
      icon: 'text-cyan-600 dark:text-cyan-400',
      accent: 'text-cyan-600 dark:text-cyan-400',
    },
    orange: {
      bg: 'from-orange-600 to-red-600 dark:from-orange-800 dark:to-red-900',
      badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      icon: 'text-orange-600 dark:text-orange-400',
      accent: 'text-orange-600 dark:text-orange-400',
    },
    red: {
      bg: 'from-red-600 to-pink-600 dark:from-red-800 dark:to-pink-900',
      badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      accent: 'text-red-600 dark:text-red-400',
    },
    yellow: {
      bg: 'from-yellow-600 to-orange-600 dark:from-yellow-800 dark:to-orange-900',
      badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      icon: 'text-yellow-600 dark:text-yellow-400',
      accent: 'text-yellow-600 dark:text-yellow-400',
    },
    fuchsia: {
      bg: 'from-fuchsia-600 to-purple-600 dark:from-fuchsia-800 dark:to-purple-900',
      badge: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-300',
      icon: 'text-fuchsia-600 dark:text-fuchsia-400',
      accent: 'text-fuchsia-600 dark:text-fuchsia-400',
    },
    gray: {
      bg: 'from-gray-600 to-gray-800 dark:from-gray-700 dark:to-gray-900',
      badge: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300',
      icon: 'text-gray-600 dark:text-gray-400',
      accent: 'text-gray-600 dark:text-gray-400',
    },
  };

  const colors = colorClasses[categoryInfo.color] || colorClasses.gray;

  useEffect(() => {
    const fetchPosts = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        // Fetch all posts and filter by category (case-insensitive)
        const allPosts = await blogService.getAllPosts();
        const filteredPosts = allPosts.filter(post => post.category && post.category.toLowerCase() === categoryInfo.name.toLowerCase());
        // Sort by date
        const sortedPosts = filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);
      } catch (err) {
        console.error('Error fetching category posts:', err);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [slug, categoryInfo.name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className={`bg-linear-to-r ${colors.bg} py-16 sm:py-20 md:py-24 relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 sm:mb-8">
            <ol className="flex items-center space-x-2 text-sm text-white/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-white font-medium">{categoryInfo.name}</li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Icon */}
            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
              {categoryInfo.icon}
            </div>

            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4">
                {categoryInfo.name}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-3xl">
                {categoryInfo.description}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {(() => {
          if (error) {
            return (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            );
          }
          if (posts.length === 0) {
            return (
              <div className="text-center py-16 sm:py-20">
                <div className={`mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${colors.icon} mb-6`}>
                  <svg className="h-12 w-12 sm:h-14 sm:w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  No posts yet
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  We haven&apos;t published any articles in this category yet. Check back soon!
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Browse All Posts
                </Link>
              </div>
            );
          }
          return (
            <>
              {/* Stats Bar */}
              <div className="mb-8 sm:mb-12">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      Latest Articles
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Showing {posts.length} {posts.length === 1 ? 'article' : 'articles'}
                    </p>
                  </div>
                  <Link
                    href="/categories"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    All Categories
                  </Link>
                </div>
              </div>

              {/* Posts Grid */}
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
