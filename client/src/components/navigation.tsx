import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="#dashboard" 
              data-testid="link-dashboard"
              className="airbnb-dark hover:text-red-500 transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="#workflows" 
              data-testid="link-workflows"
              className="airbnb-gray hover:text-red-500 transition-colors"
            >
              Workflows
            </a>
            <a 
              href="#templates" 
              data-testid="link-templates"
              className="airbnb-gray hover:text-red-500 transition-colors"
            >
              Templates
            </a>
            <a 
              href="#analytics" 
              data-testid="link-analytics"
              className="airbnb-gray hover:text-red-500 transition-colors"
            >
              Analytics
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              data-testid="button-start-trial-nav"
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Start Trial
            </Button>
            
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
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a href="#dashboard" className="airbnb-dark hover:text-red-500 transition-colors">
                Dashboard
              </a>
              <a href="#workflows" className="airbnb-gray hover:text-red-500 transition-colors">
                Workflows
              </a>
              <a href="#templates" className="airbnb-gray hover:text-red-500 transition-colors">
                Templates
              </a>
              <a href="#analytics" className="airbnb-gray hover:text-red-500 transition-colors">
                Analytics
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
