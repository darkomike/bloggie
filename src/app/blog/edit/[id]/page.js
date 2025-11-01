'use client';

import { blogService } from '@/lib/firebase/blog-service';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { uploadBlogCover, deleteBlob } from '@/lib/vercel-blob-service';
import { TimeUtil } from '@/utils/timeUtils';
import ReactMarkdown from 'react-markdown';
import { previewMarkdownComponents, remarkPlugins } from '@/lib/markdown/markdownComponents';

export default function EditBlogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params?.id;
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Technology',
    excerpt: '',
    content: '',
    tags: '',
    published: false,
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    'Technology',
    'Design',
    'Business',
    'Lifestyle',
    'Science',
    'Travel',
    'Food',
    'Health',
    'Education',
    'Entertainment',
    'Marketing',
    'Finance',
    'Career',
    'Productivity',
    'Wellness',
    'Art',
    'Music',
    'Sports',
    'Personal Development',
    'Entrepreneurship',
    'Environment',
    'Photography',
    'Writing',
    'Creativity',
  ];

  useEffect(() => {
    const fetchPost = async () => {
      if (!user || !postId) return;
      try {
        const post = await blogService.getPostById(postId);
        if (!post) {
          setError('Post not found');
          setLoading(false);
          return;
        }
        // Check if user is the author
        if (post.author?.uid !== user.uid) {
          setError('You are not authorized to edit this post');
          setLoading(false);
          return;
        }
        
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          category: post.category || 'Technology',
          excerpt: post.excerpt || '',
          content: post.content || '',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
          published: post.published || false,
        });
        if (post.coverImage) {
          setCoverImagePreview(post.coverImage);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [user, postId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !postId) {
      setError('You must be logged in to edit a post');
      return;
    }

    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let coverImageUrl = coverImagePreview;
      // Upload new cover image if changed
      if (coverImage) {
        setUploading(true);
        // Delete old image if exists
        if (coverImagePreview) {
          try {
            await deleteBlob(coverImagePreview);
          } catch (err) {
            console.warn('Could not delete old image:', err);
          }
        }
        coverImageUrl = await uploadBlogCover(coverImage);
        setUploading(false);
      }
      // Update blog post using blogService
      await blogService.updatePost(postId, {
        title: formData.title,
        slug: formData.slug,
        category: formData.category,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: coverImageUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        readingTime: TimeUtil.calculateReadingTime(formData.content),
        published: formData.published,
        updatedAt: new Date().toISOString(),
      });
      // Redirect to the blog post or dashboard
      if (formData.published) {
        router.push(`/blog/${formData.slug}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error updating blog post:', err);
      setError('Failed to update blog post. Please try again.');
      setSaving(false);
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to edit this post
          </h2>
          <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{error}</h2>
          <a href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Edit Post</h1>
          <p className="text-base sm:text-lg text-blue-100">Update your blog post</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className={`flex ${showPreview ? 'flex-col lg:flex-row lg:gap-8' : 'flex-col'}`}>
          <form onSubmit={handleSubmit} className={`space-y-6 ${showPreview ? 'lg:w-1/2' : 'w-full'}`}>
            {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image
            </label>
            {coverImagePreview ? (
              <div className="relative w-full h-64">
                <Image
                  src={coverImagePreview}
                  alt="Cover preview"
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage(null);
                    setCoverImagePreview('');
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 5MB)</p>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
              placeholder="Enter your post title..."
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL Slug
            </label>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">/blog/</span>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="auto-generated-from-title"
              />
            </div>
          </div>

          {/* Category and Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="react, javascript, web (comma separated)"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description of your post (optional)"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={16}
              value={formData.content}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Write your post content here... (Supports Markdown)"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Tip: You can use Markdown formatting
            </p>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Published (uncheck to save as draft)
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex-1 px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading image...' : saving ? 'Saving...' : 'Update Post'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Preview Section */}
        {showPreview && (
          <div className="w-full lg:w-1/2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-8 max-h-[calc(100vh-100px)] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Preview</h3>
              
              {/* Cover Image Preview */}
              {coverImagePreview && (
                <div className="mb-6 relative w-full h-40">
                  <Image
                    src={coverImagePreview}
                    alt="Cover preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Title and Category */}
              <div className="mb-4">
                {formData.category && (
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium mb-2">
                    {formData.category}
                  </span>
                )}
                {formData.title && (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {formData.title}
                  </h2>
                )}
                {formData.excerpt && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {formData.excerpt}
                  </p>
                )}
              </div>

              {/* Content Preview */}
              {formData.content && (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-blue-600 dark:prose-code:text-blue-400">
                  <ReactMarkdown
                    remarkPlugins={remarkPlugins}
                    components={previewMarkdownComponents}
                  >
                    {String(formData.content)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
