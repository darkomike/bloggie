/**
 * Auth State Storage Service
 * Manages persistent auth state using cookies and localStorage
 * Enables instant header rendering on page load (zero layout shift)
 * Syncs auth state across browser tabs using storage events
 */

const AUTH_COOKIE_KEY = 'auth_state_v1';
const AUTH_STORAGE_KEY = 'auth_state';
const AUTH_EVENT_CHANNEL = 'auth_state_change';

// In-memory cache for quick access
let authStateCache = null;
let authEventListeners = [];

/**
 * Serialize auth state for storage
 */
export function serializeAuthState(user) {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    timestamp: Date.now(),
  };
}

/**
 * Save auth state to cookies and localStorage
 * Called after successful login/signup or on auth state change
 */
export function saveAuthState(user) {
  const authState = serializeAuthState(user);
  
  if (authState) {
    // Save to localStorage for cross-tab sync and quick access
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    } catch (e) {
      console.warn('Failed to save auth state to localStorage:', e);
    }
    
    // Save to cookies for server-side access and persistence
    try {
      document.cookie = `${AUTH_COOKIE_KEY}=${JSON.stringify(authState)}; path=/; SameSite=Strict`;
    } catch (e) {
      console.warn('Failed to save auth state to cookie:', e);
    }
  } else {
    // Clear both storage and cookies on logout
    clearAuthState();
  }
  
  // Update cache
  authStateCache = authState;
  
  // Broadcast change to all listeners
  broadcastAuthStateChange(authState);
}

/**
 * Load auth state from localStorage or cookies
 * Used on page load for instant header rendering
 */
export function loadAuthState() {
  // Return cached state if available
  if (authStateCache !== null) {
    return authStateCache;
  }
  
  try {
    // Try localStorage first (faster, cross-tab sync)
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      authStateCache = JSON.parse(stored);
      return authStateCache;
    }
  } catch (e) {
    console.warn('Failed to load auth state from localStorage:', e);
  }
  
  try {
    // Fallback to cookie parsing
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(AUTH_COOKIE_KEY))
      ?.split('=')[1];
    
    if (cookieValue) {
      authStateCache = JSON.parse(decodeURIComponent(cookieValue));
      return authStateCache;
    }
  } catch (e) {
    console.warn('Failed to load auth state from cookie:', e);
  }
  
  authStateCache = null;
  return null;
}

/**
 * Clear auth state from all storage
 */
export function clearAuthState() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
  }
  
  try {
    document.cookie = `${AUTH_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict`;
  } catch (e) {
    console.warn('Failed to clear cookie:', e);
  }
  
  authStateCache = null;
  broadcastAuthStateChange(null);
}

/**
 * Subscribe to auth state changes
 * Used by Header and other components to stay in sync
 */
export function onAuthStateChange(callback) {
  authEventListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    authEventListeners = authEventListeners.filter((listener) => listener !== callback);
  };
}

/**
 * Broadcast auth state change to all listeners
 */
function broadcastAuthStateChange(authState) {
  authEventListeners.forEach((callback) => {
    try {
      callback(authState);
    } catch (e) {
      console.error('Error in auth state listener:', e);
    }
  });
  
  // Also dispatch custom event for cross-window sync
  const event = new CustomEvent(AUTH_EVENT_CHANNEL, {
    detail: { authState },
  });
  window.dispatchEvent(event);
}

/**
 * Setup cross-tab sync using storage events
 * Called once on app initialization
 */
export function setupCrossTabSync() {
  // Listen for localStorage changes in other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === AUTH_STORAGE_KEY) {
      try {
        authStateCache = event.newValue ? JSON.parse(event.newValue) : null;
        broadcastAuthStateChange(authStateCache);
      } catch (e) {
        console.warn('Failed to parse storage event auth state:', e);
      }
    }
  });
  
  // Listen for custom auth events from other tabs
  window.addEventListener(AUTH_EVENT_CHANNEL, (event) => {
    authStateCache = event.detail.authState;
    // Event already broadcast by originating tab
  });
}

/**
 * Get cached auth state synchronously
 * Useful for non-React code that needs instant access
 */
export function getCachedAuthState() {
  if (authStateCache !== null) {
    return authStateCache;
  }
  return loadAuthState();
}

/**
 * Check if user is authenticated (cached)
 */
export function isAuthenticatedSync() {
  const state = getCachedAuthState();
  return state !== null && state.uid !== undefined;
}
