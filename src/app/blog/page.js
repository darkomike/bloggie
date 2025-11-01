'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { blogService } from '@/lib/firebase/blog-service';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Use blog service to fetch published posts
        const postsData = await blogService.getAllPosts();
        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Get unique categories from posts that have at least one article
  const categories = ['All', ...Array.from(new Set(posts.map(post => post.category).filter(Boolean))).sort()];
  const featuredPost = posts[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4">
                Our Blog
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto px-2">
                Insights, stories, and knowledge from industry experts
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-16 sm:py-20 md:py-24">
          <div className="text-center px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4">
                Our Blog
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto px-2">
                Insights, stories, and knowledge from industry experts
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-16 sm:py-20 md:py-24">
          <div className="text-center px-4">
            <p className="text-red-600 dark:text-red-400 mb-4 text-sm sm:text-base">Error loading posts: {error}</p>
            <button
              onClick={() => globalThis.location.reload()}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4">
                Our Blog
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto px-2">
                Insights, stories, and knowledge from industry experts
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No posts yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Be the first to write a blog post!</p>
            <Link
              href="/blog/new"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Post
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-4">
              Our Blog
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl mx-auto px-4">
              Insights, stories, and knowledge from industry experts
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-14 md:py-16 lg:py-20">
        {/* Category Filter */}
        <div className="mb-10 sm:mb-14 md:mb-16">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Filter by Category
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            {categories.map((category) => (
              <Link
                key={category}
                href={category === 'All' ? '/blog' : `/category/${category.toLowerCase()}`}
                className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:shadow-md"
              >
                {category === 'All' ? 'All Categories' : category}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 flex items-center">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-5.087a1 1 0 00-1-1H10a1 1 0 00-1 1v5.087c0 1.439 1.555 2.342 2.805 1.629z" />
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
              </svg>
              Featured Article
            </h2>
            <Link href={`/blog/${featuredPost.slug}`}>
              <div 
                className="group overflow-hidden rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl hover:shadow-xl transition-shadow duration-300"
                style={{
                  backgroundImage: featuredPost.coverImage ? `url(${featuredPost.coverImage})` : 'linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="relative w-full aspect-video sm:aspect-21/9 flex flex-col justify-end bg-linear-to-t from-gray-900 via-gray-900/40 to-transparent p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="mb-3 sm:mb-4 md:mb-5">
                    <div className="flex flex-wrap gap-2">
                      {featuredPost.category && (
                        <span className="inline-block rounded-full bg-yellow-400 dark:bg-yellow-500 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-gray-900">
                          ★ {featuredPost.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 md:mb-4 group-hover:text-blue-200 transition-colors line-clamp-3 sm:line-clamp-2">
                    {featuredPost.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-100 mb-3 sm:mb-4 line-clamp-1 sm:line-clamp-2">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-blue-100">
                    <span className="font-medium">{featuredPost.author?.name}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center">
                      <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {featuredPost.readingTime} min read
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* All Posts Grid */}
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-12 flex items-center">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
            </svg>
            Latest Articles
          </h2>
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:gap-7 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24 md:py-32 px-4">
              <div className="text-gray-300 dark:text-gray-600 mb-5 sm:mb-6 flex justify-center">
                <svg className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                No posts found yet
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                Our writers are crafting amazing content. Check back soon for fresh insights and stories! 🚀
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {posts.length > 9 && (
          <div className="mt-16 sm:mt-20 md:mt-24 flex justify-center">
            <nav className="flex items-center gap-1 sm:gap-2">
              <button className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                ← Previous
              </button>
              <button className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-xs sm:text-sm font-medium text-white shadow-md">1</button>
              <button className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">2</button>
              <button className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">3</button>
              <button className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Next →
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
