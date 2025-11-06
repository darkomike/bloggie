'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { blogService } from '@/lib/firebase/blog-service';
import { commentService } from '@/lib/firebase/comment-service';
import { likeService } from '@/lib/firebase/like-service';
import { viewService } from '@/lib/firebase/view-service';
import Link from 'next/link';
import CacheDebugPanel from '@/components/CacheDebugPanel';
import CacheStatsPanel from '@/components/CacheStatsPanel';
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
  const statCards = [
    {
      label: 'Total Posts',
      value: stats.totalPosts,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
      icon_bg: 'bg-blue-100/20',
      icon_color: 'text-blue-200'
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
      icon_bg: 'bg-purple-100/20',
      icon_color: 'text-purple-200'
    },
    {
      label: 'Comments',
      value: stats.totalComments,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      gradient: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700',
      icon_bg: 'bg-green-100/20',
      icon_color: 'text-green-200'
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      gradient: 'from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700',
      icon_bg: 'bg-pink-100/20',
      icon_color: 'text-pink-200'
    }
  ];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-12">
      {statCards.map((card, idx) => (
        <div key={idx} className={`bg-linear-to-br ${card.gradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white border border-white/10 hover:shadow-xl transition-all hover:scale-105 group`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-white/80 mb-3">{card.label}</p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-black group-hover:scale-110 transition-transform origin-left">
                {card.value}
              </p>
            </div>
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${card.icon_bg} flex items-center justify-center ${card.icon_color} group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
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
  const actions = [
    {
      title: 'Create New Post',
      description: 'Write and publish a new blog article',
      href: '/blog/new',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      gradient: 'from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20',
      border: 'border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-500',
      icon_bg: 'bg-blue-100 dark:bg-blue-900/30',
      icon_color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Edit Profile',
      description: 'Update your profile information',
      href: '/profile',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20',
      border: 'border-purple-200 dark:border-purple-800 hover:border-purple-500 dark:hover:border-purple-500',
      icon_bg: 'bg-purple-100 dark:bg-purple-900/30',
      icon_color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Browse All Posts',
      description: 'View all your published articles',
      href: '/blog',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      gradient: 'from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20',
      border: 'border-green-200 dark:border-green-800 hover:border-green-500 dark:hover:border-green-500',
      icon_bg: 'bg-green-100 dark:bg-green-900/30',
      icon_color: 'text-green-600 dark:text-green-400',
    },
  ];

  return (
    <div className="mt-12 sm:mt-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <svg className="h-7 w-7 mr-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Actions
      </h2>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            href={action.href}
            className={`group flex flex-col p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border ${action.border} ${action.gradient} transition-all hover:shadow-xl hover:scale-105`}
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${action.icon_bg} flex items-center justify-center ${action.icon_color} group-hover:scale-110 transition-transform mb-4`}>
              {action.icon}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
              {action.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-1">
              {action.description}
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 mt-4 group-hover:translate-x-1 transition-transform">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
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
        const sortedPosts = userPosts.slice(0, 5);
        setRecentPosts(sortedPosts);

        // Fetch liked posts in parallel
        const userLikes = await likeService.getUserLikedPosts(user.uid);
        const likePostIds = userLikes.map(like => like.postId);
        
        // Fetch full post data for liked posts in parallel
        const likedPostsData = await Promise.all(
          likePostIds.map(postId => blogService.getPostById(postId))
        );
        setLikedPosts(likedPostsData.filter(post => post));

        // Fetch individual view counts for recent posts (already parallelized with Promise.all)
        const counts = {};
        await Promise.all(sortedPosts.map(async (post) => {
          const views = await viewService.getViewsByPost(post.id);
          counts[post.id] = views.length;
        }));
        setViewCounts(counts);

        // Aggregate stats from collections - PARALLELIZE ALL QUERIES
        const statPromises = userPosts.map(async (post) => {
          const [views, comments, likes] = await Promise.all([
            viewService.getViewsByPost(post.id),
            commentService.getCommentsByPost(post.id),
            likeService.getLikesByPost(post.id),
          ]);
          return {
            views: views.length,
            comments: comments.length,
            likes: likes.length,
          };
        });

        const allStats = await Promise.all(statPromises);
        const totalViews = allStats.reduce((sum, s) => sum + s.views, 0);
        const totalComments = allStats.reduce((sum, s) => sum + s.comments, 0);
        const totalLikes = allStats.reduce((sum, s) => sum + s.likes, 0);

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
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <CacheDebugPanel />
      <CacheStatsPanel />
      {/* Enhanced Header with Background */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 py-12 sm:py-16 md:py-24">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between gap-6">
            <div className="flex-1">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-semibold text-white border border-white/20 mb-4">
                👋 Welcome Back
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3">
                Dashboard
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-md">
                Track your content performance and manage your blog posts in one place.
              </p>
              <div className="mt-4 text-base sm:text-lg text-white/80">
                Logged in as <span className="font-semibold text-white">{user.displayName || user.email}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:mt-0 mt-6">
              <Link
                href="/blog/new"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Post
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold border border-white/30 hover:bg-white/20 transition-all"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                View All Posts
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
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Recent Posts
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your latest 5 articles</p>
          </div>
          <RecentPostsTable recentPosts={recentPosts} loading={loading} viewCounts={viewCounts} />
        </div>

        {/* Liked Posts Section */}
        <div className="mt-8 sm:mt-12 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-pink-50 to-red-50/50 dark:from-pink-900/10 dark:to-red-900/10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="h-6 w-6 mr-3 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Liked Posts
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Posts you have liked</p>
          </div>
          <div className="overflow-x-auto">
            {likedPosts.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Liked Posts Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Explore the blog and like posts to see them here
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Explore Blog
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {likedPosts.map((post) => (
                  <div key={post.id} className="p-6 sm:p-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 border-pink-500 hover:border-pink-600">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link href={`/blog/${post.slug}`} className="block group">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {post.excerpt || post.content?.substring(0, 150)}
                        </p>
                        <div className="flex items-center gap-3 mt-4 flex-wrap">
                          <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-300">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            by {post.author.name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="shrink-0 inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-semibold group hover:translate-x-1"
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
