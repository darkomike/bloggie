'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { blogService } from '@/lib/firebase/blog-service';
import { commentService } from '@/lib/firebase/comment-service';
import { likeService } from '@/lib/firebase/like-service';
import { viewService } from '@/lib/firebase/view-service';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ResizableBox,
} from 'recharts';

// PostPerformanceChart Component
function PostPerformanceChart({ recentPosts, viewCounts }) {
  // keep full title in name and rely on custom tick renderer to display it nicely
  const chartData = recentPosts.map(post => ({
    name: post.title || 'Untitled',
    views: viewCounts[post.id] || 0,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <svg className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h3v7H3z" />
          <path d="M10 5h3v14h-3z" />
          <path d="M17 9h3v10h-3z" />
        </svg>
        Post Performance
      </h3>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.06)" />
          <XAxis dataKey="name" interval={0} tick={<CustomizedTick />} height={70} />
          <YAxis />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
            labelStyle={{ color: '#fff' }}
            formatter={(value) => [`${value}`, 'Views']}
          />
          <Bar dataKey="views" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Customized tick renderer to show multi-line titles and tooltip fallback
function CustomizedTick(props) {
  const { x, y, payload } = props;
  const title = payload.value || '';

  // split title into chunks of ~16 chars, prefer breaking on spaces
  const maxLen = 16;
  const words = title.split(' ');
  const lines = [];
  let current = '';
  words.forEach((w) => {
    if ((current + ' ' + w).trim().length <= maxLen) {
      current = (current + ' ' + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  });
  if (current) lines.push(current);

  // Limit lines to 3
  const displayLines = lines.slice(0, 3);

  return (
    <g transform={`translate(${x}, ${y})`}>
      <foreignObject x={-70} y={8} width={140} height={72}>
        <div className="text-xs text-center text-gray-600 dark:text-gray-400 leading-tight" title={title} style={{ fontSize: 12 }}>
          {displayLines.map((ln, idx) => (
            <div key={idx} style={{ lineHeight: '1.05em', maxHeight: '3.15em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}>
              {ln}
            </div>
          ))}
        </div>
      </foreignObject>
    </g>
  );
}

// EngagementChart Component
function EngagementChart({ stats }) {
  const engagementData = [
    { name: 'Views', value: stats.totalViews || 0, color: '#3b82f6' },
    { name: 'Likes', value: stats.totalLikes || 0, color: '#ec4899' },
    { name: 'Comments', value: stats.totalComments || 0, color: '#10b981' },
  ];

  const totalEngagement = engagementData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <svg className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Engagement Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={engagementData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {engagementData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.value}`}
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// CategoryDistributionChart Component
function CategoryDistributionChart({ recentPosts }) {
  const categoryData = {};
  recentPosts.forEach(post => {
    const category = post.category;
    if (category) {
      categoryData[category] = (categoryData[category] || 0) + 1;
    }
  });

  const chartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category,
    count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 text-center text-gray-500 dark:text-gray-400">
        <p>No category data available</p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <svg className="h-5 w-5 mr-3 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Posts by Category
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// StatsGrid Component
function StatsGrid({ stats }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-12">
      {/* ...same stats cards as before... */}
      <div className="bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-medium text-blue-100">Total Posts</h3>
          <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.totalPosts}</p>
      </div>
  <div className="bg-linear-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-medium text-purple-100">Total Views</h3>
          <svg className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.totalViews}</p>
      </div>
  <div className="bg-linear-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-medium text-green-100">Comments</h3>
          <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.totalComments}</p>
      </div>
  <div className="bg-linear-to-br from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-medium text-pink-100">Likes</h3>
          <svg className="h-6 w-6 sm:h-8 sm:w-8 text-pink-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.totalLikes}</p>
      </div>
    </div>
  );
}

// RecentPostsTable Component
function RecentPostsLoading() {
  return (
    <div className="p-6 sm:p-8 text-center">
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  );
}

function RecentPostsEmpty() {
  return (
    <div className="p-6 sm:p-12 text-center">
      <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No posts yet
      </h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
        Start writing your first blog post!
      </p>
      <Link
        href="/blog/new"
        className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
      >
        Create Post
      </Link>
    </div>
  );
}

function RecentPostsTableContent({ recentPosts, viewCounts }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
            <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {recentPosts.map((post) => (
            <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-4 sm:px-6 py-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{post.title}</div>
              </td>
              <td className="hidden sm:table-cell px-6 py-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {post.category}
                </span>
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {viewCounts?.[post.id] !== undefined ? viewCounts[post.id] : 0}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  post.published
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                }`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a
                  href={`/blog/${post.slug}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4"
                >
                  View
                </a>
                <a
                  href={`/blog/edit/${post.id}`}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                >
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

RecentPostsTableContent.propTypes = {
  recentPosts: PropTypes.array.isRequired,
  viewCounts: PropTypes.object,
};

function RecentPostsTable({ recentPosts, loading, viewCounts }) {
  if (loading) {
    return <RecentPostsLoading />;
  }
  if (recentPosts.length === 0) {
    return <RecentPostsEmpty />;
  }
  return <RecentPostsTableContent recentPosts={recentPosts} viewCounts={viewCounts} />;
}

RecentPostsTable.propTypes = {
  recentPosts: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  viewCounts: PropTypes.object,
};

StatsGrid.propTypes = {
  stats: PropTypes.shape({
    totalPosts: PropTypes.number.isRequired,
    totalViews: PropTypes.number.isRequired,
    totalComments: PropTypes.number.isRequired,
    totalLikes: PropTypes.number.isRequired,
  }).isRequired,
};

// QuickActions Component
function QuickActions() {
  return (
    <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        href="/blog/new"
        className="flex items-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group"
      >
        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            New Post
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Create a new blog post
          </p>
        </div>
      </Link>
      <Link
        href="/profile"
        className="flex items-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group"
      >
        <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Edit Profile
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Update your information
          </p>
        </div>
      </Link>
      <Link
        href="/blog"
        className="flex items-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg transition-all group"
      >
        <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            All Posts
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            View all your posts
          </p>
        </div>
      </Link>
    </div>
  );
}

// DashboardPage Component
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0,
    totalLikes: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [viewCounts, setViewCounts] = useState({});
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        // Get all posts by the current user (published and unpublished)
        const userPosts = await blogService.getPostsByAuthor(user.uid);
        const sortedPosts = userPosts
          .slice(0, 5);
        setRecentPosts(sortedPosts);

        // Fetch liked posts
        const userLikes = await likeService.getUserLikedPosts(user.uid);
        const likePostIds = userLikes.map(like => like.postId);
        
        // Fetch full post data for liked posts
        const likedPostsData = [];
        for (const postId of likePostIds) {
          const post = await blogService.getPostById(postId);
          if (post) {
            likedPostsData.push(post);
          }
        }
        setLikedPosts(likedPostsData);

        // Fetch individual view counts for recent posts
        const counts = {};
        await Promise.all(sortedPosts.map(async (post) => {
          const views = await viewService.getViewsByPost(post.id);
          counts[post.id] = views.length;
        }));
        setViewCounts(counts);

        // Aggregate stats from collections
        let totalViews = 0;
        let totalComments = 0;
        let totalLikes = 0;
        for (const post of userPosts) {
          const views = await viewService.getViewsByPost(post.id);
          totalViews += views.length;
          const comments = await commentService.getCommentsByPost(post.id);
          totalComments += comments.length;
          const likes = await likeService.getLikesByPost(post.id);
          totalLikes += likes.length;
        }
        setStats({
          totalPosts: userPosts.length,
          totalViews,
          totalComments,
          totalLikes,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to view your dashboard
          </h2>
          <a
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2">
                Dashboard
              </h1>
              <p className="text-base sm:text-lg text-blue-100">
                Welcome back, {user.displayName || user.email}!
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/blog/new"
                className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Post
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <StatsGrid stats={stats} />

        {/* Charts Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg className="h-7 w-7 mr-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6m16-6l-2-2m2 2v6m-8-10l2 2" />
            </svg>
            Analytics
          </h2>
          
          {/* Performance and Engagement Charts */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {recentPosts.length > 0 && (
              <PostPerformanceChart recentPosts={recentPosts} viewCounts={viewCounts} />
            )}
            <EngagementChart stats={stats} />
          </div>

          {/* Category Distribution Chart */}
          {recentPosts.length > 0 && (
            <CategoryDistributionChart recentPosts={recentPosts} />
          )}
        </div>

        {/* Recent Posts Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Recent Posts
            </h2>
          </div>
          <RecentPostsTable recentPosts={recentPosts} loading={loading} viewCounts={viewCounts} />
        </div>

        {/* Liked Posts Section */}
        <div className="mt-8 sm:mt-12 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="h-6 w-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.745l-.019-.01a1 1 0 01-1.39-1.165l2.694-14.796a1 1 0 011.971.242l-2.694 14.796a1 1 0 01-.962.933z" />
                <path d="M12.97 20.745l.019-.01a1 1 0 001.39-1.165l-2.694-14.796a1 1 0 00-1.971.242l2.694 14.796a1 1 0 00.962.933z" />
                <path d="M20.053 3.694a1.5 1.5 0 00-1.06-1.06A48.047 48.047 0 0012 2.25c-2.392 0-4.744.384-6.993 1.134a1.5 1.5 0 00-1.06 1.06c-.51 1.896-.722 3.846-.722 5.848v11.383A1.5 1.5 0 004.5 23h15a1.5 1.5 0 001.5-1.5V8.694c0-2.002-.212-3.952-.722-5.848z" />
              </svg>
              Liked Posts
            </h2>
          </div>
          <div className="overflow-x-auto">
            {likedPosts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>You have not liked any posts yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {likedPosts.map((post) => (
                  <div key={post.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link href={`/blog/${post.slug}`} className="block group">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {post.excerpt || post.content?.substring(0, 150)}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-300">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            by {post.authorName || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex-shrink-0 inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Read
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <QuickActions />
      </div>
    </div>
  );
}
