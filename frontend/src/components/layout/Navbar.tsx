/**
 * Enhanced Navbar Component with SDG Theming
 * 
 * A responsive navigation bar with SDG theme support, mobile menu,
 * and accessibility features for the Youth Green Jobs Hub.
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, Bell, User, ChevronDown } from 'lucide-react';
import type { SDGTheme, SDGNavItem } from '../../types/sdg';
import { getSDGTailwindClasses } from '../../config/sdgThemes';
import { useAuth } from '../../hooks/useAuth';
import { clsx } from 'clsx';

interface NavbarProps {
  theme?: SDGTheme;
  className?: string;
  showNotifications?: boolean;
  notificationCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({
  theme = 'climate-action',
  className = '',
  showNotifications = true,
  notificationCount = 0,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, getFullName, getInitials } = useAuth();
  const location = useLocation();
  const tailwindClasses = getSDGTailwindClasses(theme);

  // Navigation items
  const publicNavItems: SDGNavItem[] = [
    { name: 'Home', href: '/', theme: 'climate-action' },
    { name: 'About', href: '/about', theme: 'sustainable-cities' },
    { name: 'Services', href: '/services', theme: 'decent-work' },
    { name: 'Contact', href: '/contact', theme: 'default' },
  ];

  const authenticatedNavItems: SDGNavItem[] = [
    { name: 'Dashboard', href: '/dashboard', theme: 'climate-action' },
    { name: 'Waste Collection', href: '/dashboard/waste', theme: 'climate-action' },
    { name: 'Eco Products', href: '/dashboard/products', theme: 'decent-work' },
    { name: 'Analytics', href: '/dashboard/analytics', theme: 'sustainable-cities' },
  ];

  const userMenuItems = [
    { name: 'Profile', href: '/dashboard/profile' },
    { name: 'Settings', href: '/dashboard/settings' },
    { name: 'Help', href: '/help' },
  ];

  const isActiveLink = (href: string) => {
    return location.pathname === href || 
           (href !== '/' && location.pathname.startsWith(href));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={clsx(
      'bg-white shadow-md border-b-2',
      tailwindClasses.border.primary,
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-bold"
              onClick={closeMobileMenu}
            >
              <div className={clsx(
                'p-2 rounded-lg',
                tailwindClasses.bg.primary,
                'text-white'
              )}>
                <Leaf className="w-6 h-6" />
              </div>
              <span className={tailwindClasses.text.primary}>
                Youth Green Jobs Hub
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {(isAuthenticated ? authenticatedNavItems : publicNavItems).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActiveLink(item.href)
                      ? clsx(tailwindClasses.bg.primary, 'text-white')
                      : clsx(
                          'text-gray-700 hover:text-gray-900',
                          tailwindClasses.bg.light.replace('bg-', 'hover:bg-')
                        )
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            {isAuthenticated && showNotifications && (
              <button
                className={clsx(
                  'relative p-2 rounded-full transition-colors',
                  'text-gray-600 hover:text-gray-900',
                  tailwindClasses.bg.light.replace('bg-', 'hover:bg-')
                )}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className={clsx(
                    'absolute -top-1 -right-1 inline-flex items-center justify-center',
                    'px-2 py-1 text-xs font-bold leading-none text-white',
                    'bg-red-500 rounded-full'
                  )}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* User menu or auth buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium',
                    'text-gray-700 transition-colors',
                    tailwindClasses.bg.light.replace('bg-', 'hover:bg-')
                  )}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  {user?.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                      {getInitials()}
                    </div>
                  )}
                  <span className="hidden sm:block">{getFullName()}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className={clsx(
                    'px-4 py-2 text-sm font-medium rounded-md text-white transition-colors',
                    tailwindClasses.bg.primary,
                    tailwindClasses.bg.primaryHover
                  )}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {(isAuthenticated ? authenticatedNavItems : publicNavItems).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                  isActiveLink(item.href)
                    ? clsx(tailwindClasses.bg.primary, 'text-white')
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                )}
                onClick={closeMobileMenu}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile auth section */}
          {!isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-2 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className={clsx(
                    'block px-3 py-2 rounded-md text-base font-medium text-white',
                    tailwindClasses.bg.primary
                  )}
                  onClick={closeMobileMenu}
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
