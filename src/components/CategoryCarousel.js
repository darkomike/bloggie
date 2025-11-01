'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function CategoryCarousel({ categories }) {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const isAnimatingRef = useRef(false);

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
      if (!isPaused && !isAnimatingRef.current) {
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

    // Prevent text selection and dragging issues
    const preventDrag = (e) => {
      if (e.button !== 0) return; // Only prevent left mouse button
      isAnimatingRef.current = true;
    };

    const resumeAnimation = () => {
      isAnimatingRef.current = false;
    };

    container.addEventListener('mousedown', preventDrag);
    container.addEventListener('mouseup', resumeAnimation);
    container.addEventListener('mouseleave', resumeAnimation);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      container.removeEventListener('mousedown', preventDrag);
      container.removeEventListener('mouseup', resumeAnimation);
      container.removeEventListener('mouseleave', resumeAnimation);
    };
  }, [isPaused]);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden w-screen -ml-[calc((100vw-100%)/2)] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 w-max transition-none"
        style={{ 
          willChange: 'transform',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitUserDrag: 'none'
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {categories.map((category, index) => (
          <Link
            key={`${category.name}-${index}`}
            href={`/category/${category.name.toLowerCase()}`}
            data-carousel-item
            className={`shrink-0 w-40 sm:w-48 rounded-xl p-4 sm:p-6 text-center transition-all hover:scale-110 hover:shadow-2xl cursor-pointer transform hover:-translate-y-2 select-none ${category.color}`}
            draggable={false}
            style={{ userSelect: 'none', WebkitUserDrag: 'none' }}
          >
            <div className="mb-2 sm:mb-3 flex justify-center [&>svg]:h-8 [&>svg]:w-8 sm:[&>svg]:h-10 sm:[&>svg]:w-10 group-hover:scale-110 transition-transform pointer-events-none">
              {category.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 truncate pointer-events-none">{category.name}</h3>
            <p className="text-xs sm:text-sm opacity-75 pointer-events-none">{category.count} articles</p>
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
