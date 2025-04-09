import React, { useState } from 'react';
import { Search, Bell, Mic, Menu } from 'lucide-react';
import { Link } from 'wouter';

interface HeaderProps {
  user?: {
    name: string;
    role: string;
    initials: string;
  };
}

const Header: React.FC<HeaderProps> = ({ user = { name: 'Jane Smith', role: 'City Clerk', initials: 'JS' } }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and site name */}
          <div className="flex items-center space-x-3">
            <img src="/OB-logo.png" alt="Oak Bay Logo" className="h-10" />
            <div className="border-l border-gray-300 h-8 mx-1"></div>
            <div>
              <div className="font-heading font-semibold text-[#0056a6] leading-tight">CouncilInsight</div>
              <div className="text-xs text-gray-500">Meeting Intelligence Platform</div>
            </div>
          </div>
          
          {/* Desktop Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="block w-full bg-gray-100 border-none pl-10 pr-7 py-2 rounded-lg focus:ring-2 focus:ring-[#0056a6]/30 focus:bg-white transition-all"
                placeholder="Search meetings, topics, or decisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Mic className="h-4 w-4 text-gray-400 hover:text-[#0056a6]" />
              </button>
            </div>
          </div>
          
          {/* Right side utilities */}
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden focus:outline-none"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <Search className="h-5 w-5 text-gray-500" />
            </button>
            <div className="hidden sm:flex items-center">
              <button className="p-2 text-gray-500 hover:text-[#0056a6] relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-[#e2b33d] rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center">
              <div className="hidden md:block mr-3">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#cce3f3] text-[#0056a6] font-medium flex items-center justify-center">
                {user.initials}
              </div>
            </div>
            <button className="md:hidden p-2 focus:outline-none" id="mobile-menu-button">
              <Menu className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="block w-full bg-gray-100 border-none pl-10 pr-7 py-2 rounded-lg focus:ring-2 focus:ring-[#0056a6]/30 focus:bg-white transition-all"
                placeholder="Search meetings, topics, or decisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
