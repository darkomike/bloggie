'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { userService } from '@/lib/firebase/user-service';
import { followService } from '@/lib/firebase/follow-service';
import { blogService } from '@/lib/firebase/blog-service';
import FollowButton from '@/components/FollowButton';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import Image from 'next/image';

export default function UserProfilePage() {
  const params = useParams();
  const uid = params.id; // This is the user UID
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) return;

      try {
        // Fetch user by UID using userService
        const user = await userService.getUserById(uid);
        
        if (user) {
          setUserData(user);

          // Fetch follow stats and posts using the UID
          setPostsLoading(true);
          const [followerCount, followingCount, authorPosts] = await Promise.all([
            followService.getFollowerCount(uid),
            followService.getFollowingCount(uid),
            blogService.getPublishedPostsByAuthor(uid),
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
  }, [uid]);

  const handleFollowStatusChange = async (isNowFollowing) => {
    // Refetch follower count when follow status changes
    if (userData?.uid) {
      const newFollowerCount = await followService.getFollowerCount(userData.uid);
      setFollowStats(prev => ({
        ...prev,
        followers: newFollowerCount,
      }));
    }
  };

  const handleShowFollowers = async () => {
    if (showFollowers) {
      setShowFollowers(false);
      return;
    }
    
    // Close following if it's open
    setShowFollowing(false);
    
    setListsLoading(true);
    try {
      const followers = await followService.getFollowers(uid);
      setFollowersList(followers || []);
      setShowFollowers(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setListsLoading(false);
    }
  };

  const handleShowFollowing = async () => {
    if (showFollowing) {
      setShowFollowing(false);
      return;
    }
    
    // Close followers if it's open
    setShowFollowers(false);
    
    setListsLoading(true);
    try {
      const following = await followService.getFollowing(uid);
      setFollowingList(following || []);
      setShowFollowing(true);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setListsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Decorative Header Background */}
      <div className="relative h-40 sm:h-48 md:h-56 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl dark:shadow-2xl -mt-24 sm:-mt-28 md:-mt-32 relative z-10 p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-8">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0 border-4 border-white dark:border-gray-800 shadow-2xl ring-4 ring-blue-100 dark:ring-indigo-900/50">
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
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                {userData.displayName || 'User'}
              </h1>
              {userData.bio && (
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                  {userData.bio}
                </p>
              )}
              {!userData.bio && (
                <p className="text-lg text-gray-400 dark:text-gray-500 italic">
                  No bio yet
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
                onFollowStatusChange={handleFollowStatusChange}
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-10 pt-10 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleShowFollowers}
              className="group text-center py-3 px-4 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                {followStats.followers}
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                Followers
              </p>
            </button>
            <button
              onClick={handleShowFollowing}
              className="group text-center py-3 px-4 rounded-2xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {followStats.following}
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                Following
              </p>
            </button>
            <div className="group text-center py-3 px-4 rounded-2xl">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {userPosts.length}
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Articles
              </p>
            </div>
          </div>

          {/* Social Links */}
          {(userData.website || userData.twitter || userData.github || userData.linkedin) && (
            <div className="mt-10 pt-10 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Connect With Me
              </h3>
              <div className="flex flex-wrap gap-3">
                {userData.website && (
                  <a
                    href={userData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 hover:shadow-lg dark:hover:shadow-blue-900/30 transition-all duration-300 font-medium border border-blue-200 dark:border-blue-700/50"
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
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 hover:shadow-lg dark:hover:shadow-blue-900/30 transition-all duration-300 font-medium border border-blue-200 dark:border-blue-700/50"
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
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 font-medium border border-gray-300 dark:border-gray-600"
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
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 hover:shadow-lg dark:hover:shadow-blue-900/30 transition-all duration-300 font-medium border border-blue-300 dark:border-blue-700/50"
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

          {/* Followers/Following Lists Section */}
          {(showFollowers || showFollowing) && (
            <div className="mt-10 pt-10 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showFollowers ? 'Followers' : 'Following'}
                </h3>
                <button
                  onClick={() => {
                    setShowFollowers(false);
                    setShowFollowing(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl font-light leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {listsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                </div>
              ) : showFollowers && followersList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {followersList.map((follower) => (
                    <div key={follower.followerId} className="group">
                      <Link href={`/user/${follower.followerId}`}>
                        <div className="h-full bg-white dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-600 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 transform hover:scale-105">
                          <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 border-3 border-white dark:border-gray-600 shadow-lg">
                              {follower.followerPhotoURL ? (
                                <Image
                                  src={follower.followerPhotoURL}
                                  alt={follower.followerName}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white">
                                  <span className="text-2xl font-bold">
                                    {follower.followerName?.[0] || 'U'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {follower.followerName}
                            </h4>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : showFollowing && followingList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {followingList.map((following) => (
                    <div key={following.followingId} className="group">
                      <Link href={`/user/${following.followingId}`}>
                        <div className="h-full bg-white dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-600 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 transform hover:scale-105">
                          <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 mb-4 border-3 border-white dark:border-gray-600 shadow-lg">
                              {following.followingPhotoURL ? (
                                <Image
                                  src={following.followingPhotoURL}
                                  alt={following.followingName}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white">
                                  <span className="text-2xl font-bold">
                                    {following.followingName?.[0] || 'U'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {following.followingName}
                            </h4>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {showFollowers ? 'No followers yet' : 'Not following anyone yet'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Blog Posts Section */}
          {userPosts && userPosts.length > 0 && (
            <div className="mt-14 pt-10 border-t border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Featured Articles
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {userPosts.length} {userPosts.length === 1 ? 'article' : 'articles'} by {userData.displayName || userData.username}
              </p>
              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                </div>
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
