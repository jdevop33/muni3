import React from 'react';
import { Topic } from '@/lib/types';

interface TopicInsightsProps {
  topics: Topic[];
  loading?: boolean;
}

const TopicInsights: React.FC<TopicInsightsProps> = ({ topics, loading = false }) => {
  // Find the max count for percentage calculation
  const maxCount = topics.length > 0 ? Math.max(...topics.map(topic => topic.count)) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-heading font-medium text-gray-900">Popular Topics</h2>
        </div>
        
        <div className="p-5">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-12 animated-loading rounded-md"></div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
          <a href="/topics" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center justify-center">
            View topic analysis
            <i className="fas fa-arrow-right ml-1.5"></i>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-heading font-medium text-gray-900">Popular Topics</h2>
      </div>
      
      <div className="p-5">
        <div className="space-y-4">
          {topics.map((topic) => {
            const percentage = maxCount > 0 ? (topic.count / maxCount) * 100 : 0;
            
            return (
              <div key={topic.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-gray-700">{topic.name}</div>
                  <div className="text-xs text-gray-500">{topic.count} mentions</div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0056a6] h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
        <a href="/topics" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center justify-center">
          View topic analysis
          <i className="fas fa-arrow-right ml-1.5"></i>
        </a>
      </div>
    </div>
  );
};

export default TopicInsights;
