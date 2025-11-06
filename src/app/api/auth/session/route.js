/**
 * Session API route - Gets the current user's session
 */

import { jwtUtils } from '@/lib/auth/jwtUtils';
import { authConfig } from '@/lib/auth/authConfig';
import { userService } from '@/lib/firebase/user-service';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authConfig.COOKIE_NAME)?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ user: null }),
        { status: 200 }
      );
    }

    // Verify and decode token
    const decoded = jwtUtils.verify(token);

    if (!decoded) {
      return new Response(
        JSON.stringify({ user: null }),
        { status: 200 }
      );
    }

    // Fetch complete user profile from Firestore to get photoURL and other fields
    // Use getUserByIdFresh to bypass cache and always get latest data
    try {
      const userProfile = await userService.getUserByIdFresh(decoded.userId);
      
      console.log('Session API - Fetched user profile:', {
        userId: decoded.userId,
        hasPhotoURL: !!userProfile?.photoURL,
        photoURL: userProfile?.photoURL,
      });
      
      return new Response(
        JSON.stringify({
          user: {
            uid: decoded.userId,
            id: decoded.userId,
            email: decoded.email,
            username: decoded.username,
            displayName: decoded.displayName,
            photoURL: userProfile?.photoURL || null,
            bio: userProfile?.bio || '',
            website: userProfile?.website || '',
            twitter: userProfile?.twitter || '',
            github: userProfile?.github || '',
            linkedin: userProfile?.linkedin || '',
          },
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    } catch (profileError) {
      console.warn('Could not fetch user profile, returning basic info:', profileError);
      
      // Fall back to basic user info if Firestore fetch fails
      return new Response(
        JSON.stringify({
          user: {
            uid: decoded.userId,
            id: decoded.userId,
            email: decoded.email,
            username: decoded.username,
            displayName: decoded.displayName,
            photoURL: null,
          },
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Session error:', error);
    return new Response(
      JSON.stringify({ user: null }),
      { status: 200 }
    );
  }
}
