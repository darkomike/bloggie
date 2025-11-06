'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { uploadUserAvatar, deleteBlob, compressImageFile } from '@/lib/vercel-blob-service';
import { followService } from '@/lib/firebase/follow-service';
import { userService } from '@/lib/firebase/user-service';
import { blogService } from '@/lib/firebase/blog-service';
import { validateUsername } from '@/lib/usernameUtils';
import FollowListModal from '@/components/FollowListModal';
import CacheDebugPanel from '@/components/CacheDebugPanel';
import { TimeUtil } from '@/utils/timeUtils';

export default function ProfilePage() {
  const { user, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    displayName: '',
    username: '',
    bio: '',
    website: '',
    twitter: '',
    github: '',
    linkedin: '',
  });
  const [initialUsername, setInitialUsername] = useState('');
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const [postStats, setPostStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const userData = await userService.getUserById(user.uid);

        if (userData) {
          setProfile({
            displayName: userData.displayName || user.displayName || '',
            username: userData.username || '',
            bio: userData.bio || '',
            website: userData.website || '',
            twitter: userData.twitter || '',
            github: userData.github || '',
            linkedin: userData.linkedin || '',
          });
          setInitialUsername(userData.username || '');
          
          // Set avatar preview from user data or Firebase Auth
          if (userData.photoURL) {
            setAvatarPreview(userData.photoURL);
          } else if (user.photoURL) {
            setAvatarPreview(user.photoURL);
          }
        } else {
          // Document doesn't exist, set default values from auth
          setProfile(prev => ({ 
            ...prev, 
            displayName: user.displayName || '' 
          }));
          
          // Set avatar from Firebase Auth if available
          if (user.photoURL) {
            setAvatarPreview(user.photoURL);
          }
        }

        // Fetch follow stats
        const [followerCount, followingCount] = await Promise.all([
          followService.getFollowerCount(user.uid),
          followService.getFollowingCount(user.uid),
        ]);
        setFollowStats({
          followers: followerCount,
          following: followingCount,
        });

        try {
          const authorPosts = await blogService.getPostsByAuthor(user.uid);
          const publishedCount = authorPosts.filter(post => post.published).length;
          const draftsCount = authorPosts.length - publishedCount;
          setPostStats({
            total: authorPosts.length,
            published: publishedCount,
            drafts: draftsCount,
          });
          setRecentPosts(authorPosts.slice(0, 3));
        } catch (postError) {
          console.warn('Error fetching user posts:', postError);
          setPostStats({ total: 0, published: 0, drafts: 0 });
          setRecentPosts([]);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    
    // Clear username error when user edits the field
    if (name === 'username') {
      setUsernameError('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      console.warn('Missing file or user', { hasFile: !!file, hasUser: !!user });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    
    // Warn user if file is large (over 1MB)
    if (file.size > 1024 * 1024 && file.size <= MAX_SIZE) {
      setMessage({ 
        type: 'info', 
        text: `Processing ${fileSizeMB}MB image. This may take a moment...` 
      });
    }
    
    // Hard reject if file is too large - don't even try compression
    if (file.size > MAX_SIZE) {
      setMessage({ 
        type: 'error', 
        text: `File is too large (${fileSizeMB}MB). Maximum allowed size is 2MB. Please choose a smaller image.` 
      });
      return; // Stop here
    }

    let tempPreviewUrl = '';
    setUploading(true);

    try {
      console.log(`Starting upload for file: ${file.name} (${fileSizeMB}MB)`);

      let optimizedFile = file;
      try {
        optimizedFile = await compressImageFile(file, {
          quality: 0.75,
          maxWidth: 1600,
          maxHeight: 1600,
        });
        console.log(`Compressed image to ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`);
      } catch (compressionError) {
        console.warn('Image compression failed, using original file', compressionError);
      }

      // Double check after compression
      if (optimizedFile.size > MAX_SIZE) {
        setUploading(false);
        setMessage({
          type: 'error',
          text: `File remains too large after compression (${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB). Please choose a smaller image.`,
        });
        return; // Stop here
      }

      // Delete old avatar if it exists
      const userData = await userService.getUserById(user.uid);
      const oldPhotoURL = userData?.photoURL || user.photoURL;
      
      if (oldPhotoURL && /^https?:\/\//i.test(oldPhotoURL)) {
        try {
          console.log('Deleting old avatar:', oldPhotoURL);
          await deleteBlob(oldPhotoURL);
          console.log('Old avatar deleted successfully');
        } catch (err) {
          console.warn('Could not delete old avatar:', err);
        }
      }

      tempPreviewUrl = URL.createObjectURL(optimizedFile);
      setAvatarPreview(tempPreviewUrl);

      console.log('Uploading new avatar...');
      const photoURL = await uploadUserAvatar(optimizedFile, user.uid);
      console.log('Avatar uploaded successfully:', photoURL);

      // Update user profile in Firestore (single source of truth)
      await userService.updateUser(user.uid, { photoURL });
      console.log('Firestore profile updated with new photo');

      // Update local preview immediately
      setAvatarPreview(photoURL);
      
      // Refresh session to get updated user from Firestore
      await refreshSession();
      console.log('Session refreshed - user state should be updated');
      
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error.message?.includes('File too large')) {
        errorMessage = error.message;
      } else if (error.message?.includes('already exists')) {
        errorMessage = 'Upload failed due to file conflict. Please try again.';
      } else if (error.message?.includes('413')) {
        errorMessage = 'File is too large. Please choose a smaller image (under 2MB).';
      } else if (error.message?.includes('token') || error.message?.includes('Unauthorized')) {
        errorMessage = 'Upload service temporarily unavailable. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setUploading(false);
      if (tempPreviewUrl) {
        URL.revokeObjectURL(tempPreviewUrl);
      }
      e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !avatarPreview) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to remove your profile photo? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setUploading(true);
    
    try {
      console.log('Removing profile photo...');
      
      // Delete the current avatar from blob storage
      if (avatarPreview && /^https?:\/\//i.test(avatarPreview)) {
        try {
          console.log('Deleting avatar from storage:', avatarPreview);
          await deleteBlob(avatarPreview);
          console.log('Avatar deleted from storage successfully');
        } catch (err) {
          console.warn('Could not delete avatar from storage:', err);
        }
      }

      // Update user profile in Firestore to remove photoURL (single source of truth)
      await userService.removeUserPhoto(user.uid);
      console.log('Photo removed from Firestore');

      // Clear local state immediately
      setAvatarPreview('');
      
      // Refresh session to get updated user from Firestore
      await refreshSession();
      console.log('Session refreshed after photo removal');
      
      setMessage({ type: 'success', text: 'Profile photo removed successfully!' });
    } catch (error) {
      console.error('Error removing photo:', error);
      setMessage({ type: 'error', text: 'Failed to remove photo. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleFollowChange = ({ type, action }) => {
    const delta = action === 'increment' ? 1 : -1;
    setFollowStats(prev => {
      if (type === 'followers') {
        return { ...prev, followers: Math.max(0, prev.followers + delta) };
      }
      if (type === 'following') {
        return { ...prev, following: Math.max(0, prev.following + delta) };
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate username if it has changed
      if (profile.username !== initialUsername) {
        // Validate format
        if (!validateUsername(profile.username)) {
          setUsernameError('Username must be 3-30 characters with only lowercase letters, numbers, hyphens, underscores, or dots');
          setMessage({ type: 'error', text: 'Invalid username format' });
          setSaving(false);
          return;
        }

        // Check if username is available
        const isAvailable = await userService.isUsernameAvailable(profile.username, user.uid);
        if (!isAvailable) {
          setUsernameError('Username is already taken');
          setMessage({ type: 'error', text: 'Username is already taken' });
          setSaving(false);
          return;
        }

        await userService.changeUsername(user.uid, profile.username);
        setInitialUsername(profile.username);
      }

      // Update Firestore profile using userService
      await userService.updateUser(user.uid, {
        uid: user.uid,
        email: user.email,
        displayName: profile.displayName,
        bio: profile.bio,
        website: profile.website,
        twitter: profile.twitter,
        github: profile.github,
        linkedin: profile.linkedin,
        username: profile.username,
        photoURL: avatarPreview || user.photoURL || '',
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Refresh the auth state so the header updates immediately
      await refreshSession();
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.message && error.message.includes('already taken')) {
        setUsernameError('Username is already taken');
        setMessage({ type: 'error', text: 'Username is already taken' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    // return (
    //   <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
    //     <div className="text-center">
    //       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
    //         Please sign in to view your profile
    //       </h2>
    //       <a
    //         href="/login"
    //         className="text-blue-600 dark:text-blue-400 hover:underline"
    //       >
    //         Go to Login
    //       </a>
    //     </div>
    //   </div>
    // );
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <CacheDebugPanel />
      
      {/* Header with Cover */}
      <div className="relative bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900 py-8 sm:py-12 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-2xl ring-4 ring-white/50 dark:ring-gray-800/50">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Profile"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl md:text-6xl font-bold text-white">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-2xl bg-black bg-opacity-60 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {profile.displayName || 'User'}
              </h1>
              {profile.username && (
                <p className="text-blue-100 text-lg mb-3">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="text-blue-50 max-w-2xl mb-4">{profile.bio}</p>
              )}
              
              {/* Social Links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://x.com/${profile.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X
                  </a>
                )}
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={() => setShowFollowersModal(true)}
                className="text-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20"
              >
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {followStats.followers}
                </div>
                <p className="text-xs text-blue-100 mt-1">Followers</p>
              </button>
              <button
                onClick={() => setShowFollowingModal(true)}
                className="text-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20"
              >
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {followStats.following}
                </div>
                <p className="text-xs text-blue-100 mt-1">Following</p>
              </button>
              <div className="text-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {postStats.total}
                </div>
                <p className="text-xs text-blue-100 mt-1">Posts</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              My Posts
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xl">
            {/* Profile Photo Section */}
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 bg-linear-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Profile Photo
              </h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-2xl">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-bold text-white">
                        {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                      </span>
                    )}
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 rounded-2xl bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label
                      htmlFor="photo-upload"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 cursor-pointer transition-all duration-300 text-sm"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={uploading}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 text-sm disabled:opacity-50"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Personal Information
              </h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      usernameError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="your-username"
                  />
                  {usernameError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414L8.586 12l-1.293 1.293a1 1 0 101.414 1.414L10 13.414l1.293 1.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293z" clipRule="evenodd" />
                      </svg>
                      {usernameError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    placeholder="Tell us about yourself..."
                    maxLength={160}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {profile.bio.length}/160 characters
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Social Links
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={profile.website}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        X (Twitter)
                      </label>
                      <input
                        type="text"
                        id="twitter"
                        name="twitter"
                        value={profile.twitter}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="@username"
                      />
                    </div>

                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        GitHub
                      </label>
                      <input
                        type="text"
                        id="github"
                        name="github"
                        value={profile.github}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="username"
                      />
                    </div>

                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        id="linkedin"
                        name="linkedin"
                        value={profile.linkedin}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {message.text && (
                <div className={`mt-6 rounded-xl p-4 flex items-center gap-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : message.type === 'info'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : message.type === 'info' ? (
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <p className={`text-sm font-medium ${
                    message.type === 'success' 
                      ? 'text-green-800 dark:text-green-300' 
                      : message.type === 'info'
                      ? 'text-blue-800 dark:text-blue-300'
                      : 'text-red-800 dark:text-red-300'
                  }`}>
                    {message.text}
                  </p>
                </div>
              )}

              <div className="mt-8 flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <span>Saving...</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Post Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Posts</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{postStats.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Published</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{postStats.published}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Drafts</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{postStats.drafts}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Posts</h3>
                <Link
                  href="/blog/new"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                >
                  New Post
                </Link>
              </div>
              
              {recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {post.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                            <span>{TimeUtil.formatDate(post.createdAt)}</span>
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded-full ${
                              post.published
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            }`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No posts yet</p>
                  <Link
                    href="/blog/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Post
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Engagement</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-gray-700 dark:text-gray-300">Followers</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{followStats.followers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-gray-700 dark:text-gray-300">Following</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{followStats.following}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Content</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-gray-700 dark:text-gray-300">Total Posts</span>
                      <span className="font-bold text-gray-900 dark:text-white">{postStats.total}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-gray-700 dark:text-gray-300">Published</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{postStats.published}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-gray-700 dark:text-gray-300">Drafts</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">{postStats.drafts}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h3>
            
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive email updates about your account activity</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Configure
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Privacy</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage who can see your profile and posts</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Manage
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-400 mb-1">Delete Account</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Follow Modals */}
      <FollowListModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={user?.uid}
        type="followers"
        userName={profile.displayName}
        onFollowChange={handleFollowChange}
      />
      <FollowListModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        userId={user?.uid}
        type="following"
        userName={profile.displayName}
        onFollowChange={handleFollowChange}
      />
    </div>
  );
}
