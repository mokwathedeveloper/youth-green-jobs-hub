import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Leaf, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-foreground">
                Youth Green Jobs Hub
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Now
                </Button>
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
      <footer className="bg-muted text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm">
              © 2024 Youth Green Jobs Hub. Empowering youth in Kisumu through green opportunities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
