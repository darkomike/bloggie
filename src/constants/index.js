/**
 * Application Constants
 * Centralized constants following DRY principle
 */

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

export const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid email/username or password',
  EMAIL_EXISTS: 'User already exists with this email',
  USERNAME_TAKEN: 'Username is already taken',
  
  // Validation
  REQUIRED_FIELD: (field) => `${field} is required`,
  INVALID_EMAIL: 'Invalid email address',
  INVALID_USERNAME: 'Username must be 3-20 alphanumeric characters or underscores',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  INVALID_URL: 'Invalid URL format',
  
  // Resources
  NOT_FOUND: (resource) => `${resource} not found`,
  ALREADY_EXISTS: (resource) => `${resource} already exists`,
  
  // Operations
  CREATE_FAILED: (resource) => `Failed to create ${resource}`,
  UPDATE_FAILED: (resource) => `Failed to update ${resource}`,
  DELETE_FAILED: (resource) => `Failed to delete ${resource}`,
  FETCH_FAILED: (resource) => `Failed to fetch ${resource}`,
  
  // Generic
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  SERVER_ERROR: 'Internal server error',
};

export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  SIGNUP_SUCCESS: 'Account created successfully',
  
  // Operations
  CREATE_SUCCESS: (resource) => `${resource} created successfully`,
  UPDATE_SUCCESS: (resource) => `${resource} updated successfully`,
  DELETE_SUCCESS: (resource) => `${resource} deleted successfully`,
  
  // Profile
  PROFILE_UPDATED: 'Profile updated successfully',
  PHOTO_UPDATED: 'Profile photo updated successfully',
  PHOTO_REMOVED: 'Profile photo removed successfully',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  BLOG: '/blog',
  ABOUT: '/about',
  CONTACT: '/contact',
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
  },
  UPLOAD: '/api/upload',
  CONTACT: '/api/contact',
  NEWSLETTER: '/api/newsletter',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const CACHE_KEYS = {
  POSTS: 'POSTS',
  USERS: 'USERS',
  COMMENTS: 'COMMENTS',
  LIKES: 'LIKES',
  VIEWS: 'VIEWS',
  FOLLOWS: 'FOLLOWS',
};
