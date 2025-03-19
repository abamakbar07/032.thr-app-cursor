import React, { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SidebarItem {
  title: string;
  href: string;
  icon?: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: SidebarItem[];
  activePath?: string;
  navItems: { title: string; href: string; icon?: ReactNode }[];
  userRole?: 'admin' | 'cousin' | null;
  userName?: string;
  userImage?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarItems,
  activePath,
  navItems,
  userRole,
  userName,
  userImage,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)]">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dashboard</h2>
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = activePath === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/20'
                    )}
                  >
                    {item.icon && <span className="mr-3">{item.icon}</span>}
                    {item.title}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}; 