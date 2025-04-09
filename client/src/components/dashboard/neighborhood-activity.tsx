import React from 'react';
import { Neighborhood } from '@/lib/types';

interface NeighborhoodActivityProps {
  neighborhoods: Neighborhood[];
  loading?: boolean;
}

const NeighborhoodActivity: React.FC<NeighborhoodActivityProps> = ({ neighborhoods, loading = false }) => {
  // Function to determine color class based on neighborhood color
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600'
        };
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-heading font-medium text-gray-900">Neighborhood Activity</h2>
        </div>
        
        <div className="p-5">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animated-loading rounded-md"></div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
          <a href="/neighborhoods" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center justify-center">
            View neighborhood activity
            <i className="fas fa-arrow-right ml-1.5"></i>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-heading font-medium text-gray-900">Neighborhood Activity</h2>
      </div>
      
      <div className="p-5">
        <div className="space-y-4">
          {neighborhoods.map((neighborhood) => {
            const colorClasses = getColorClasses(neighborhood.color);
            
            return (
              <div key={neighborhood.id} className="flex items-center">
                <div className="w-20 flex-shrink-0">
                  <div className={`flex h-8 w-8 rounded-md ${colorClasses.bg} ${colorClasses.text} items-center justify-center`}>
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{neighborhood.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses.bg} ${colorClasses.text.replace('text-', 'text-')}-800`}>
                      {neighborhood.discussions} discussions
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Last discussed: {neighborhood.lastDiscussed}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
        <a href="/neighborhoods" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center justify-center">
          View neighborhood activity
          <i className="fas fa-arrow-right ml-1.5"></i>
        </a>
      </div>
    </div>
  );
};

export default NeighborhoodActivity;
