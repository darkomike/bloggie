import SignupForm from '@/components/SignupForm';
import Link from 'next/link';

export const metadata = {
  title: 'Sign Up - Bloggie',
  description: 'Create a new Bloggie account',
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            Bloggie
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join our community of writers and readers today.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
