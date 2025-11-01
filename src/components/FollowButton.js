'use client';

import { useState, useEffect } from 'react';
import { followService } from '@/lib/firebase/follow-service';
import { useAuth } from './AuthProvider';

export default function FollowButton({ targetUserId, targetUserData = {}, onFollowStatusChange }) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Check if user is already following
  useEffect(() => {
    if (!user || !targetUserId || user.uid === targetUserId) {
      setIsLoading(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const following = await followService.isFollowing(user.uid, targetUserId);
        setIsFollowing(following);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFollowStatus();
  }, [user, targetUserId]);

  const handleFollowToggle = async () => {
    if (!user || !targetUserId || isToggling) return;

    setIsToggling(true);
    try {
      if (isFollowing) {
        // Unfollow
        const success = await followService.unfollowUser(user.uid, targetUserId);
        if (success) {
          setIsFollowing(false);
          // Notify parent component that follow status changed
          if (onFollowStatusChange) {
            onFollowStatusChange(false);
          }
        }
      } else {
        // Follow
        const success = await followService.followUser(
          user.uid,
          targetUserId,
          {
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
          },
          {
            displayName: targetUserData.displayName || '',
            photoURL: targetUserData.photoURL || '',
          }
        );
        if (success) {
          setIsFollowing(true);
          // Notify parent component that follow status changed
          if (onFollowStatusChange) {
            onFollowStatusChange(true);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsToggling(false);
    }
  };

  // Don't show button if it's the current user or still loading
  if (!user || user.uid === targetUserId || isLoading) {
    return null;
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isToggling}
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
        isFollowing
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isToggling ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </span>
      ) : isFollowing ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Following
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Follow
        </span>
      )}
    </button>
  );
}
