import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  items: NavItem[];
  userRole?: 'admin' | 'cousin' | null;
  userImage?: string;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  items,
  userRole,
  userImage,
  userName,
}) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-blue-600">Family Gacha THR</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-b-2 border-indigo-500 text-gray-900 dark:text-white dark:border-indigo-400'
                        : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                    )}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {userRole && (
              <div className="relative ml-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {userName || 'User'}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    {userRole === 'admin' ? 'Admin' : 'Cousin'}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                    {userImage ? (
                      <img src={userImage} alt={userName || 'User'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-600">
                        {(userName?.charAt(0) || 'U').toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("sm:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <div className="space-y-1 pt-2 pb-3">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                  isActive
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/20 dark:hover:text-white'
                )}
              >
                <div className="flex items-center">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.title}
                </div>
              </Link>
            );
          })}
        </div>
        {userRole && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-3">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                  {userImage ? (
                    <img src={userImage} alt={userName || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-600">
                      {(userName?.charAt(0) || 'U').toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">{userName || 'User'}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {userRole === 'admin' ? 'Admin' : 'Cousin'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}; 