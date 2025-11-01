'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { followService } from '@/lib/firebase/follow-service';
import { blogService } from '@/lib/firebase/blog-service';
import FollowButton from '@/components/FollowButton';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import Image from 'next/image';

export default function UserProfilePage() {
  const params = useParams();
  const encodedEmail = params.id; // This is the email now (URL encoded)
  const email = encodedEmail ? decodeURIComponent(encodedEmail) : null;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return;

      try {
        // Query users by email
        const users = await followService.getUsersByEmail(email);
        
        if (users && users.length > 0) {
          const user = users[0];
          setUserData(user);

          // Fetch follow stats and posts using the email
          setPostsLoading(true);
          const [followerCount, followingCount, authorPosts] = await Promise.all([
            followService.getFollowerCount(user.uid),
            followService.getFollowingCount(user.uid),
            blogService.getPublishedPostsByAuthorEmail(email),
          ]);
          setFollowStats({
            followers: followerCount,
            following: followingCount,
          });
          setUserPosts(authorPosts || []);
          setPostsLoading(false);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            User not found
          </h2>
          <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Background */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 h-32 sm:h-40 md:h-48" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg -mt-16 sm:-mt-20 md:-mt-24 relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600 flex-shrink-0 border-4 border-white dark:border-gray-800 shadow-lg">
              {userData.photoURL ? (
                <Image
                  src={userData.photoURL}
                  alt={userData.displayName || 'User'}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {userData.displayName?.[0] || 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 mb-4 sm:mb-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {userData.displayName || 'User'}
              </h1>
              {userData.bio && (
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-base sm:text-lg">
                  {userData.bio}
                </p>
              )}
            </div>

            {/* Follow Button */}
            <div className="w-full sm:w-auto">
              <FollowButton
                targetUserId={userData.uid}
                targetUserData={{
                  displayName: userData.displayName || '',
                  photoURL: userData.photoURL || '',
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {followStats.followers}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Followers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                {followStats.following}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Following</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {userData.postCount || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Posts</p>
            </div>
          </div>

          {/* Social Links */}
          {(userData.website || userData.twitter || userData.github || userData.linkedin) && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Social Links
              </h3>
              <div className="flex flex-wrap gap-4">
                {userData.website && (
                  <a
                    href={userData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-6l6-6m0 0L9 9" />
                    </svg>
                    Website
                  </a>
                )}
                {userData.twitter && (
                  <a
                    href={`https://twitter.com/${userData.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                    Twitter
                  </a>
                )}
                {userData.github && (
                  <a
                    href={`https://github.com/${userData.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-600 text-white hover:bg-gray-900 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                )}
                {userData.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${userData.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Blog Posts Section */}
          {userPosts && userPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Articles by {userData.displayName || userData.username}
              </h2>
              {postsLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
