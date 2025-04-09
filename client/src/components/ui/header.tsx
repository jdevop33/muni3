import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Mic, Menu, User, Settings, LogOut, CheckCircle, Calendar, AlertCircle, LogIn } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import obLogo from '@assets/OB-logo.png';

// Helper function to get initials from a name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: "New decision added",
      description: "Parks Master Plan was approved in the latest council meeting",
      time: "10 minutes ago",
      read: false,
      type: "decision"
    },
    {
      id: 2,
      title: "Upcoming meeting",
      description: "Regular Council Meeting tomorrow at 7:00 PM",
      time: "1 hour ago",
      read: false,
      type: "meeting"
    },
    {
      id: 3,
      title: "Topic alert: Housing",
      description: "Housing was discussed 3 times in recent meetings",
      time: "2 hours ago",
      read: true,
      type: "topic"
    }
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and site name */}
          <Link href="/" className="flex items-center space-x-3">
            <img src={obLogo} alt="Oak Bay Logo" className="h-10" />
            <div className="border-l border-gray-300 h-8 mx-1"></div>
            <div>
              <div className="font-heading font-semibold text-[#0056a6] leading-tight">CouncilInsight</div>
              <div className="text-xs text-gray-500">Meeting Intelligence Platform</div>
            </div>
          </Link>
          
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
            
            {/* Notifications */}
            <div className="hidden sm:flex items-center relative" ref={notificationsRef}>
              <button 
                className="p-2 text-gray-500 hover:text-[#0056a6] relative"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserMenuOpen(false);
                }}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-[#e2b33d] rounded-full"></span>
              </button>
              
              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">Notifications</h3>
                    <Link href="/alerts" className="text-sm text-[#0056a6] hover:text-[#004e95]">View all</Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            {notification.type === 'decision' && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {notification.type === 'meeting' && (
                              <Calendar className="h-5 w-5 text-blue-500" />
                            )}
                            {notification.type === 'topic' && (
                              <AlertCircle className="h-5 w-5 text-amber-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-800">{notification.title}</div>
                            <p className="text-xs text-gray-600 mt-0.5">{notification.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 text-center">
                    <button className="text-sm text-[#0056a6] hover:text-[#004e95] font-medium">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Profile or Login Button */}
            <div className="flex items-center relative" ref={userMenuRef}>
              {user ? (
                /* Logged in state */
                <>
                  <button 
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center focus:outline-none"
                  >
                    <div className="hidden md:block mr-3">
                      <div className="text-sm font-medium">{user.fullName || user.username}</div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-[#cce3f3] text-[#0056a6] font-medium flex items-center justify-center">
                      {getInitials(user.fullName || user.username)}
                    </div>
                  </button>
                  
                  {/* User Menu Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                      <div className="p-3 border-b border-gray-100">
                        <div className="font-medium text-gray-800">{user.fullName || user.username}</div>
                        <div className="text-xs text-gray-500">{user.email || ''}</div>
                        <div className="text-xs text-gray-500 mt-1 uppercase font-bold">
                          {user.role}
                        </div>
                      </div>
                      <div>
                        <Link 
                          href="/settings" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3 text-gray-500" />
                          Profile
                        </Link>
                        <Link 
                          href="/settings" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-500" />
                          Settings
                        </Link>
                        {user.role === 'admin' && (
                          <Link 
                            href="/data-ingestion" 
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-3 text-gray-500" />
                            Data Management
                          </Link>
                        )}
                        <button 
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                          onClick={() => {
                            setUserMenuOpen(false);
                            logoutMutation.mutate();
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Logged out state */
                <button 
                  onClick={() => navigate('/auth')}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-[#0056a6] text-white rounded-md hover:bg-[#004e95] transition duration-150"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="text-sm font-medium">Sign In</span>
                </button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
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
