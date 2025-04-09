import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Decision } from '@/lib/types';
import DecisionCard from '@/components/meetings/decision-card';

const Decisions: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('90days');

  // Fetch decisions
  const { data: decisions, isLoading } = useQuery({
    queryKey: ['/api/decisions', filterStatus, timeRange],
    enabled: true
  });

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  // Filter decisions by search query
  const filteredDecisions = decisions 
    ? decisions.filter((decision: Decision) => 
        decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        decision.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        decision.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-8 mt-2">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-heading font-semibold text-gray-900 pb-1">
              Council Decisions
            </h1>
            <p className="text-sm text-gray-500">
              Track decisions made by Oak Bay council and monitor implementation
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <div className="relative inline-block text-left mr-2">
              <select 
                className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md shadow-sm leading-tight focus:outline-none focus:ring-[#0056a6] focus:border-[#0056a6]"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="6months">Last 6 months</option>
                <option value="1year">Last year</option>
                <option value="all">All time</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
            <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0056a6] hover:bg-[#004e95] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0056a6]">
              <i className="fas fa-download mr-2"></i>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex space-x-2 mb-4 md:mb-0 overflow-x-auto pb-2">
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filterStatus === 'all' 
                ? 'bg-[#0056a6] text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            All Decisions
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filterStatus === 'approved' 
                ? 'bg-[#0056a6] text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => handleFilterChange('approved')}
          >
            Approved
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filterStatus === 'rejected' 
                ? 'bg-[#0056a6] text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => handleFilterChange('rejected')}
          >
            Rejected
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filterStatus === 'pending' 
                ? 'bg-[#0056a6] text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => handleFilterChange('pending')}
          >
            Pending Implementation
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <input 
            type="text" 
            className="block w-full md:w-64 bg-white border border-gray-300 pl-10 pr-4 py-2 rounded-md text-sm"
            placeholder="Search decisions or topics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Decisions List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-medium text-gray-900">Council Decisions</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {filteredDecisions.length} decisions
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-500">
                <i className="fas fa-sort-amount-down"></i>
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div>
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <li key={item} className="px-5 py-4">
                  <div className="h-24 animated-loading rounded-md"></div>
                </li>
              ))}
            </ul>
          </div>
        ) : filteredDecisions.length > 0 ? (
          <div>
            <ul className="divide-y divide-gray-200">
              {filteredDecisions.map((decision: Decision) => (
                <DecisionCard key={decision.id} decision={decision} />
              ))}
            </ul>
          </div>
        ) : (
          <div className="py-12 text-center">
            <i className="fas fa-check-circle text-gray-300 text-5xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No decisions found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
        
        <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center">
              <i className="fas fa-chevron-left mr-1.5"></i>
              Previous
            </button>
            <div className="text-sm text-gray-500">
              Page 1 of 1
            </div>
            <button className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center">
              Next
              <i className="fas fa-chevron-right ml-1.5"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Decisions;
