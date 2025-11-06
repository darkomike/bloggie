/**
 * Signup API route - Creates a new user account
 * Refactored following SOLID principles
 */

import { db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { passwordUtils } from '@/lib/auth/passwordUtils';
import { jwtUtils } from '@/lib/auth/jwtUtils';
import { authConfig } from '@/lib/auth/authConfig';
import { cookies } from 'next/headers';
import { generateUniqueUsername } from '@/lib/usernameUtils';
import { ValidationUtil } from '@/utils/validationUtils';
import { ResponseFormatter } from '@/utils/responseFormatter';
import { ErrorHandler } from '@/utils/errorHandler';

/**
 * Validate signup data
 * Single Responsibility: Only handles validation
 */
function validateSignupData(data) {
  const errors = {};

  if (!data.email || !ValidationUtil.isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.password || !ValidationUtil.isValidPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (data.username && !ValidationUtil.isValidUsername(data.username)) {
    errors.username = 'Username must be 3-20 alphanumeric characters or underscores';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Check if user exists
 * Single Responsibility: Only checks existence
 */
async function checkUserExists(email, username = null) {
  const usersRef = collection(db, 'users');

  // Check email
  const emailQuery = query(usersRef, where('email', '==', email));
  const existingByEmail = await getDocs(emailQuery);

  if (!existingByEmail.empty) {
    return { exists: true, field: 'email' };
  }

  // Check username if provided
  if (username) {
    const usernameQuery = query(usersRef, where('username', '==', username.toLowerCase()));
    const existingByUsername = await getDocs(usernameQuery);

    if (!existingByUsername.empty) {
      return { exists: true, field: 'username' };
    }
  }

  return { exists: false };
}

/**
 * Create user in database
 * Single Responsibility: Only handles user creation
 */
async function createUser(email, password, displayName, username) {
  const hashedPassword = await passwordUtils.hash(password);
  const userId = email.split('@')[0] + '_' + Date.now();
  const userRef = doc(db, 'users', userId);

  await setDoc(userRef, {
    uid: userId,
    email,
    username,
    displayName: displayName || '',
    passwordHash: hashedPassword,
    bio: '',
    website: '',
    twitter: '',
    github: '',
    linkedin: '',
    photoURL: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userId;
}

/**
 * Create user session
 * Single Responsibility: Only handles session creation
 */
async function createSession(userId, email, username, displayName) {
  const token = jwtUtils.sign({
    userId,
    email,
    username,
    displayName,
  });

  const cookieStore = await cookies();
  cookieStore.set(authConfig.COOKIE_NAME, token, authConfig.COOKIE_OPTIONS);

  return {
    uid: userId,
    id: userId,
    email,
    username,
    displayName,
  };
}

export async function POST(request) {
  try {
    const { email, password, displayName, username } = await request.json();

    // Validate input
    const validation = validateSignupData({ email, password, username });
    if (!validation.isValid) {
      return ResponseFormatter.validationError(validation.errors);
    }

    // Determine final username
    const finalUsername = username 
      ? username.toLowerCase().trim()
      : await generateUniqueUsername(email);

    // Check if user exists
    const userExists = await checkUserExists(email, finalUsername);
    if (userExists.exists) {
      const message = userExists.field === 'email'
        ? 'User already exists with this email'
        : 'Username is already taken';
      return ResponseFormatter.badRequest(message);
    }

    // Create user
    const userId = await createUser(email, password, displayName, finalUsername);

    // Create session
    const user = await createSession(userId, email, finalUsername, displayName || '');

    return ResponseFormatter.created(
      { user },
      'Account created successfully'
    );
  } catch (error) {
    ErrorHandler.logError('Signup', error);
    const { message } = ErrorHandler.handleFirebaseError(error);
    return ResponseFormatter.serverError(message, error);
  }
}
