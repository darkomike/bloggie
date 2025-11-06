/**
 * Logout API route - Clears the auth token cookie
 */

import { authConfig } from '@/lib/auth/authConfig';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(authConfig.COOKIE_NAME);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to logout' }),
      { status: 500 }
    );
  }
}
