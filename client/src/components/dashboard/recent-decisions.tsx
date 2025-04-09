import React from 'react';
import { Decision } from '@/lib/types';
import DecisionCard from '../meetings/decision-card';

interface RecentDecisionsProps {
  decisions: Decision[];
  loading?: boolean;
}

const RecentDecisions: React.FC<RecentDecisionsProps> = ({ decisions, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-medium text-gray-900">Recent Decisions</h2>
            <div className="flex space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-500">
                <i className="fas fa-filter"></i>
              </button>
              <a href="#" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95]">View all</a>
            </div>
          </div>
        </div>
        
        <div>
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3].map((item) => (
              <li key={item} className="px-5 py-4">
                <div className="h-24 animated-loading rounded-md"></div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
          <a href="/decisions" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center justify-center">
            View all decisions
            <i className="fas fa-arrow-right ml-1.5"></i>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-medium text-gray-900">Recent Decisions</h2>
          <div className="flex space-x-2">
            <button className="p-1 text-gray-400 hover:text-gray-500">
              <i className="fas fa-filter"></i>
            </button>
            <a href="/decisions" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95]">View all</a>
          </div>
        </div>
      </div>
      
      <div>
        <ul className="divide-y divide-gray-200">
          {decisions.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </ul>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
        <a href="/decisions" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center justify-center">
          View all decisions
          <i className="fas fa-arrow-right ml-1.5"></i>
        </a>
      </div>
    </div>
  );
};

export default RecentDecisions;
