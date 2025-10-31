'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';

export default function LoadingDemo() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after 3 seconds (for demo purposes)
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return <LoadingScreen />;
}
