import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Topic, Meeting } from '@/lib/types';

const Topics: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('90days');

  // Fetch topics
  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['/api/topics', timeRange],
    enabled: true
  });
  
  // Fetch meetings for selected topic
  const { data: topicMeetings, isLoading: meetingsLoading } = useQuery({
    queryKey: ['/api/topics', selectedTopic, 'meetings'],
    enabled: !!selectedTopic
  });

  // Dummy data for the topic analysis
  const topicAnalysisData = [
    { month: 'Jan', count: 5 },
    { month: 'Feb', count: 8 },
    { month: 'Mar', count: 12 },
    { month: 'Apr', count: 9 },
    { month: 'May', count: 15 },
    { month: 'Jun', count: 10 }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-8 mt-2">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-heading font-semibold text-gray-900 pb-1">
              Council Meeting Topics
            </h1>
            <p className="text-sm text-gray-500">
              Explore topics discussed in Oak Bay council meetings over time
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics List */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-heading font-medium text-gray-900">Popular Topics</h2>
            </div>
            
            <div className="p-5">
              {topicsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="h-12 animated-loading rounded-md"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {topics?.map((topic: Topic) => {
                    const isSelected = selectedTopic === topic.name;
                    
                    return (
                      <button 
                        key={topic.id}
                        className={`w-full text-left px-3 py-3 rounded-md border transition-colors ${
                          isSelected 
                            ? 'border-[#0056a6] bg-[#e6f1f9] text-[#0056a6]' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedTopic(topic.name)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{topic.name}</span>
                          <span className={`text-sm ${isSelected ? 'text-[#0056a6]' : 'text-gray-500'}`}>
                            {topic.count} mentions
                          </span>
                        </div>
                        <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${isSelected ? 'bg-[#0056a6]' : 'bg-gray-400'}`}
                            style={{ width: `${(topic.count / 24) * 100}%` }}
                          ></div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Topic Analysis */}
        <div className="lg:col-span-2">
          {selectedTopic ? (
            <>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
                <div className="border-b border-gray-200 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-heading font-medium text-gray-900">
                      Topic Analysis: {selectedTopic}
                    </h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#e6f1f9] text-[#0056a6]">
                      {topics?.find((t: Topic) => t.name === selectedTopic)?.count || 0} mentions
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Mentions Over Time</h3>
                    <div className="h-48 bg-gray-50 rounded-md p-4 flex items-end justify-between">
                      {topicAnalysisData.map((item, index) => {
                        const height = (item.count / 15) * 100;
                        
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className="w-10 bg-[#0056a6] rounded-t-md mb-2" 
                              style={{ height: `${height}%` }}
                            ></div>
                            <span className="text-xs text-gray-500">{item.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Related Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Community Planning', 'Budget', 'Infrastructure', 'Parks & Facilities'].map((relatedTopic, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {relatedTopic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-lg font-heading font-medium text-gray-900">
                    Recent Meetings Discussing {selectedTopic}
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {meetingsLoading ? (
                    [1, 2, 3].map((item) => (
                      <div key={item} className="p-5">
                        <div className="h-20 animated-loading rounded-md"></div>
                      </div>
                    ))
                  ) : topicMeetings?.length > 0 ? (
                    topicMeetings.map((meeting: Meeting) => (
                      <div key={meeting.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <h3 className="text-base font-medium text-gray-900">
                          <a href={`/meetings/${meeting.id}`} className="hover:text-[#0056a6]">{meeting.title}</a>
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <i className="fas fa-calendar-day mr-1.5 text-gray-400"></i>
                          {meeting.date}
                          <span className="mx-1.5">·</span>
                          <span className="text-[#0056a6]">{meeting.topics.includes(selectedTopic) ? `${Math.floor(Math.random() * 10) + 1} mentions` : '1 mention'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No recent meetings found for this topic</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center flex flex-col items-center justify-center h-full">
              <i className="fas fa-chart-line text-gray-300 text-5xl mb-4"></i>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Topic</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Choose a topic from the list to see detailed analysis, related meetings, and trends over time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topics;
