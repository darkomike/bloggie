'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import CacheDebugPanel from '@/components/CacheDebugPanel';
import { blogService } from '@/lib/firebase/blog-service';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const categoryName = slug
    ? slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

  // Fetch posts on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await blogService.getAllPosts();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter posts by category
  const filteredPosts = posts.filter(
    post => post.category && post.category.toLowerCase().replace(/\s+/g, '-') === slug
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <CacheDebugPanel />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-white">
              {categoryName}
            </h1>
            <p className="text-lg sm:text-xl text-blue-100">
              Explore {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} in this category
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Link href="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
                Back to Categories
              </Link>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No posts found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                There are no posts in the {categoryName} category yet.
              </p>
              <Link href="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
                Back to Categories
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8">
              {filteredPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Link 
            href="/categories"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            ← Back to All Categories
          </Link>
        </div>
      </section>
    </div>
  );
}
