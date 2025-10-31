import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

export default function BlogCard({ post }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {/* Category and Date */}
        <div className="mb-2 sm:mb-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Link
            href={`/category/${post.category}`}
            className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {post.category}
          </Link>
          <span>•</span>
          <time dateTime={post.publishedAt?.toISOString()}>
            {format(post.publishedAt || new Date(), 'MMM d, yyyy')}
          </time>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="mb-3 sm:mb-4 flex-1 text-sm sm:text-base text-gray-600 dark:text-gray-300 line-clamp-3">{post.excerpt}</p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3 sm:pt-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author?.avatar && (
              <div className="relative h-6 w-6 sm:h-8 sm:w-8 overflow-hidden rounded-full">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              {post.author?.name}
            </span>
          </div>

          {/* Reading Time */}
          {post.readingTime && (
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{post.readingTime} min</span>
          )}
        </div>
      </div>
    </article>
  );
}
