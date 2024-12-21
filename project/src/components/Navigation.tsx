import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Book, Upload, BookOpen, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, to: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(to);
    }
  };

  if (!user) return null;

  const getNavItems = () => {
    const items = [];

    // Base view books access for all roles
    items.push({
      to: '/books',
      label: 'View Books',
      icon: Book,
    });

    // Role-based navigation items
    switch (user.role) {
      case 'ADMIN':
        items.push(
          { to: '/import', label: 'Import Books', icon: Upload },
          { to: '/select-books', label: 'Select Books', icon: BookOpen },
          { to: '/generate-questions', label: 'Generate Questions', icon: HelpCircle }
        );
        break;
      
      case 'SELECTOR':
        items.push(
          { to: '/select-books', label: 'Select Books', icon: BookOpen },
          { to: '/generate-questions', label: 'Generate Questions', icon: HelpCircle }
        );
        break;
      
      case 'IMPORTER':
        items.push(
          { to: '/import', label: 'Import Books', icon: Upload }
        );
        break;
      
      // VIEWER role only gets the base View Books access
    }

    return items;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">
                {isMenuOpen ? 'Close main menu' : 'Open main menu'}
              </span>
              {/* Menu icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-8">
            {getNavItems().map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === to
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                role="menuitem"
                tabIndex={0}
                onKeyPress={(e) => handleKeyPress(e, to)}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </Link>
            ))}
          </div>

          {/* User info and logout */}
          <div className="flex items-center">
            <span className="hidden md:block text-sm text-gray-500 mr-4">
              {user?.email} ({user?.role.toLowerCase()})
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMenuOpen ? 'block' : 'hidden'
        } md:hidden border-t border-gray-200`}
      >
        <div className="pt-2 pb-3 space-y-1">
          {getNavItems().map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center px-4 py-2 text-base font-medium ${
                location.pathname === to
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon className="h-5 w-5 mr-3" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}