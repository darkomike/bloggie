'use client';

import { useEffect, useMemo, useState } from 'react';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import Image from 'next/image';
import { blogService } from '@/lib/firebase/blog-service';
import { viewService } from '@/lib/firebase/view-service';
import { 
  HiDesktopComputer, 
  HiColorSwatch, 
  HiBriefcase, 
  HiHeart, 
  HiSpeakerphone, 
  HiAcademicCap,
  HiArrowRight,
  HiArrowDown,
  HiLightBulb,
  HiUserGroup,
  HiPencilAlt,
  HiNewspaper,
  HiTag,
  HiDocumentText,
  HiChevronRight
} from 'react-icons/hi';

const categoryConfig = [
  {
    name: 'Technology',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    icon: <HiDesktopComputer className="h-10 w-10" />,
  },
  {
    name: 'Design',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    icon: <HiColorSwatch className="h-10 w-10" />,
  },
  {
    name: 'Business',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    icon: <HiBriefcase className="h-10 w-10" />,
  },
  {
    name: 'Lifestyle',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    icon: <HiHeart className="h-10 w-10" />,
  },
  {
    name: 'Marketing',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    icon: <HiSpeakerphone className="h-10 w-10" />,
  },
  {
    name: 'Education',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    icon: <HiAcademicCap className="h-10 w-10" />,
  },
];

export default function HomePageContent() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalCategories: 0,
    totalAuthors: 0,
    totalViews: 0,
    activeReaders: 0,
    categoryStats: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent posts for display (limited to 6)
        const recentPostsData = await blogService.getAllPosts(6);
        setRecentPosts(recentPostsData);
        
        // Fetch ALL posts to calculate accurate stats
        const allPosts = await blogService.getAllPosts(); // No limit = fetch all
        
        // Fetch all views from the views collection
        const allViews = await viewService.getAllViews();
        
        // Calculate real stats from all posts
        const categories = new Set(allPosts.map(p => p.category).filter(Boolean));
        const authors = new Set(allPosts.map(p => p.authorId).filter(Boolean));
        const totalViews = allViews.length;
        
        // Active readers = total views count from the views collection
        const activeReaders = totalViews;
        
        // Calculate category statistics
        const categoryStatsMap = {};
        allPosts.forEach(post => {
          if (post.category) {
            if (!categoryStatsMap[post.category]) {
              categoryStatsMap[post.category] = {
                count: 0,
                views: 0,
              };
            }
            categoryStatsMap[post.category].count += 1;
            categoryStatsMap[post.category].views += post.views || 0;
          }
        });
        
        setStats({
          totalPosts: allPosts.length,
          totalCategories: categories.size,
          totalAuthors: authors.size,
          totalViews: totalViews,
          activeReaders: activeReaders,
          categoryStats: categoryStatsMap,
        });
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryStats = useMemo(() => stats.categoryStats || {}, [stats.categoryStats]);

  // Debug: Log stats and categoryStats
  useEffect(() => {
    if (stats && Object.keys(categoryStats).length > 0) {
      console.log('🔍 [HomePageContent] Stats:', {
        totalPosts: stats.totalPosts,
        totalCategories: stats.totalCategories,
        totalAuthors: stats.totalAuthors,
        totalViews: stats.totalViews,
        activeReaders: stats.activeReaders,
        categoryStats: Object.entries(categoryStats).map(([cat, stats]) => ({
          category: cat,
          count: stats.count,
          views: stats.views,
        })),
      });
      console.log('📊 Active Readers Calculation:', {
        totalViewRecords: stats.totalViews,
        activeReaders: stats.activeReaders,
        source: 'Firestore views collection (total view count)',
      });
    }
  }, [stats, categoryStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Hero Section with Image */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900 pt-0">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-r from-blue-600/95 via-purple-600/90 to-indigo-600/95 dark:from-blue-900/95 dark:via-purple-900/90 dark:to-indigo-900/95 z-10" />
          <Image
            src="/assets/images/home.jpg"
            alt="Blog Hero Background"
            fill
            className="object-cover object-center"
            priority
            quality={85}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 md:py-40">
          <div className="text-center text-white space-y-6 md:space-y-8">
            <div className="inline-block">
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all">
                Welcome to Bloggie
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              Discover Stories That<br />
              <span className="bg-linear-to-r from-yellow-200 via-white to-blue-100 bg-clip-text text-transparent">
                Inspire & Engage
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Explore insightful articles on technology, design, business, and more. 
              Join our community of thoughtful readers and writers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <HiArrowRight className="h-5 w-5" />
                Start Reading
              </Link>
              <button
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
              >
                <HiArrowDown className="h-5 w-5" />
                Explore Categories
              </button>
            </div>

            {/* Stats Below Hero */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-yellow-200">{stats.totalPosts.toLocaleString()}</div>
                <div className="text-sm sm:text-base text-white/80 mt-2">Articles Published</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-blue-200">{stats.totalCategories}</div>
                <div className="text-sm sm:text-base text-white/80 mt-2">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-purple-200">{stats.activeReaders.toLocaleString()}</div>
                <div className="text-sm sm:text-base text-white/80 mt-2">Active Readers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white dark:bg-gray-900" style={{
          clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 100%)',
        }} />
      </section>

      {/* Why Choose Bloggie Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Why Choose Bloggie?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide a platform for quality content and genuine connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transition-all hover:scale-105">
              <div className="w-12 h-12 mb-4 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <HiLightBulb className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quality Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every article is carefully crafted by experts to provide genuine value and insights.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-xl transition-all hover:scale-105">
              <div className="w-12 h-12 mb-4 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <HiPencilAlt className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Regular Updates</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fresh content published regularly to keep you informed on the latest trends.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-linear-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200/50 dark:border-indigo-800/50 hover:shadow-xl transition-all hover:scale-105">
              <div className="w-12 h-12 mb-4 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <HiUserGroup className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Expert Authors</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn from industry professionals with years of experience in their fields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-12 text-gray-900 dark:text-white text-center">
            Explore by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Get categories that have posts */}
            {Object.entries(categoryStats)
              .filter(([_, stats]) => stats.count > 0)
              .map(([categoryName, stats]) => {
                // Try to find matching config, otherwise use default styling
                const config = categoryConfig.find(
                  (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
                );
                const displayName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
                const bgColor = config?.color || 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
                const icon = config?.icon || <HiTag className="h-10 w-10" />;

                return (
                  <Link
                    key={categoryName}
                    href={`/category/${categoryName.toLowerCase()}`}
                    className={`p-8 rounded-2xl ${bgColor} hover:shadow-2xl transition-all transform hover:scale-105 group border border-current border-opacity-20`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0 transform group-hover:rotate-12 group-hover:scale-110 transition-transform">
                        {icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{displayName}</h3>
                        <p className="text-sm opacity-75">
                          {stats.count} post{stats.count === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
          
          {Object.values(categoryStats).every((stats) => stats.count === 0) && (
            <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No categories with posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Latest Articles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Fresh insights and stories from our community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.slice(0, 6).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {recentPosts.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <HiDocumentText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No posts available yet. Check back soon!</p>
            </div>
          )}

          {recentPosts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
              >
                View All Articles
                <HiChevronRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
            Ready to Share Your Story?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8">
            Join thousands of writers and share your insights with our growing community.
          </p>
          <Link
            href="/blog/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <HiNewspaper className="h-5 w-5" />
            Start Writing
          </Link>
        </div>
      </section>
    </div>
  );
}
