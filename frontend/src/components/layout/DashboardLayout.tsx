import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Leaf,
  Home,
  User,
  Recycle,
  ShoppingBag,
  BarChart3,
  LogOut,
  Bell,
  Settings,
  Package,
  MapPin,
  Calendar,
  Coins,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isWastePathActive = () => {
    return location.pathname.startsWith('/dashboard/waste');
  };

  const [wasteMenuOpen, setWasteMenuOpen] = useState(isWastePathActive());
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleNotificationMenu = () => {
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsNotificationMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dashboard-notification-menu') && !target.closest('.dashboard-user-menu')) {
        setIsNotificationMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Eco Products', href: '/dashboard/products', icon: ShoppingBag },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ];

  const wasteNavigation = [
    { name: 'Overview', href: '/dashboard/waste', icon: BarChart3 },
    { name: 'My Reports', href: '/dashboard/waste/reports', icon: Package },
    { name: 'Collection Points', href: '/dashboard/waste/collection-points', icon: MapPin },
    { name: 'Events', href: '/dashboard/waste/events', icon: Calendar },
    { name: 'Credits', href: '/dashboard/waste/credits', icon: Coins },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Permanent Left Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col fixed inset-y-0 left-0 z-50 overflow-y-auto">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-lg font-bold text-gray-900">Green Jobs</span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          {user?.is_youth && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Youth Eligible
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {item.name}
              </Link>
            );
          })}

          {/* Waste Collection Menu */}
          <div className="space-y-1">
            <button
              onClick={() => setWasteMenuOpen(!wasteMenuOpen)}
              className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isWastePathActive()
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Recycle className={`mr-3 h-5 w-5 ${
                isWastePathActive() ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              Waste Collection
              {wasteMenuOpen ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </button>

            {wasteMenuOpen && (
              <div className="ml-6 space-y-1">
                {wasteNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`mr-3 h-4 w-4 ${
                        isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            to="/dashboard/settings"
            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Settings
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-end h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative dashboard-notification-menu">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleNotificationMenu();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-500 transition-colors relative"
                >
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    3
                  </span>
                </button>

                {/* Notification dropdown */}
                {isNotificationMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
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
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm text-gray-900">Credits earned: 50 points</p>
                            <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <Link
                        to="/dashboard/notifications"
                        className="text-sm text-green-600 hover:text-green-500"
                        onClick={() => setIsNotificationMenuOpen(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative dashboard-user-menu">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleUserMenu();
                  }}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {user?.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <Link
                      to="/help"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Help
                    </Link>
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
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
