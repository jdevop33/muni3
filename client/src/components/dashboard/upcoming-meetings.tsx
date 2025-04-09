import React from 'react';
import { Meeting } from '@/lib/types';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
  loading?: boolean;
}

const UpcomingMeetings: React.FC<UpcomingMeetingsProps> = ({ meetings, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-heading font-medium text-gray-900">Upcoming Meetings</h2>
        </div>
        
        <div className="p-5">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animated-loading rounded-md"></div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
          <a href="/meetings" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center justify-center">
            View calendar
            <i className="fas fa-arrow-right ml-1.5"></i>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-heading font-medium text-gray-900">Upcoming Meetings</h2>
      </div>
      
      <div className="p-5">
        <ul className="divide-y divide-gray-200">
          {meetings.map((meeting) => (
            <li key={meeting.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{meeting.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    <i className="fas fa-calendar-day mr-1.5"></i> {meeting.date}
                    <span className="mx-1.5">·</span>
                    <i className="fas fa-clock mr-1.5"></i> {meeting.startTime}
                  </p>
                </div>
                <div>
                  <button className="text-xs font-medium text-[#0056a6] hover:text-[#004e95]">
                    View Agenda
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-200">
        <a href="/meetings" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95] flex items-center justify-center">
          View calendar
          <i className="fas fa-arrow-right ml-1.5"></i>
        </a>
      </div>
    </div>
  );
};

export default UpcomingMeetings;
