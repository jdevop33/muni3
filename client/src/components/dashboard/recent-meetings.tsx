import React, { useState } from 'react';
import { Meeting } from '@/lib/types';
import MeetingCard from '../meetings/meeting-card';
import MeetingTranscriptModal from '../meetings/meeting-transcript-modal';

interface RecentMeetingsProps {
  meetings: Meeting[];
  loading?: boolean;
}

const RecentMeetings: React.FC<RecentMeetingsProps> = ({ meetings, loading = false }) => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);

  const openTranscriptModal = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setTranscriptModalOpen(true);
  };

  const closeTranscriptModal = () => {
    setTranscriptModalOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-medium text-gray-900">Recent Meetings</h2>
            <div className="flex space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-500">
                <i className="fas fa-filter"></i>
              </button>
              <a href="#" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95]">View all</a>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-5">
              <div className="h-24 animated-loading rounded-md"></div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
          <a href="/meetings" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center justify-center">
            View all meetings
            <i className="fas fa-arrow-right ml-1.5"></i>
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-medium text-gray-900">Recent Meetings</h2>
            <div className="flex space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-500">
                <i className="fas fa-filter"></i>
              </button>
              <a href="/meetings" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95]">View all</a>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {meetings.map((meeting) => (
            <MeetingCard 
              key={meeting.id} 
              meeting={meeting} 
              onTranscriptClick={() => openTranscriptModal(meeting)} 
            />
          ))}
        </div>
        
        <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
          <a href="/meetings" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center justify-center">
            View all meetings
            <i className="fas fa-arrow-right ml-1.5"></i>
          </a>
        </div>
      </div>

      {transcriptModalOpen && selectedMeeting && (
        <MeetingTranscriptModal 
          meeting={selectedMeeting} 
          isOpen={transcriptModalOpen} 
          onClose={closeTranscriptModal} 
        />
      )}
    </>
  );
};

export default RecentMeetings;
