import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, Calendar, LightbulbIcon, CheckCircle, BarChart2, MapPin,
  Home, Bike, Palmtree, Building, Database, Bell, Bookmark, Settings, ChevronRight
} from 'lucide-react';

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
    { label: 'Dashboard', icon: BarChart3, path: '/' },
    { label: 'Meetings', icon: Calendar, path: '/meetings' },
    { label: 'Topics', icon: LightbulbIcon, path: '/topics' },
    { label: 'Decisions', icon: CheckCircle, path: '/decisions' },
    { label: 'Analytics', icon: BarChart2, path: '/analytics' },
    { label: 'Neighborhoods', icon: MapPin, path: '/neighborhoods' },
  ];

  const projectItems = [
    { label: 'Housing Action', icon: Home, path: '/projects/housing' },
    { label: 'Active Transportation', icon: Bike, path: '/projects/transportation' },
    { label: 'Parks & Facilities', icon: Palmtree, path: '/projects/parks' },
    { label: 'Community Planning', icon: Building, path: '/projects/planning' },
  ];

  const toolItems = [
    { label: 'Data Ingestion', icon: Database, path: '/data-ingestion' },
    { label: 'My Alerts', icon: Bell, path: '/alerts' },
    { label: 'Saved Items', icon: Bookmark, path: '/saved' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`${isOpen ? 'block fixed left-0 top-16 z-50' : 'hidden'} md:block bg-white w-64 md:w-56 shrink-0 border-r border-gray-200 overflow-y-auto h-[calc(100vh-64px)]`}
      >
        <div className="py-4 flex flex-col h-full">
          {isOpen && (
            <div className="md:hidden flex justify-between items-center px-4 pb-3 border-b border-gray-100 mb-2">
              <div className="font-heading font-semibold text-lg text-[#0056a6]">Menu</div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
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
                <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-[#0056a6]' : 'text-gray-500'}`} />
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
                <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-[#0056a6]' : 'text-gray-500'}`} />
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
                <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-[#0056a6]' : 'text-gray-500'}`} />
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto border-t border-gray-200 p-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium">Need help?</div>
              <p className="text-xs text-gray-500 mt-1">Check out our user guide or contact support.</p>
              <a href="#" className="mt-2 text-xs font-medium text-[#0056a6] hover:text-[#004e95] flex items-center">
                Learn more <ChevronRight className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;