import React from 'react';
import { MapPin, Home, Blocks, FileText, Calendar, PanelRight } from 'lucide-react';

const NeighborhoodsPage: React.FC = () => {
  // Sample neighborhood data
  const neighborhoods = [
    { 
      id: 1, 
      name: 'Uplands', 
      discussionCount: 12, 
      recentTopics: ['Park Improvements', 'Traffic Calming', 'Heritage Preservation'],
      recentDecisions: 3,
      upcomingMeetings: 1 
    },
    { 
      id: 2, 
      name: 'Oak Bay Village', 
      discussionCount: 18, 
      recentTopics: ['Commercial Zoning', 'Pedestrian Safety', 'Event Planning'],
      recentDecisions: 5,
      upcomingMeetings: 2
    },
    { 
      id: 3, 
      name: 'South Oak Bay', 
      discussionCount: 9, 
      recentTopics: ['Shoreline Protection', 'Housing Density', 'Recreation Facilities'],
      recentDecisions: 2,
      upcomingMeetings: 0
    },
    { 
      id: 4, 
      name: 'North Oak Bay', 
      discussionCount: 15, 
      recentTopics: ['Road Maintenance', 'Urban Forest', 'School Zone Safety'],
      recentDecisions: 4,
      upcomingMeetings: 1
    },
    { 
      id: 5, 
      name: 'Henderson', 
      discussionCount: 7, 
      recentTopics: ['University Relations', 'Student Housing', 'Transit Improvements'],
      recentDecisions: 1,
      upcomingMeetings: 1
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Neighborhoods</h1>
        <p className="text-gray-600">Track council discussions and decisions by neighborhood</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="block w-full bg-white border border-gray-200 pl-10 pr-7 py-2 rounded-lg focus:ring-2 focus:ring-[#0056a6]/30 focus:border-[#0056a6] transition-all"
            placeholder="Search for a neighborhood..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {neighborhoods.map((neighborhood) => (
          <div key={neighborhood.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#0056a6] p-4">
              <h2 className="text-white font-semibold text-lg">{neighborhood.name}</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center">
                  <FileText className="text-gray-400 mr-2 h-5 w-5" />
                  <span className="text-sm text-gray-600">Discussions</span>
                </div>
                <span className="text-[#0056a6] font-medium">{neighborhood.discussionCount}</span>
              </div>
              
              <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center mb-2">
                  <PanelRight className="text-gray-400 mr-2 h-5 w-5" />
                  <span className="text-sm text-gray-600">Recent Topics</span>
                </div>
                <div className="mt-2">
                  {neighborhood.recentTopics.map((topic, index) => (
                    <span 
                      key={index} 
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mr-2 mb-2"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Blocks className="text-gray-400 mr-2 h-5 w-5" />
                  <span className="text-sm text-gray-600">Recent Decisions: {neighborhood.recentDecisions}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="text-gray-400 mr-2 h-5 w-5" />
                  <span className="text-sm text-gray-600">Upcoming: {neighborhood.upcomingMeetings}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 border-t border-gray-200">
              <a href="#" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95]">
                View neighborhood details →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NeighborhoodsPage;