/**
 * Enhanced Navbar Component with SDG Theming
 * 
 * A responsive navigation bar with SDG theme support, mobile menu,
 * and accessibility features for the Youth Green Jobs Hub.
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, Bell, ChevronDown } from 'lucide-react';
import type { SDGTheme, SDGNavItem } from '../../types/sdg';
import { getSDGTailwindClasses } from '../../config/sdgThemes';
import { useAuth } from '../../contexts/AuthContext';
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
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, getFullName, getInitials } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const tailwindClasses = getSDGTailwindClasses(theme);

  // Handle logout with redirect to homepage
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
    setIsNotificationMenuOpen(false); // Close notifications when opening user menu
  };

  const toggleNotificationMenu = () => {
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
    setIsUserMenuOpen(false); // Close user menu when opening notifications
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container') && !target.closest('.notification-menu-container')) {
        setIsUserMenuOpen(false);
        setIsNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
              <div className="relative notification-menu-container">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleNotificationMenu();
                  }}
                  className={clsx(
                    'relative p-2 rounded-full transition-colors cursor-pointer z-10',
                    'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500',
                    isNotificationMenuOpen && 'bg-gray-100'
                  )}
                  aria-label="Notifications"
                  aria-expanded={isNotificationMenuOpen}
                  aria-haspopup="true"
                  type="button"
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

                {/* Notification dropdown menu */}
                {isNotificationMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>

                    {notificationCount > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        {/* Sample notifications - replace with real data */}
                        <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm text-gray-900">Your waste report has been processed</p>
                              <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm text-gray-900">New collection event near you</p>
                              <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm text-gray-900">Credits earned: 50 points</p>
                              <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No new notifications</p>
                      </div>
                    )}

                    <div className="px-4 py-2 border-t border-gray-100">
                      <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User menu or auth buttons */}
            {isAuthenticated ? (
              <div className="relative user-menu-container">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleUserMenu();
                  }}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer z-10',
                    'text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500',
                    isUserMenuOpen && 'bg-gray-100'
                  )}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  type="button"
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
                  <ChevronDown className={clsx(
                    'w-4 h-4 transition-transform',
                    isUserMenuOpen && 'rotate-180'
                  )} />
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
          {isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  {user?.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                      {getInitials()}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{getFullName()}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
                {showNotifications && notificationCount > 0 && (
                  <div className="ml-auto">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleNotificationMenu();
                        closeMobileMenu();
                      }}
                      className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 z-10"
                    >
                      <Bell className="w-6 h-6" />
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 px-2 space-y-1">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={closeMobileMenu}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
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
