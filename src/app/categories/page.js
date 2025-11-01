"use client"

import Link from 'next/link';
import  { useState,useEffect } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    async function fetchCategories() {
      const { blogService } = await import('@/lib/firebase/blog-service');
      const posts = await blogService.getAllPosts();
      // Aggregate categories and counts
      const categoryMap = {};
      for (const post of posts) {
        const cat = post.category?.trim();
        if (!cat) continue;
        const key = cat.toLowerCase();
        if (!categoryMap[key]) {
          categoryMap[key] = {
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            description: '', // Optionally fill from a config or first post
            count: 0,
            color: 'from-gray-500 to-gray-800', // Optionally map colors
            icon: null, // Optionally map icons
          };
        }
        categoryMap[key].count++;
      }
      // Optionally fill description, color, icon from a config
      // Example config for known categories
      const CATEGORY_CONFIG = {
        technology: {
          description: 'Latest tech trends, programming tutorials, and software development insights',
          color: 'from-blue-500 to-cyan-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
        design: {
          description: 'UI/UX design principles, creative inspiration, and design systems',
          color: 'from-purple-500 to-pink-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          ),
        },
        // ...add configs for other categories as needed
      };
      // Merge config into categoryMap
      Object.keys(categoryMap).forEach(key => {
        if (CATEGORY_CONFIG[key]) {
          categoryMap[key].description = CATEGORY_CONFIG[key].description;
          categoryMap[key].color = CATEGORY_CONFIG[key].color;
          categoryMap[key].icon = CATEGORY_CONFIG[key].icon;
        }
      });
      setCategories(Object.values(categoryMap));
    }
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="relative bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900 py-16 sm:py-20 md:py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-6 sm:mb-8">
              <svg className="h-10 w-10 sm:h-12 sm:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 sm:mb-6">
              Browse by Category
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto px-4 mb-6 sm:mb-8">
              Discover articles tailored to your interests across diverse topics
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <div className="flex items-center gap-2 text-white/90">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-base sm:text-lg font-semibold">{categories.length} Categories</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span className="text-base sm:text-lg font-semibold">
                  {categories.reduce((sum, cat) => sum + cat.count, 0)} Articles
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/category/${category.name.toLowerCase()}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative p-6 sm:p-8">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${category.color} text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>

                  {/* Content */}
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600">
                    {category.name}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-semibold text-gray-500 dark:text-gray-400">
                      {category.count} articles
                    </span>
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform group-hover:translate-x-2 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
