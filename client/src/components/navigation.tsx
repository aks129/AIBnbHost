import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              </svg>
              <span className="text-xl font-bold airbnb-dark">Lana AI Airbnb Co-Host</span>
            </div>
          </div>

          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                data-testid="link-dashboard"
                className="airbnb-dark hover:text-red-500 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/calendar"
                data-testid="link-calendar"
                className="airbnb-gray hover:text-red-500 transition-colors"
              >
                Calendar
              </Link>
              <Link
                href="/conversations"
                data-testid="link-conversations"
                className="airbnb-gray hover:text-red-500 transition-colors"
              >
                Conversations
              </Link>
              <Link
                href="/messages"
                data-testid="link-messages"
                className="airbnb-gray hover:text-red-500 transition-colors"
              >
                Templates
              </Link>
              <Link
                href="/activities"
                data-testid="link-activities"
                className="airbnb-gray hover:text-red-500 transition-colors"
              >
                Activities
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="hidden md:inline text-sm text-gray-600">
                  {user?.name || user?.email}
                </span>
                <Button
                  data-testid="button-logout"
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  data-testid="button-login-nav"
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Login
                </Button>
              </Link>
            )}

            <button
              data-testid="button-mobile-menu"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/dashboard" className="airbnb-dark hover:text-red-500 transition-colors">
                Dashboard
              </Link>
              <Link href="/calendar" className="airbnb-gray hover:text-red-500 transition-colors">
                Calendar
              </Link>
              <Link href="/conversations" className="airbnb-gray hover:text-red-500 transition-colors">
                Conversations
              </Link>
              <Link href="/messages" className="airbnb-gray hover:text-red-500 transition-colors">
                Templates
              </Link>
              <Link href="/activities" className="airbnb-gray hover:text-red-500 transition-colors">
                Activities
              </Link>
              <button
                onClick={handleLogout}
                className="text-left airbnb-gray hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
