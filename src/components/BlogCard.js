import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

export default function BlogCard({ post }) {
  return (
    <article className="group h-full flex flex-col overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
      {/* Cover Image */}
      <div className="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700"></div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 md:p-6">
        {/* Category and Date */}
        <div className="mb-2 sm:mb-3 md:mb-4 flex flex-col gap-2 sm:gap-3">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
            <Link
              href={`/category/${post.category?.toLowerCase()}`}
              className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              {post.category}
            </Link>
          </div>
          <time dateTime={post.publishedAt?.toISOString()} className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {format(post.publishedAt || new Date(), 'MMM d, yyyy')}
          </time>
        </div>

        {/* Title */}
        <h3 className="mb-2 sm:mb-3 text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="group/link hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="mb-4 sm:mb-5 md:mb-6 flex-1 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">{post.excerpt}</p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3 sm:pt-4 md:pt-5">
          {/* Author */}
          <div className="flex items-center gap-2 min-w-0">
            {post.author?.avatar && (
              <div className="relative h-7 w-7 sm:h-8 sm:w-8 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
              {post.author?.name}
            </span>
          </div>

          {/* Reading Time */}
          {post.readingTime && (
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2 flex items-center">
              <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readingTime} min
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
