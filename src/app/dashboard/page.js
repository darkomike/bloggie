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
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h3v7H3z" />
              <path d="M10 5h3v14h-3z" />
              <path d="M17 9h3v10h-3z" />
            </svg>
          </div>
          Post Performance
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          📊 Views Analysis
        </div>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
          <XAxis 
            dataKey="name" 
            interval={0} 
            tick={<CustomizedTick />} 
            height={70}
            stroke="#9ca3af"
          />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none', 
              borderRadius: '12px', 
              color: '#fff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
            }}
            labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
            formatter={(value) => [`${value.toLocaleString()}`, 'Views']}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar 
            dataKey="views" 
            fill="url(#barGradient)" 
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          />
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
    { name: 'Views', value: stats.totalViews || 0, color: '#3b82f6', gradient: 'url(#blueGradient)' },
    { name: 'Likes', value: stats.totalLikes || 0, color: '#ec4899', gradient: 'url(#pinkGradient)' },
    { name: 'Comments', value: stats.totalComments || 0, color: '#10b981', gradient: 'url(#greenGradient)' },
  ];

  const totalEngagement = engagementData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-br from-blue-500 to-emerald-500 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header with Gradient Badge */}
      <div className="relative mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div className="ml-3 sm:ml-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Engagement Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              📈 Total: {totalEngagement.toLocaleString()} interactions
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="pinkGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <Pie
            data={engagementData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={90}
            innerRadius={45}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={2}
            stroke="#fff"
          >
            {engagementData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.gradient} className="hover:opacity-80 transition-opacity cursor-pointer" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none', 
              borderRadius: '12px', 
              color: '#fff',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              padding: '12px 16px'
            }}
            formatter={(value, name) => [
              <span key={name} className="font-bold">{value.toLocaleString()}</span>,
              <span key={`${name}-label`} className="text-gray-300">{name}</span>
            ]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={48}
            formatter={(value, entry) => (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {entry.payload.name}: <span className="font-bold">{entry.payload.value.toLocaleString()}</span>
              </span>
            )}
            wrapperStyle={{ paddingTop: '24px' }}
            iconType="circle"
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Engagement Insights */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">Most Engaged:</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {engagementData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
          </span>
        </div>
      </div>
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
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      icon_bg: 'bg-white/20 backdrop-blur-sm',
      icon_color: 'text-white',
      trend: stats.totalPosts > 0 ? '+' + stats.totalPosts : '0',
      trendLabel: 'published'
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      icon_bg: 'bg-white/20 backdrop-blur-sm',
      icon_color: 'text-white',
      trend: stats.totalPosts > 0 ? Math.round(stats.totalViews / stats.totalPosts) : 0,
      trendLabel: 'avg per post'
    },
    {
      label: 'Comments',
      value: stats.totalComments,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
      icon_bg: 'bg-white/20 backdrop-blur-sm',
      icon_color: 'text-white',
      trend: stats.totalComments > 0 ? '+' + stats.totalComments : '0',
      trendLabel: 'total discussions'
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes,
      icon: (
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ),
      gradient: 'from-rose-500 via-pink-600 to-fuchsia-600',
      icon_bg: 'bg-white/20 backdrop-blur-sm',
      icon_color: 'text-white',
      trend: stats.totalPosts > 0 ? Math.round(stats.totalLikes / stats.totalPosts) : 0,
      trendLabel: 'avg per post'
    }
  ];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-12">
      {statCards.map((card, idx) => (
        <div 
          key={idx} 
          className={`relative overflow-hidden bg-linear-to-br ${card.gradient} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white"></div>
            <div className="absolute -left-4 -bottom-4 w-32 h-32 rounded-full bg-white"></div>
          </div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white/90 mb-2 uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-4xl sm:text-5xl font-black mb-3 group-hover:scale-110 transition-transform origin-left">
                {card.value.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                <span className="px-2 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                  {card.trend}
                </span>
                <span>{card.trendLabel}</span>
              </div>
            </div>
            <div className={`w-16 h-16 rounded-2xl ${card.icon_bg} flex items-center justify-center ${card.icon_color} group-hover:rotate-6 transition-transform shadow-lg`}>
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
    <div className="relative p-8 sm:p-16 text-center overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      {/* Icon with Gradient Background */}
      <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-6 rounded-2xl bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
        <svg className="h-10 w-10 sm:h-12 sm:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      
      <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-3">
        No posts yet
      </h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Start your blogging journey by creating your first post. Share your ideas with the world!
      </p>
      
      {/* CTA Button with Gradient */}
      <Link
        href="/blog/new"
        className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
      >
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create Your First Post
      </Link>
    </div>
  );
}

function RecentPostsTableContent({ recentPosts, viewCounts }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <tr>
            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Title
              </div>
            </th>
            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category
              </div>
            </th>
            <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Views
              </div>
            </th>
            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </div>
            </th>
            <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <div className="flex items-center justify-end">
                <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                Actions
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {recentPosts.map((post, idx) => (
            <tr 
              key={post.id} 
              className="hover:bg-linear-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200 group"
            >
              <td className="px-4 sm:px-6 py-4">
                <div className="flex items-center">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </div>
                </div>
              </td>
              <td className="hidden sm:table-cell px-6 py-4">
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 group-hover:scale-105 transition-transform">
                  <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {post.category}
                </span>
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {(viewCounts?.[post.id] !== undefined ? viewCounts[post.id] : 0).toLocaleString()}
                  </span>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full transition-all group-hover:scale-105 ${
                  post.published
                    ? 'bg-linear-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-linear-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  {post.published ? (
                    <>
                      <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Published
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Draft
                    </>
                  )}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <a
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 font-semibold transition-all hover:scale-105"
                  >
                    <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="hidden sm:inline">View</span>
                  </a>
                  <a
                    href={`/blog/edit/${post.id}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold transition-all hover:scale-105"
                  >
                    <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="hidden sm:inline">Edit</span>
                  </a>
                </div>
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

// RecentComments Component
function RecentComments({ comments, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg mr-3">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            Recent Comments
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-16">Comments on your posts</p>
        </div>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading comments...</p>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg mr-3">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            Recent Comments
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-16">Comments on your posts</p>
        </div>
        <div className="relative p-8 sm:p-16 text-center overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-emerald-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-teal-500 rounded-full blur-3xl"></div>
          </div>
          
          {/* Icon with Gradient Background */}
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-6 rounded-2xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl">
            <svg className="h-10 w-10 sm:h-12 sm:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-3">
            No comments yet
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            When readers comment on your posts, they&apos;ll appear here. Keep writing great content!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg mr-3">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          Recent Comments
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-16">
          💬 {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </p>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {comments.map((comment, idx) => (
          <div 
            key={comment.id} 
            className="p-4 sm:p-6 hover:bg-linear-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-900/10 dark:hover:to-teal-900/10 transition-all duration-200 group border-l-4 border-emerald-500 hover:border-emerald-600"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Comment Number Badge */}
              <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform shadow-md">
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                {/* Comment Header */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                      {comment.user?.name?.charAt(0)?.toUpperCase() || comment.user?.username?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {comment.user?.name || comment.user?.username || 'Anonymous'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Comment Content */}
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3 leading-relaxed">
                  {comment.text}
                </p>

                {/* Post Reference */}
                <Link 
                  href={`/blog/${comment.postSlug}`}
                  className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group/link"
                >
                  <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="line-clamp-1 group-hover/link:underline">
                    On: {comment.postTitle}
                  </span>
                </Link>
              </div>

              {/* View Button */}
              <Link
                href={`/blog/${comment.postSlug}#comment-${comment.id}`}
                className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 font-semibold text-xs transition-all hover:scale-105"
              >
                <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">View</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

RecentComments.propTypes = {
  comments: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          Quick Actions
        </h2>
        <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 font-medium">
          🚀 Boost Your Workflow
        </div>
      </div>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            href={action.href}
            className={`group relative overflow-hidden flex flex-col p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 ${action.border} hover:border-opacity-100 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-linear-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-xl ${action.icon_bg} flex items-center justify-center ${action.icon_color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-5 shadow-lg`}>
                {action.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white/90 transition-colors flex-1 mb-4">
                {action.description}
              </p>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 group-hover:text-white font-semibold group-hover:translate-x-2 transition-all">
                <span className="text-sm">Get Started</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
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
  const [recentComments, setRecentComments] = useState([]);
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

        // Fetch recent comments on user's posts
        const allComments = [];
        await Promise.all(userPosts.map(async (post) => {
          const comments = await commentService.getCommentsByPost(post.id);
          comments.forEach(comment => {
            allComments.push({
              ...comment,
              postTitle: post.title,
              postSlug: post.slug
            });
          });
        }));
        
        console.log('📊 Dashboard - Total comments found:', allComments.length);
        
        // Sort by createdAt (most recent first) and take top 5
        const sortedComments = allComments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        
        console.log('📊 Dashboard - Recent comments (top 5):', sortedComments);
        
        setRecentComments(sortedComments);

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

        {/* Recent Comments Section */}
        <div className="mt-8 sm:mt-12">
          <RecentComments comments={recentComments} loading={loading} />
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
