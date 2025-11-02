import LoginForm from '@/components/LoginForm';
import Link from 'next/link';
import { Suspense } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

export const metadata = {
  title: 'Sign In - Bloggie',
  description: 'Sign in to your Bloggie account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            Bloggie
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Please enter your details.
          </p>
        </div>
        <Suspense fallback={<LoadingScreen />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
