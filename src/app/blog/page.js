import { blogService } from '@/lib/firebase/blog-service';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';

export const metadata = {
  title: 'Blog - Bloggie',
  description: 'Explore our collection of insightful articles and stories',
};

export default async function BlogPage() {
  let posts = [];
  try {
    posts = await blogService.getAllPosts();
  } catch (error) {
    console.error('Error fetching posts:', error);
  }

  const categories = ['All', 'Technology', 'Design', 'Business', 'Lifestyle'];
  const featuredPost = posts[0];

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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Filter */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {categories.map((category) => (
              <Link
                key={category}
                href={category === 'All' ? '/blog' : `/category/${category.toLowerCase()}`}
                className="px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Featured Article
            </h2>
            <Link href={`/blog/${featuredPost.slug}`}>
              <div className="group relative overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
                <div className="aspect-[21/9] bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12">
                  <div className="mb-3 sm:mb-4">
                    <span className="inline-block rounded-full bg-blue-500 px-3 sm:px-4 py-1 text-xs sm:text-sm font-semibold text-white">
                      {featuredPost.category}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 group-hover:text-blue-300 transition-colors">
                    {featuredPost.title}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-4 line-clamp-2">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center text-sm sm:text-base text-gray-400">
                    <span>{featuredPost.author?.name}</span>
                    <span className="mx-2">•</span>
                    <span>{featuredPost.readingTime} min read</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* All Posts Grid */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
            Latest Articles
          </h2>
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-20">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Check back soon for new content!</p>
            </div>
          )}
        </div>

        {/* Pagination (placeholder) */}
        {posts.length > 9 && (
          <div className="mt-12 sm:mt-16 flex justify-center">
            <nav className="flex items-center gap-2">
              <button className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Previous
              </button>
              <button className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-sm sm:text-base text-white">1</button>
              <button className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                2
              </button>
              <button className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                3
              </button>
              <button className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
