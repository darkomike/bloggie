'use client';

import { useState, useEffect } from 'react';
import { followService } from '@/lib/firebase/follow-service';
import { useAuth } from './AuthProvider';
import Image from 'next/image';

export default function FollowListModal({ 
  isOpen, 
  onClose, 
  userId, 
  type = 'followers', // 'followers' or 'following'
  userName = '',
  onFollowChange = () => {}, // Callback when follow/unfollow happens
}) {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unfollowingId, setUnfollowingId] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchList = async () => {
      setLoading(true);
      try {
        let data = [];
        if (type === 'followers') {
          data = await followService.getFollowers(userId);
        } else {
          data = await followService.getFollowing(userId);
        }
        setList(data);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [isOpen, userId, type]);

  const handleUnfollow = async (followData) => {
    if (!user) return;

    setUnfollowingId(followData.followingId || followData.followerId);
    try {
      // For followers list: unfollow the follower (they unfollow us)
      // For following list: unfollow the person we're following
      if (type === 'followers') {
        // In followers list, followData has followerId (the follower) and followingId (us)
        // We need to find if user is following them and unfollow
        const isFollowing = await followService.isFollowing(user.uid, followData.followerId);
        if (isFollowing) {
          await followService.unfollowUser(user.uid, followData.followerId);
        }
      } else {
        // In following list, followData has followerId (us) and followingId (who we follow)
        await followService.unfollowUser(user.uid, followData.followingId);
      }

      // Refresh the list
      setList(prev => prev.filter(item => {
        if (type === 'followers') {
          return item.followerId !== followData.followerId;
        } else {
          return item.followingId !== followData.followingId;
        }
      }));

      // Call the callback to update parent component
      onFollowChange({ type, action: 'unfollow' });
    } catch (error) {
      console.error('Error unfollowing:', error);
    } finally {
      setUnfollowingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {type === 'followers' ? 'Followers' : 'Following'}
            {userName && ` of ${userName}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p>No {type} yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {list.map((item) => {
                const isCurrentUser = user?.uid === (type === 'followers' ? item.followerId : item.followingId);
                const displayName = type === 'followers' ? item.followerName : item.followingName;
                const photoURL = type === 'followers' ? item.followerPhotoURL : item.followingPhotoURL;

                return (
                  <div key={`${type}-${type === 'followers' ? item.followerId : item.followingId}`} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                        {photoURL ? (
                          <Image
                            src={photoURL}
                            alt={displayName || 'User'}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {displayName?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {displayName || 'Anonymous'}
                        </p>
                      </div>
                    </div>

                    {/* Show unfollow button for current user on their followers/following list */}
                    {!isCurrentUser && type === 'following' && (
                      <button
                        onClick={() => handleUnfollow(item)}
                        disabled={unfollowingId === item.followingId}
                        className="ml-2 px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-all"
                      >
                        {unfollowingId === item.followingId ? '...' : 'Unfollow'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
