import Image from 'next/image';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { fullMarkdownComponents, remarkPlugins } from '@/lib/markdown/markdownComponents';

export default function BlogPost({ post }) {
  return (
    <article className="mx-auto max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        {/* Category */}
        <div className="mb-4">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-gray-600">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author?.avatar && (
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="font-medium text-gray-900">{post.author?.name}</span>
          </div>

          <span>•</span>

          {/* Date */}
          <time dateTime={post.publishedAt?.toISOString()}>
            {format(post.publishedAt || new Date(), 'MMMM d, yyyy')}
          </time>

          {/* Reading Time */}
          {post.readingTime && (
            <>
              <span>•</span>
              <span>{post.readingTime} min read</span>
            </>
          )}

          {/* Views */}
          {post.views && (
            <>
              <span>•</span>
              <span>{post.views.toLocaleString()} views</span>
            </>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative mb-8 h-96 w-full overflow-hidden rounded-lg">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          components={fullMarkdownComponents}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <a
                key={tag}
                href={`/tag/${tag}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                #{tag}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      {post.author?.bio && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-start gap-4">
            {post.author.avatar && (
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {post.author.name}
              </h3>
              <p className="text-gray-600">{post.author.bio}</p>

              {/* Social Links */}
              {post.author.social && (
                <div className="mt-3 flex gap-3">
                  {post.author.social.twitter && (
                    <a
                      href={post.author.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-500"
                    >
                      Twitter
                    </a>
                  )}
                  {post.author.social.github && (
                    <a
                      href={post.author.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      GitHub
                    </a>
                  )}
                  {post.author.social.linkedin && (
                    <a
                      href={post.author.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-700"
                    >
                      LinkedIn
                    </a>
                  )}
                  {post.author.social.website && (
                    <a
                      href={post.author.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
