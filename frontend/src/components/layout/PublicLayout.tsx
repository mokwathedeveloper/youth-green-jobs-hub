import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Leaf, LogIn, UserPlus } from 'lucide-react';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">
                Youth Green Jobs Hub
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Now
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              © 2024 Youth Green Jobs Hub. Empowering youth in Kisumu through green opportunities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
