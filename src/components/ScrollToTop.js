'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Don't show on blog pages (they have their own scroll to top)
  const isBlogPage = pathname?.startsWith('/blog/');
  if (isBlogPage) return null;

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 dark:bg-blue-500 dark:hover:bg-blue-600"
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16l-4-4m0 0l4-4m-4 4h18"
            transform="rotate(90 12 12)"
          />
        </svg>
      </button>
    )
  );
}
