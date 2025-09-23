'use client';

import Link from 'next/link';
import { Book, Network, Pencil, Blocks } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const navItems = [
  {
    label: 'Flashcards',
    icon: Book,
    path: (setID: string) => `/sets/${setID}`,
    match: (pathname: string, setID: string) => pathname === `/sets/${setID}`,
  },
  {
    label: 'Mind Maps',
    icon: Network,
    path: (setID: string) => `/sets/${setID}/mindmaps`,
    match: (pathname: string) => pathname.includes('mindmaps'),
  },
  {
    label: 'Quiz',
    icon: Pencil,
    path: (setID: string) => `/sets/${setID}/quiz`,
    match: (pathname: string) => pathname.includes('quiz'),
  },
  {
    label: 'Blocks',
    icon: Blocks,
    path: (setID: string) => `/sets/${setID}/blocks`,
    match: (pathname: string) => pathname.includes('blocks'),
  },
];

export default function SecondaryNav({ setID }: { setID: string }) {
  const pathname = usePathname();
  const [activeTabStyle, setActiveTabStyle] = useState({ left: 0, width: 0 });
  const [isMounted, setIsMounted] = useState(false); // State to prevent SSR flicker
  const navItemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // Find the index of the currently active navigation item
    const activeIndex = navItems.findIndex(({ match }) => match(pathname, setID));
    
    // Set mounted to true after the initial render on the client
    setIsMounted(true);

    if (activeIndex !== -1) {
      const activeNavItem = navItemRefs.current[activeIndex];
      if (activeNavItem) {
        // Update the style state with its position and width
        setActiveTabStyle({
          left: activeNavItem.offsetLeft,
          width: activeNavItem.offsetWidth,
        });
      }
    }
  }, [pathname, setID]);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 w-full sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-center">
          <ul className="relative flex items-center gap-2 sm:gap-3 md:gap-4 py-2">
            {navItems.map(({ label, icon: Icon, path, match }, index) => {
              const href = setID ? path(setID) : '#';
              const isActive = match(pathname, setID);

              return (
                <li
                  key={label}
                  // THE FIX: Use a block body `{...}` to ensure the function implicitly returns `void`.
                  ref={(el) => {
                    navItemRefs.current[index] = el;
                  }}
                >
                  <Link
                    href={href}
                    className={`
                      flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-lg
                      font-semibold text-sm sm:text-base transition-all duration-200 ease-in-out
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
                      ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                      }
                    `}
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                </li>
              );
            })}

            <div
              className={`
                absolute -bottom-2 h-1 rounded-full bg-blue-500
                transition-all duration-300 ease-in-out
                ${/* SSR OPTIMIZATION: Hide the bar until the client has mounted and calculated the position */''}
                ${isMounted && activeTabStyle.width > 0 ? 'opacity-100' : 'opacity-0'}
              `}
              style={{
                left: activeTabStyle.left,
                width: activeTabStyle.width,
              }}
            />
          </ul>
        </nav>
      </div>
    </div>
  );
}