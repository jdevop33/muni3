import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Meeting } from '@/lib/types';
import MeetingCard from '@/components/meetings/meeting-card';
import MeetingTranscriptModal from '@/components/meetings/meeting-transcript-modal';

const Meetings: React.FC = () => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch meetings
  const { data: meetings, isLoading } = useQuery({
    queryKey: ['/api/meetings', filterType],
    enabled: true
  });

  const openTranscriptModal = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setTranscriptModalOpen(true);
  };

  const closeTranscriptModal = () => {
    setTranscriptModalOpen(false);
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
  };

  // Filter meetings by search query
  const filteredMeetings = meetings 
    ? meetings.filter(meeting => 
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-8 mt-2">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-heading font-semibold text-gray-900 pb-1">
              Council Meetings
            </h1>
            <p className="text-sm text-gray-500">
              Browse and search all Oak Bay council meetings, committees, and special sessions
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <div className="relative inline-block text-left mr-2">
              <div className="flex">
                <button type="button" className="flex items-center text-sm text-gray-700 bg-white hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-md shadow-sm font-medium">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  All time
                  <i className="fas fa-chevron-down ml-2"></i>
                </button>
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
              filterType === 'all' 
                ? 'bg-[#0056a6] text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            All Meetings
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filterType === 'council' 
                ? 'bg-[#0056a6] text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => handleFilterChange('council')}
          >
            Council
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filterType === 'committee' 
                ? 'bg-[#0056a6] text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => handleFilterChange('committee')}
          >
            Committee
          </button>
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filterType === 'special' 
                ? 'bg-[#0056a6] text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => handleFilterChange('special')}
          >
            Special
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <input 
            type="text" 
            className="block w-full md:w-64 bg-white border border-gray-300 pl-10 pr-4 py-2 rounded-md text-sm"
            placeholder="Search meetings or topics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-medium text-gray-900">Council Meetings</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {filteredMeetings.length} meetings
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-500">
                <i className="fas fa-sort-amount-down"></i>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="p-5">
                <div className="h-24 animated-loading rounded-md"></div>
              </div>
            ))}
          </div>
        ) : filteredMeetings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredMeetings.map((meeting) => (
              <MeetingCard 
                key={meeting.id} 
                meeting={meeting} 
                onTranscriptClick={() => openTranscriptModal(meeting)} 
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <i className="fas fa-search text-gray-300 text-5xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No meetings found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {transcriptModalOpen && selectedMeeting && (
        <MeetingTranscriptModal 
          meeting={selectedMeeting} 
          isOpen={transcriptModalOpen} 
          onClose={closeTranscriptModal} 
        />
      )}
    </div>
  );
};

export default Meetings;
