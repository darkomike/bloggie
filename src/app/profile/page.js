'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { updateProfile } from 'firebase/auth';
import { uploadUserAvatar, deleteBlob } from '@/lib/vercel-blob-service';
import { followService } from '@/lib/firebase/follow-service';
import { userService } from '@/lib/firebase/user-service';
import { validateUsername } from '@/lib/usernameUtils';
import FollowListModal from '@/components/FollowListModal';
import CacheDebugPanel from '@/components/CacheDebugPanel';

export default function ProfilePage() {
  const { user } = useAuth();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [usernameError, setUsernameError] = useState('');

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
        } else {
          // Document doesn't exist, set default values from auth
          setProfile(prev => ({ 
            ...prev, 
            displayName: user.displayName || '' 
          }));
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 2MB as shown in UI)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      setMessage({ type: 'error', text: `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max size is 2MB.` });
      return;
    }

    setUploading(true);
    try {
      console.log(`Starting upload for file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // Delete old avatar if exists
      if (user.photoURL) {
        try {
          console.log('Deleting old avatar:', user.photoURL);
          await deleteBlob(user.photoURL);
          console.log('Old avatar deleted successfully');
        } catch (err) {
          console.warn('Could not delete old avatar:', err);
        }
      }

      console.log('Uploading new avatar...');
      const photoURL = await uploadUserAvatar(file, user.uid);
      console.log('Avatar uploaded successfully:', photoURL);

      // Update Firebase Auth profile
      await updateProfile(user, { photoURL });
      console.log('Firebase Auth profile updated');
      
      // Update Firestore profile using userService
      await userService.updateUser(user.uid, {
        photoURL,
      });
      console.log('Firestore profile updated');

      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      const errorMessage = error.message || 'Failed to upload image. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setUploading(false);
      // Clear file input
      e.target.value = '';
    }
  };

  const handleFollowChange = ({ type, action }) => {
    // Update the follow stats when user unfollows someone
    setFollowStats(prev => {
      if (type === 'followers') {
        return { ...prev, followers: Math.max(0, prev.followers - 1) };
      } else if (type === 'following') {
        return { ...prev, following: Math.max(0, prev.following - 1) };
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
          setSaving(false);
          return;
        }

        // Check if username is available
        const isAvailable = await userService.isUsernameAvailable(profile.username, user.uid);
        if (!isAvailable) {
          setUsernameError('Username is already taken');
          setSaving(false);
          return;
        }

        // Update username
        await userService.changeUsername(user.uid, profile.username);
      }

      // Update Firebase Auth profile
      if (profile.displayName !== user.displayName) {
        await updateProfile(user, { displayName: profile.displayName });
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
        photoURL: user.photoURL || '',
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
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
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to view your profile
          </h2>
          <a
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <CacheDebugPanel />
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900 py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4 md:mb-6">
            Profile Settings
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100">
            Manage your account information and customize your profile
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
        {/* Follow Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10">
          <button
            onClick={() => setShowFollowersModal(true)}
            className="group bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 md:p-7 border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
              {followStats.followers}
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2 sm:mt-3 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
              Followers
            </p>
          </button>
          <button
            onClick={() => setShowFollowingModal(true)}
            className="group bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 md:p-7 border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {followStats.following}
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2 sm:mt-3 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
              Following
            </p>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xl dark:shadow-2xl">
          {/* Profile Photo Section */}
          <div className="p-6 sm:p-8 md:p-10 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 flex items-center gap-3">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Profile Photo
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-2xl">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                      {user.displayName?.[0] || user.email?.[0] || 'U'}
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
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 cursor-pointer transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  <svg className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Change Photo
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Personal Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Update your profile details
            </p>

            <div className="space-y-6">
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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
                  Email cannot be changed for security reasons
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
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                    usernameError
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                  placeholder="your-username"
                />
                {usernameError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {usernameError}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  3-30 characters, lowercase letters, numbers, hyphens, underscores, and dots allowed
                </p>
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300"
                  placeholder="Tell us about yourself..."
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {profile.bio.length}/160 characters
                </p>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  Social Links
                </h3>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="website" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-6l6-6m0 0L9 9" />
                        </svg>
                        Website
                      </span>
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={profile.website}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="twitter" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                        Twitter
                      </span>
                    </label>
                    <input
                      type="text"
                      id="twitter"
                      name="twitter"
                      value={profile.twitter}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label htmlFor="github" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                      </span>
                    </label>
                    <input
                      type="text"
                      id="github"
                      name="github"
                      value={profile.github}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        LinkedIn
                      </span>
                    </label>
                    <input
                      type="text"
                      id="linkedin"
                      name="linkedin"
                      value={profile.linkedin}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            </div>

            {message.text && (
              <div className={`mt-8 rounded-xl p-5 flex items-center gap-3 animate-in fade-in duration-300 ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <p className={`text-sm font-medium ${
                  message.type === 'success'
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                }`}>
                  {message.text}
                </p>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {saving ? (
                  <>
                    <span>Saving...</span>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <a
                href="/dashboard"
                className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
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
