import React from 'react';
import { StatsCard } from '@/lib/types';

interface StatsCardProps {
  card: StatsCard;
}

const StatsCardComponent: React.FC<StatsCardProps> = ({ card }) => {
  const { title, count, change, icon, color, linkText, linkUrl } = card;
  
  // Define background and text colors based on the color prop
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-[#e6f1f9]',
          text: 'text-[#0056a6]'
        };
      case 'green':
        return {
          bg: 'bg-[#e8efe7]',
          text: 'text-[#4e7e3e]'
        };
      case 'gold':
        return {
          bg: 'bg-[#fdf8e9]',
          text: 'text-[#e2b33d]'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`inline-flex items-center justify-center h-12 w-12 rounded-md ${colorClasses.bg} ${colorClasses.text}`}>
              <i className={`fas ${icon}`}></i>
            </div>
          </div>
          <div className="ml-4">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">{count}</h3>
              {change !== undefined && (
                <span className="flex items-center text-green-500 text-xs ml-2">
                  <i className="fas fa-arrow-up mr-1"></i> {change}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Last 90 days · <a href={linkUrl} className="font-medium text-[#0056a6] hover:text-[#004e95]">{linkText}</a>
        </div>
      </div>
    </div>
  );
};

export default StatsCardComponent;
