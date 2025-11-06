/**
 * Login API route - Authenticates a user by email or username and returns a JWT token
 * Refactored following SOLID principles
 */

import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { passwordUtils } from '@/lib/auth/passwordUtils';
import { jwtUtils } from '@/lib/auth/jwtUtils';
import { authConfig } from '@/lib/auth/authConfig';
import { cookies } from 'next/headers';
import { ValidationUtil } from '@/utils/validationUtils';
import { ResponseFormatter } from '@/utils/responseFormatter';
import { ErrorHandler } from '@/utils/errorHandler';

/**
 * Authenticate user credentials
 * Single Responsibility: Only handles authentication logic
 */
async function authenticateUser(emailOrUsername, password) {
  // Find user by email or username
  const usersRef = collection(db, 'users');
  const isEmail = ValidationUtil.isValidEmail(emailOrUsername);
  
  const q = isEmail
    ? query(usersRef, where('email', '==', emailOrUsername))
    : query(usersRef, where('username', '==', emailOrUsername.toLowerCase()));
  
  const userSnapshot = await getDocs(q);

  if (userSnapshot.empty) {
    return null;
  }

  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();

  // Verify password
  const passwordMatch = await passwordUtils.compare(password, userData.passwordHash);

  if (!passwordMatch) {
    return null;
  }

  return userData;
}

/**
 * Create user session
 * Single Responsibility: Only handles session creation
 */
async function createSession(userData) {
  const token = jwtUtils.sign({
    userId: userData.uid,
    email: userData.email,
    username: userData.username,
    displayName: userData.displayName,
  });

  const cookieStore = await cookies();
  cookieStore.set(authConfig.COOKIE_NAME, token, authConfig.COOKIE_OPTIONS);

  return {
    uid: userData.uid,
    id: userData.uid,
    email: userData.email,
    username: userData.username,
    displayName: userData.displayName,
  };
}

export async function POST(request) {
  try {
    const { emailOrUsername, password } = await request.json();

    // Validation
    const { isValid, errors } = ValidationUtil.validateRequired(
      { emailOrUsername, password },
      ['emailOrUsername', 'password']
    );

    if (!isValid) {
      return ResponseFormatter.validationError(errors);
    }

    // Authenticate user
    const userData = await authenticateUser(emailOrUsername, password);

    if (!userData) {
      return ResponseFormatter.unauthorized('Invalid email/username or password');
    }

    // Create session
    const user = await createSession(userData);

    return ResponseFormatter.success(
      { user },
      'Login successful'
    );
  } catch (error) {
    ErrorHandler.logError('Login', error);
    const { message } = ErrorHandler.handleFirebaseError(error);
    return ResponseFormatter.serverError(message, error);
  }
}
