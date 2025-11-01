'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function CategoryCarousel({ categories }) {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Clone items for seamless infinite scroll
    const items = container.querySelectorAll('[data-carousel-item]');
    items.forEach(item => {
      const clone = item.cloneNode(true);
      container.appendChild(clone);
    });

    let animationId = null;
    const scrollSpeed = 1.5; // pixels per frame - increased from 0.5 for faster speed

    const animate = () => {
      if (!isPaused) {
        scrollPositionRef.current += scrollSpeed;
        
        // Reset scroll position for seamless loop
        if (scrollPositionRef.current >= container.scrollWidth / 2) {
          scrollPositionRef.current = 0;
        }
        
        container.style.transform = `translateX(-${scrollPositionRef.current}px)`;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPaused]);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden w-screen -ml-[calc((100vw-100%)/2)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 w-max transition-none"
        style={{ willChange: 'transform' }}
      >
        {categories.map((category, index) => (
          <Link
            key={`${category.name}-${index}`}
            href={`/category/${category.name.toLowerCase()}`}
            data-carousel-item
            className={`shrink-0 w-40 sm:w-48 rounded-xl p-4 sm:p-6 text-center transition-all hover:scale-110 hover:shadow-2xl cursor-pointer transform hover:-translate-y-2 ${category.color}`}
          >
            <div className="mb-2 sm:mb-3 flex justify-center [&>svg]:h-8 [&>svg]:w-8 sm:[&>svg]:h-10 sm:[&>svg]:w-10 group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 truncate">{category.name}</h3>
            <p className="text-xs sm:text-sm opacity-75">{category.count} articles</p>
          </Link>
        ))}
      </div>

      {/* Left fade gradient */}
      <div className="absolute left-0 top-0 h-full w-12 bg-linear-to-r from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
      
      {/* Right fade gradient */}
      <div className="absolute right-0 top-0 h-full w-12 bg-linear-to-l from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
    </div>
  );
}
