import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { label: 'Dashboard', icon: 'fa-home', path: '/' },
    { label: 'Meetings', icon: 'fa-calendar-alt', path: '/meetings' },
    { label: 'Topics', icon: 'fa-lightbulb', path: '/topics' },
    { label: 'Decisions', icon: 'fa-check-circle', path: '/decisions' },
    { label: 'Analytics', icon: 'fa-chart-bar', path: '/analytics' },
    { label: 'Neighborhoods', icon: 'fa-map-marker-alt', path: '/neighborhoods' },
  ];

  const projectItems = [
    { label: 'Housing Action', icon: 'fa-home', path: '/projects/housing' },
    { label: 'Active Transportation', icon: 'fa-bicycle', path: '/projects/transportation' },
    { label: 'Parks & Facilities', icon: 'fa-tree', path: '/projects/parks' },
    { label: 'Community Planning', icon: 'fa-building', path: '/projects/planning' },
  ];

  const toolItems = [
    { label: 'My Alerts', icon: 'fa-bell', path: '/alerts' },
    { label: 'Saved Items', icon: 'fa-bookmark', path: '/saved' },
    { label: 'Settings', icon: 'fa-cog', path: '/settings' },
  ];

  return (
    <aside className={`${isOpen ? 'block fixed inset-0 z-50 bg-white' : 'hidden'} md:block bg-white w-56 shrink-0 border-r border-gray-200 overflow-y-auto h-[calc(100vh-64px)]`}>
      <div className="py-4 flex flex-col h-full">
        <div className="px-4 mb-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Main</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center px-4 py-2 text-sm font-medium 
                ${isActive(item.path) 
                ? 'text-[#0056a6] bg-[#e6f1f9]' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#0056a6]'}`}
            >
              <i className={`fas ${item.icon} w-5 mr-3 ${isActive(item.path) ? 'text-[#0056a6]' : 'text-gray-500'}`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 mt-6 mb-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</span>
        </div>
        <nav className="space-y-1">
          {projectItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center px-4 py-2 text-sm font-medium 
                ${isActive(item.path) 
                ? 'text-[#0056a6] bg-[#e6f1f9]' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#0056a6]'}`}
            >
              <i className={`fas ${item.icon} w-5 mr-3 ${isActive(item.path) ? 'text-[#0056a6]' : 'text-gray-500'}`}></i>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="px-4 mt-6 mb-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tools</span>
        </div>
        <nav className="space-y-1">
          {toolItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center px-4 py-2 text-sm font-medium 
                ${isActive(item.path) 
                ? 'text-[#0056a6] bg-[#e6f1f9]' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#0056a6]'}`}
            >
              <i className={`fas ${item.icon} w-5 mr-3 ${isActive(item.path) ? 'text-[#0056a6]' : 'text-gray-500'}`}></i>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto border-t border-gray-200 p-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium">Need help?</div>
            <p className="text-xs text-gray-500 mt-1">Check out our user guide or contact support.</p>
            <a href="#" className="mt-2 text-xs font-medium text-[#0056a6] hover:text-[#004e95] flex items-center">
              Learn more <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
