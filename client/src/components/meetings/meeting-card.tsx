import React from 'react';
import { Meeting } from '@/lib/types';

interface MeetingCardProps {
  meeting: Meeting;
  onTranscriptClick: () => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onTranscriptClick }) => {
  return (
    <div className="p-5 hover:bg-gray-50 transition-colors">
      <div className="sm:flex sm:justify-between">
        <div>
          <h3 className="text-base font-medium text-gray-900">
            <a href={`/meetings/${meeting.id}`} className="hover:text-[#0056a6]">{meeting.title}</a>
          </h3>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <i className="fas fa-calendar-day mr-1.5 text-gray-400"></i>
            {meeting.date}
            <span className="mx-1.5">·</span>
            <i className="fas fa-clock mr-1.5 text-gray-400"></i>
            {meeting.startTime}
            <span className="mx-1.5">·</span>
            <span>{meeting.duration}</span>
          </div>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            meeting.status === 'Completed' ? 'bg-green-100 text-green-800' : 
            meeting.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
            meeting.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {meeting.status}
          </span>
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {meeting.topics.map((topic, index) => (
          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#e6f1f9] text-[#0056a6]">
            {topic}
          </span>
        ))}
      </div>
      
      {meeting.keyDiscussions && meeting.keyDiscussions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Key Discussions:</h4>
          <ul className="mt-2 space-y-2">
            {meeting.keyDiscussions.map((discussion, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mt-0.5">
                  <i className={`fas ${discussion.icon} text-xs`}></i>
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  {discussion.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {meeting.keyDecisions && meeting.keyDecisions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Key Decisions:</h4>
          <ul className="mt-2 space-y-2">
            {meeting.keyDecisions.map((decision, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 text-green-500 flex items-center justify-center mt-0.5">
                  <i className={`fas ${decision.icon} text-xs`}></i>
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  {decision.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex -space-x-1 relative z-0">
            <div className="h-6 w-6 rounded-full bg-[#e6f1f9] text-[#0056a6] flex items-center justify-center text-xs">
              MD
            </div>
            <div className="h-6 w-6 rounded-full bg-[#e8efe7] text-[#4e7e3e] flex items-center justify-center text-xs">
              KT
            </div>
            <div className="h-6 w-6 rounded-full bg-[#fdf8e9] text-[#e2b33d] flex items-center justify-center text-xs">
              EP
            </div>
            {meeting.participants > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs">
                +{meeting.participants - 3}
              </div>
            )}
          </div>
          <span className="ml-2 text-xs text-gray-500">{meeting.participants} participants</span>
        </div>
        <div className="flex space-x-3">
          {meeting.hasMinutes && (
            <button className="text-sm text-gray-500 hover:text-[#0056a6] flex items-center">
              <i className="fas fa-file-alt mr-1.5"></i>
              <span className="hidden sm:inline">Minutes</span>
            </button>
          )}
          {meeting.hasTranscript && (
            <button 
              className="text-sm text-gray-500 hover:text-[#0056a6] flex items-center"
              onClick={onTranscriptClick}
            >
              <i className="fas fa-comment-alt mr-1.5"></i>
              <span className="hidden sm:inline">Transcript</span>
            </button>
          )}
          {meeting.hasVideo && (
            <button className="text-sm text-gray-500 hover:text-[#0056a6] flex items-center">
              <i className="fas fa-play mr-1.5"></i>
              <span className="hidden sm:inline">Video</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
