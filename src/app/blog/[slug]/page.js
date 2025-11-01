'use client';

import { useState, useEffect, useMemo } from 'react';
import { blogService } from '@/lib/firebase/blog-service';
import { viewService } from '@/lib/firebase/view-service';
import { likeService } from '@/lib/firebase/like-service';
import { commentService } from '@/lib/firebase/comment-service';
import { Comment } from '@/models/commentModel';
import { shareService } from '@/lib/firebase/share-service';
import { useAuth } from '@/components/AuthProvider';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PropTypes from 'prop-types';
import { TimeUtil } from '@/utils/timeUtils';
import { fullMarkdownComponents, remarkPlugins } from '@/lib/markdown/markdownComponents';

// Enhanced CodeBlock with copy functionality
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!inline && match) {
    return (
      <div className="relative group">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded bg-gray-700 hover:bg-gray-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Copy code"
        >
          {copied ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          className="rounded-lg"
          {...props}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className={`${className} bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm`} {...props}>
      {children}
    </code>
  );
};

CodeBlock.propTypes = {
  node: PropTypes.object,
  inline: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

// Custom Heading Component to add IDs for TOC scrolling
const CustomHeading = ({ level, children }) => {
  const text = typeof children === 'string' 
    ? children 
    : children?.toString?.() || '';
  
  // Clean text by removing markdown formatting
  const cleanText = text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold **
    .replace(/\*(.+?)\*/g, '$1')     // Remove italic *
    .replace(/`(.+?)`/g, '$1')       // Remove inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .trim();
  
  // Create ID from text
  const id = cleanText
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(?:^-)|(?:-$)/g, '');

  // Styling map for different heading levels
  const styleMap = {
    1: 'text-4xl font-bold mb-6 mt-12 text-gray-900 dark:text-white leading-tight scroll-mt-20',
    2: 'text-3xl font-bold mb-6 mt-14 pt-2 border-b border-gray-200 dark:border-gray-700 pb-3 text-gray-900 dark:text-white',
    3: 'text-2xl font-bold mb-4 mt-10 text-gray-900 dark:text-white',
    4: 'text-xl font-bold mb-3 mt-8 text-gray-900 dark:text-white',
    5: 'text-base font-bold mb-2 mt-4 text-gray-900 dark:text-white',
    6: 'text-sm font-bold mb-2 mt-4 text-gray-900 dark:text-white',
  };

  const HeadingTag = `h${level}`;
  
  return (
    <HeadingTag id={id} className={styleMap[level]}>
      {children}
    </HeadingTag>
  );
};

CustomHeading.propTypes = {
  level: PropTypes.number.isRequired,
  children: PropTypes.node,
};

// Reading Progress Bar Component
const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalHeight) * 100;
      setProgress(Math.min(100, Math.max(0, currentProgress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
      <div 
        className="h-full bg-linear-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Table of Contents Component
const TableOfContents = ({ content }) => {
  const [activeId, setActiveId] = useState('');

  const headings = useMemo(() => {
    // Only match lines that start with # (markdown headings)
    // NOT list items like "1. **Healthcare**" or "- item"
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    const extractedHeadings = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const levelMatch = content.substring(match.index).match(/^#+/);
      const level = levelMatch ? levelMatch[0].length : 1;
      const text = match[1].trim();
      
      // Create ID from text by removing markdown formatting and special chars
      const cleanText = text
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold **
        .replace(/\*(.+?)\*/g, '$1')     // Remove italic *
        .replace(/`(.+?)`/g, '$1')       // Remove inline code
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
        .trim();
      
      const id = cleanText
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/(?:^-)|(?:-$)/g, '');

      extractedHeadings.push({ level, text: cleanText, id });
    }

    return extractedHeadings;
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.getBoundingClientRect().top <= 100) {
          setActiveId(element.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden 2xl:block fixed left-4 top-24 w-72 max-h-[calc(100vh-150px)] overflow-y-auto bg-linear-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 z-40">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <h4 className="font-bold text-lg text-gray-900 dark:text-white">Contents</h4>
      </div>
      <nav>
        <ul className="space-y-2">
          {headings.map((heading) => {
            const isH2 = heading.level === 2;
            const isH3 = heading.level === 3;
            const marginStyle = isH2 ? 0 : isH3 ? 16 : (heading.level - 1) * 12;
            const isActive = activeId === heading.id;
            const activeClass = isActive
              ? isH2 
                ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-l-blue-600 dark:border-l-blue-400'
                : 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-l-blue-600 dark:border-l-blue-400'
              : `text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 border-l-transparent hover:border-l-blue-400 dark:hover:border-l-blue-500 ${isH2 ? 'hover:bg-gray-100 dark:hover:bg-gray-700/50' : ''}`;
            
            return (
              <li 
                key={heading.id}
                style={{ marginLeft: `${marginStyle}px` }}
                className="group"
              >
                <a
                  href={`#${heading.id}`}
                  className={`block text-sm py-2 px-3 rounded-lg transition-all duration-200 border-l-2 ${activeClass}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(heading.id)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }}
                >
                  <span className={isH2 ? 'font-semibold' : 'font-normal'}>{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {headings.length} {headings.length === 1 ? 'section' : 'sections'}
        </p>
      </div>
    </div>
  );
};

TableOfContents.propTypes = {
  content: PropTypes.string.isRequired,
};

// Calculate reading time
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

// Social Share Buttons
const SocialShareButtons = ({ post, shareLink }) => {
  const shareOptions = [
    {
      name: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareLink)}`,
      color: 'bg-blue-400 hover:bg-blue-500'
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
      color: 'bg-blue-800 hover:bg-blue-900'
    }
  ];

  return (
    <div className="flex gap-2">
      {shareOptions.map((option) => (
        <a
          key={option.name}
          href={option.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-full text-white transition-colors ${option.color}`}
          aria-label={`Share on ${option.name}`}
        >
          {option.icon}
        </a>
      ))}
    </div>
  );
};

SocialShareButtons.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }).isRequired,
  shareLink: PropTypes.string.isRequired,
};

// Floating Action Buttons
const FloatingActions = ({ userLiked, likesCount, onLike, onShare, onScrollToTop }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-40">
      <button
        onClick={onLike}
        className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 relative ${
          userLiked 
            ? 'bg-red-500 text-white' 
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
        }`}
        aria-label={userLiked ? 'Unlike this post' : 'Like this post'}
      >
        <svg className="h-6 w-6" fill={userLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {likesCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {likesCount}
          </span>
        )}
      </button>

      <button
        onClick={onShare}
        className="p-3 rounded-full shadow-lg bg-blue-500 text-white transition-all transform hover:scale-110"
        aria-label="Share this post"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {showScrollTop && (
        <button
          onClick={onScrollToTop}
          className="p-3 rounded-full shadow-lg bg-gray-600 text-white transition-all transform hover:scale-110"
          aria-label="Scroll to top"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

FloatingActions.propTypes = {
  userLiked: PropTypes.bool.isRequired,
  likesCount: PropTypes.number.isRequired,
  onLike: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onScrollToTop: PropTypes.func.isRequired,
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug;
  const { user } = useAuth?.() || {};
  const router = useRouter();

  const handleLike = async () => {
    if (!post?.id) return;
    if (!user?.uid) {
      router.push(`/login?redirect=/blog/${slug}`);
      return;
    }
    const userObj = {
      id: user.uid,
      name: user.displayName || 'Anonymous',
      email: user.email || null,
    };
    if (userLiked) {
      await likeService.removeLike(post.id, userObj.id);
      setUserLiked(false);
    } else {
      await likeService.addLike({
        postId: post.id,
        user: userObj,
        likedAt: new Date().toISOString(),
      });
      setUserLiked(true);
    }
    const likesData = await likeService.getLikesByPost(post.id);
    setLikesCount(likesData.length);
    setPost((prevPost) => ({
      ...prevPost,
      likesCount: likesData.length,
    }));
  };

  const handleComment = async (commentText) => {
    if (!post?.id || !commentText) return;
    const newComment = new Comment({
      postId: post.id,
      user: {
        id: user?.uid || null,
        name: user?.displayName || 'Anonymous',
        email: user?.email || null,
      },
      text: commentText,
      commentedAt: new Date().toISOString(),
    });
    const addedComment = await commentService.addComment(newComment.toFirestore());
    if (addedComment) {
      setComments((prevComments) => [addedComment, ...prevComments]);
      setCommentsCount((prevCount) => prevCount + 1);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;
    await commentService.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentsCount((prevCount) => Math.max(prevCount - 1, 0));
    setPost((prevPost) => ({
      ...prevPost,
      commentsCount: Math.max((prevPost.commentsCount || 1) - 1, 0),
    }));
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnhancedShare = () => {
    const origin = globalThis.window === undefined ? '' : globalThis.location.origin;
    const link = `${origin}/blog/${post.slug}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        // First try to get published post by slug
        let postData = await blogService.getPostBySlug(slug);
        
        // If not found and user is logged in, try to get unpublished posts by the user
        if (!postData && user?.uid) {
          // Get user's unpublished posts and find by slug
          const draftPosts = await blogService.getDraftPostsByAuthor(user.uid);
          postData = draftPosts.find(p => p.slug === slug);
        }
        
        if (!postData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setPost({
          ...postData,
          createdAt: postData.createdAt?.toISOString?.() || new Date().toISOString(),
          updatedAt: postData.updatedAt?.toISOString?.() || new Date().toISOString(),
        });
        fetchComments(postData.id);
        fetchEngagementCounts(postData.id);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async (postId) => {
      if (!postId) {
        console.error('fetchComments called with invalid postId: undefined');
        return;
      }
      setCommentsLoading(true);
      try {
        const commentsData = await commentService.getCommentsByPost(postId);
        setComments(commentsData.map((data) => new Comment(data)) || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    const fetchEngagementCounts = async (postId) => {
      if (!postId) return;

      try {
        const [likesData, sharesData, commentsData] = await Promise.all([
          likeService.getLikesByPost(postId),
          shareService.getSharesByPost(postId),
          commentService.getCommentsByPost(postId),
        ]);

        setPost((prevPost) => ({
          ...prevPost,
          likesCount: likesData.length,
          sharesCount: sharesData.length,
          commentsCount: commentsData.length,
        }));
        setLikesCount(likesData.length);
        setSharesCount(sharesData.length);
        setCommentsCount(commentsData.length);
      } catch (error) {
        console.error('Error fetching engagement counts:', error);
      }
    };

    fetchPost();
  }, [slug, user?.uid]);

  useEffect(() => {
    if (!post?.id) return;
    const registerView = async () => {
      await viewService.addView({
        postId: post.id,
        userId: user?.uid || null,
        isGuest: !user,
        viewedAt: new Date().toISOString(),
      });
    };
    registerView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  useEffect(() => {
    const checkUserLiked = async () => {
      if (!post?.id || !user?.uid) return;
      const liked = await likeService.hasUserLiked(post.id, user.uid);
      setUserLiked(liked);
    };
    checkUserLiked();
  }, [post?.id, user?.uid]);

  useEffect(() => {
    const fetchViewsCount = async (postId) => {
      if (!postId) return;
      const views = await viewService.getViewsByPost(postId);
      setViewsCount(views.length);
    };
    if (post?.id) {
      fetchViewsCount(post.id);
    }
  }, [post?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Blog post not found</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReadingProgressBar />
      {post?.content && <TableOfContents content={post.content} />}
      
      <FloatingActions
        userLiked={userLiked}
        likesCount={likesCount}
        onLike={handleLike}
        onShare={handleEnhancedShare}
        onScrollToTop={handleScrollToTop}
      />

      <article className="min-h-screen bg-white dark:bg-gray-900">
        {post.coverImage && (
          <div className="relative w-full h-48 sm:h-72 md:h-96 lg:h-[28rem] xl:h-[32rem]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12">
              <div className="text-white">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 md:mb-6">
                  <span className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 rounded-full text-xs sm:text-sm md:text-base font-bold transition-colors">
                    ✨ {post.category}
                  </span>
                  <span className="text-xs sm:text-sm md:text-base opacity-90 flex items-center">
                    <span className="mr-1">⏱️</span>
                    {calculateReadingTime(post.content)} min read
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-95 max-w-4xl line-clamp-2 sm:line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
          {!post.coverImage && (
            <div className="mb-8 sm:mb-10 md:mb-12">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-5">
                <span className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-blue-600 text-white rounded-full text-xs sm:text-sm md:text-base font-bold">
                  ✨ {post.category}
                </span>
                <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 flex items-center">
                  <span className="mr-1">⏱️</span>
                  {calculateReadingTime(post.content)} min read
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 md:mb-8 leading-relaxed max-w-3xl">
                  {post.excerpt}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 mb-8 sm:mb-10 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900 shrink-0">
                {post.author?.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author?.name || 'Author'}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <span className="text-xs sm:text-sm md:text-base font-bold text-white">
                    {post.author?.name?.[0] || post.author?.email?.[0] || 'A'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">
                  {post.author?.name || 'Anonymous'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Author</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>

              {viewsCount !== null && (
                <div className="flex items-center">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{viewsCount} {viewsCount === 1 ? 'view' : 'views'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-none">
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              components={{
                ...fullMarkdownComponents,
                h1: ({ children }) => <CustomHeading level={1}>{children}</CustomHeading>,
                h2: ({ children }) => <CustomHeading level={2}>{children}</CustomHeading>,
                h3: ({ children }) => <CustomHeading level={3}>{children}</CustomHeading>,
                h4: ({ children }) => <CustomHeading level={4}>{children}</CustomHeading>,
                h5: ({ children }) => <CustomHeading level={5}>{children}</CustomHeading>,
                h6: ({ children }) => <CustomHeading level={6}>{children}</CustomHeading>,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-10 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-8 sm:mb-10">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  className={`flex items-center gap-2 px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${userLiked ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  onClick={handleLike}
                  aria-label={userLiked ? 'Unlike this post' : 'Like this post'}
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill={userLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="hidden xs:inline">{likesCount || 0}</span>
                  <span className="inline xs:hidden">❤️</span>
                </button>
                <button
                  className="flex items-center gap-2 px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-semibold text-sm sm:text-base"
                  onClick={handleEnhancedShare}
                  aria-label="Share this post"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="hidden xs:inline">{sharesCount || 0}</span>
                  <span className="inline xs:hidden">📤</span>
                </button>
              </div>

              {/* Edit/New Post Button - Only visible when user is logged in */}
              {user && (
                <button
                  onClick={() => {
                    if (user?.uid === post?.author?.uid) {
                      router.push(`/blog/edit/${post.id}`);
                    } else {
                      router.push('/blog/new');
                    }
                  }}
                  className="flex items-center gap-2 px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg"
                  aria-label={user?.uid === post?.author?.uid ? 'Edit this post' : 'Create new post'}
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {user?.uid === post?.author?.uid ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                  <span className="hidden xs:inline">{user?.uid === post?.author?.uid ? 'Edit' : 'New'}</span>
                  <span className="inline xs:hidden">✏️</span>
                </button>
              )}
            </div>

            {showShareModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">📤 Share this post</h4>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6">
                  <SocialShareButtons post={post} shareLink={shareLink} />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="share-link" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Copy link:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="share-link"
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-2 sm:px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs sm:text-sm"
                    />
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Comments ({commentsCount || 0})</h3>            <div className="mb-8">
              <form
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                onSubmit={e => {
                  e.preventDefault();
                  const commentText = e.target.elements.comment.value.trim();
                  if (commentText) {
                    handleComment(commentText);
                    e.target.reset();
                  }
                }}
              >
                <label htmlFor="comment" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Share your thoughts
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  placeholder="Write a thoughtful comment... (Press Enter+Shift to add new line)"
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  autoComplete="off"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const form = e.target.form;
                      if (form) form.requestSubmit();
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Shift + Enter for new line
                  </p>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Submit comment"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Post Comment
                  </button>
                </div>
              </form>
            </div>

            {commentsLoading && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Loading comments...</p>
              </div>
            )}
            
            {!commentsLoading && comments?.length > 0 && (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white font-semibold text-sm">
                          {comment.user?.name?.[0] || comment.user?.email?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {comment.user?.name || 'Anonymous'}
                            </p>
                            {comment.user?.email && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {comment.user.email}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.createdAt && TimeUtil.formatRelativeTime(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      {user?.uid && comment.user?.id === user.uid && (
                        <button
                          className="ml-4 px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1"
                          onClick={() => handleDeleteComment(comment.id)}
                          aria-label="Delete comment"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-all">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {!commentsLoading && comments?.length === 0 && (
              <div className="text-center py-12">
                <svg className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2l-4 4z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No comments yet</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
