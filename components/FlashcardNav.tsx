
'use client';

import Link from 'next/link';
import { Book, Network, Pencil, Blocks } from 'lucide-react';
import { usePathname } from 'next/navigation';

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

  return (
  <div className="border-b bg-white">
      <div className="container mx-auto px-2 md:px-4">
        <nav className="overflow-x-auto">
          <ul className="flex items-center justify-center gap-2 md:gap-4 py-3 w-full">
            {navItems.map(({ label, icon: Icon, path, match }, idx) => {
              const href = setID ? path(setID) : '#';
              const isActive = typeof match === 'function' ? match(pathname, setID) : false;
              return (
                <li key={label} className="relative">
                  <Link
                    href={href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-150
                      ${isActive
                        ? 'bg-blue-200 text-blue-900 shadow-lg'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900'}
                    `}
                    aria-label={label}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-semibold text-base">{label}</span>
                  </Link>
                  {isActive && (
                    <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-2/3 h-1 bg-blue-300 rounded-full animate-pulse" />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}