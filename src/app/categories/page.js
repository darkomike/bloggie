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
        const cat = post.category;
        const catTrimmed = cat?.trim();
        if (!catTrimmed) continue;
        const key = catTrimmed.toLowerCase();
        if (!categoryMap[key]) {
          categoryMap[key] = {
            name: catTrimmed.charAt(0).toUpperCase() + catTrimmed.slice(1),
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
        business: {
          description: 'Business strategies, entrepreneurship, and market insights',
          color: 'from-green-500 to-emerald-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          ),
        },
        lifestyle: {
          description: 'Personal development, wellness, and daily living tips',
          color: 'from-orange-500 to-red-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        marketing: {
          description: 'Marketing strategies, SEO, and digital growth hacks',
          color: 'from-pink-500 to-rose-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
        education: {
          description: 'Learning resources, tutorials, and skill development',
          color: 'from-indigo-500 to-blue-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
            </svg>
          ),
        },
        health: {
          description: 'Health tips, fitness routines, and wellness advice',
          color: 'from-red-500 to-pink-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        },
        travel: {
          description: 'Travel guides, destinations, and adventure stories',
          color: 'from-cyan-500 to-blue-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          ),
        },
        science: {
          description: 'Scientific discoveries, research, and innovation',
          color: 'from-amber-500 to-yellow-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.454l-3.426-.64a2 2 0 00-2.01.172l-.822.822a2 2 0 01-2.828 0l-.822-.822a2 2 0 00-2.01-.172l-3.426.64a2 2 0 00-1.022.454m19.414 0a2 2 0 001.022.454l3.426.64a2 2 0 012.01.172l.822.822a2 2 0 002.828 0l.822-.822a2 2 0 012.01-.172l3.426-.64a2 2 0 001.022-.454M9 12a3 3 0 11-6 0 3 3 0 016 0zm0 0a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          ),
        },
        finance: {
          description: 'Financial advice, investing, and wealth management',
          color: 'from-green-600 to-emerald-600',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        sports: {
          description: 'Sports news, fitness, and athletic performance',
          color: 'from-orange-600 to-red-600',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
        food: {
          description: 'Recipes, cooking tips, and culinary experiences',
          color: 'from-yellow-500 to-orange-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        entertainment: {
          description: 'Movies, music, TV shows, and pop culture',
          color: 'from-violet-500 to-purple-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        politics: {
          description: 'Political news, analysis, and current affairs',
          color: 'from-slate-600 to-gray-700',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        environment: {
          description: 'Environmental issues, sustainability, and eco-friendly living',
          color: 'from-lime-500 to-green-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 00 9 9a9 9 0 018.646-8.646 9.003 9.003 0 01.353 17.987A10.079 10.079 0 0110 19.25a10.003 10.003 0 01-10-10 10.017 10.017 0 012.20-6.08z" />
            </svg>
          ),
        },
        relationships: {
          description: 'Dating, relationships, and personal connections',
          color: 'from-rose-500 to-pink-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        },
        art: {
          description: 'Visual arts, galleries, and artistic expression',
          color: 'from-fuchsia-500 to-purple-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          ),
        },
        music: {
          description: 'Music reviews, artist profiles, and audio experiences',
          color: 'from-purple-500 to-indigo-500',
          icon: (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          ),
        },
      };
      // Merge config into categoryMap
      Object.keys(categoryMap).forEach(key => {
        if (CATEGORY_CONFIG[key]) {
          categoryMap[key].description = CATEGORY_CONFIG[key].description;
          categoryMap[key].color = CATEGORY_CONFIG[key].color;
          categoryMap[key].icon = CATEGORY_CONFIG[key].icon;
        } else {
          // Fallback for unknown categories - assign a default icon and color
          const colors = [
            'from-slate-500 to-gray-600',
            'from-teal-500 to-cyan-500',
            'from-sky-500 to-blue-500',
            'from-violet-500 to-indigo-500',
          ];
          const defaultIcon = (
            <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
            </svg>
          );
          categoryMap[key].color = colors[Object.keys(categoryMap).indexOf(key) % colors.length];
          categoryMap[key].icon = defaultIcon;
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
              className="group h-full"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-linear-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative p-6 sm:p-8 flex flex-col flex-1">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br ${category.color} text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>

                  {/* Content */}
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-blue-600 group-hover:to-purple-600">
                    {category.name}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto">
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
