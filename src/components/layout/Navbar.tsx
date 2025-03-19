'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeProvider';
import { User, getUserAvatar, getUserDisplayName, getUserRoleName } from '@/utils/userTypes';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  adminOnly?: boolean;
}

interface NavbarProps {
  items?: NavItem[];
  logo?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  items = defaultNavItems,
  logo = '/logo.svg',
}) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user: authUser, signOut } = useAuth();
  
  // Cast the user to our extended User interface
  const user = authUser as User | null;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Filter items based on user role
  const filteredItems = items.filter(item => {
    if (item.adminOnly && (!user || user.role !== 'admin')) {
      return false;
    }
    return true;
  });

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md dark:bg-gray-900/90"
          : "bg-transparent dark:bg-transparent"
      )}
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center hover:opacity-80 transition-opacity"
              aria-label="Home"
            >
              <div className="relative h-8 w-8 mr-2">
                <Image
                  src={logo}
                  alt="Family Gacha THR Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className={cn(
                "text-xl font-bold transition-colors duration-300",
                isScrolled 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-blue-600 dark:text-white"
              )}>
                Family Gacha THR
              </span>
            </Link>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {filteredItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-all duration-300",
                      isActive
                        ? "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30"
                        : "text-gray-700 hover:text-blue-700 hover:bg-blue-50/70 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.title}
                    {isActive && (
                      <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User section */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="relative flex items-center">
                <UserMenu user={user} signOut={signOut} />
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            {/* Mobile Theme Toggle */}
            <ThemeToggle className="mr-2" />
            
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center rounded-md p-2 transition-colors",
                isScrolled ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" : 
                "text-gray-700 hover:bg-white/20 dark:text-white dark:hover:bg-gray-800/30"
              )}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        id="mobile-menu"
        className={cn(
          "sm:hidden transition-all duration-300 overflow-hidden",
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-1 px-4 pt-2 pb-3">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-base font-medium",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon && <span className="mr-3 h-5 w-5">{item.icon}</span>}
                {item.title}
              </Link>
            );
          })}
        </div>
        
        {user ? (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-3">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={getUserAvatar(user)}
                    alt={getUserDisplayName(user)}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">{getUserDisplayName(user)}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <Link 
                href="/profile"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300"
              >
                Your Profile
              </Link>
              <Link 
                href="/settings"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300"
              >
                Settings
              </Link>
              <button
                onClick={() => signOut()}
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-red-300"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-3 px-4 flex flex-col space-y-3">
            <Link
              href="/signin"
              className="block text-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="block text-center rounded-md px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// User menu component with typed user prop
const UserMenu = ({ user, signOut }: { user: User, signOut: () => Promise<void> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1 transition-all"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getUserDisplayName(user)}</span>
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
          {getUserRoleName(user)}
        </span>
        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800">
          <Image
            src={getUserAvatar(user)}
            alt={getUserDisplayName(user)}
            fill
            className="object-cover"
            priority
          />
        </div>
        <svg className={cn("h-5 w-5 text-gray-400 transition-transform", isOpen && "rotate-180")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div 
        className={cn(
          "absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 z-10",
          isOpen 
            ? "transform opacity-100 scale-100" 
            : "transform opacity-0 scale-95 pointer-events-none"
        )}
        role="menu"
        aria-orientation="vertical"
      >
        <div className="py-1" role="none">
          <Link 
            href="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" 
            role="menuitem"
          >
            Your Profile
          </Link>
          <Link 
            href="/settings" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" 
            role="menuitem"
          >
            Settings
          </Link>
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-red-400"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

// Default navigation items
const defaultNavItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    title: 'Game',
    href: '/game',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 4.126-.33c-.206-1.536-.324-3.094-.354-4.666a.637.637 0 0 1 .649-.645v0c.357 0 .678.186.961.401.291.221.634.349 1.003.349 1.035 0 1.875-1.007 1.875-2.25s-.84-2.25-1.875-2.25c-.37 0-.713.128-1.003.349-.283.215-.604.401-.961.401v0a.636.636 0 0 1-.649-.645 48.227 48.227 0 0 0-.312-4.685 48.28 48.28 0 0 0-4.127-.33.618.618 0 0 1-.61.58v0Z" />
      </svg>
    ),
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
      </svg>
    ),
    adminOnly: true,
  },
]; 