import React, { useState } from 'react';
import { Meeting, MeetingDiscussion, MeetingKeyMoment } from '@/lib/types';

interface MeetingTranscriptModalProps {
  meeting: Meeting;
  isOpen: boolean;
  onClose: () => void;
}

const MeetingTranscriptModal: React.FC<MeetingTranscriptModalProps> = ({ meeting, isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('transcript');

  // Normally this would be fetched from the API
  const discussions: MeetingDiscussion[] = [
    {
      id: 1,
      meetingId: meeting.id,
      speakerName: "Mayor Smith",
      speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
      text: "Good evening everyone. I'd like to call this Regular Council Meeting to order. We have a full agenda tonight, including the final discussion on the Official Community Plan updates and the Henderson Cycling Facility budget.",
      timestamp: "0:00:15",
      isDecision: false
    },
    {
      id: 2,
      meetingId: meeting.id,
      speakerName: "Councillor Johnson",
      speakerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
      text: "Thank you, Mayor. Before we begin, I'd like to request that we move item 5.3 regarding the Carnarvon Park timeline to the next Committee meeting, as we're awaiting the final report from our consultants.",
      timestamp: "0:01:22",
      isDecision: false
    },
    {
      id: 3,
      meetingId: meeting.id,
      speakerName: "Mayor Smith",
      speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
      text: "That seems reasonable. Do we have a seconder for Councillor Johnson's motion to postpone item 5.3?",
      timestamp: "0:02:05",
      isDecision: false
    },
    {
      id: 4,
      meetingId: meeting.id,
      speakerName: "Councillor Lee",
      speakerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
      text: "I'll second that motion.",
      timestamp: "0:02:18",
      isDecision: false
    },
    {
      id: 5,
      meetingId: meeting.id,
      speakerName: "Mayor Smith",
      speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
      text: "Thank you. We have a motion and a second to postpone item 5.3 to the next Committee meeting. All in favor?",
      timestamp: "0:02:32",
      isDecision: true
    },
    {
      id: 6,
      meetingId: meeting.id,
      speakerName: "Mayor Smith",
      speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
      text: "With that settled, let's move to item 1, approval of the agenda as amended. Can I have a motion to approve?",
      timestamp: "0:03:10",
      isDecision: false
    }
  ];

  const keyMoments: MeetingKeyMoment[] = [
    {
      id: 1,
      meetingId: meeting.id,
      title: "Official Community Plan Vote",
      timestamp: "1:15:32",
      description: "Motion approved 6-1"
    },
    {
      id: 2,
      meetingId: meeting.id,
      title: "Henderson Cycling Budget",
      timestamp: "1:42:18",
      description: "Amendment discussion"
    },
    {
      id: 3,
      meetingId: meeting.id,
      title: "Public Delegations",
      timestamp: "0:32:45",
      description: "4 speakers on housing"
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {meeting.title} - {meeting.date}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        <i className="fas fa-clock mr-1.5"></i> 
                        {meeting.startTime} - Duration: {meeting.duration}
                        <span className="mx-1.5">·</span>
                        <i className="fas fa-user mr-1.5"></i> 
                        {meeting.participants} participants
                      </p>
                    </div>
                    <button 
                      type="button" 
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div className="mt-4 flex flex-col md:flex-row">
                    {/* Video Player */}
                    <div className="md:w-2/5 shrink-0">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-md mb-3 relative">
                        <img src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=675&q=80" alt="Council Meeting" className="object-cover rounded-md opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button className="h-16 w-16 rounded-full bg-white bg-opacity-75 text-[#0056a6] flex items-center justify-center">
                            <i className="fas fa-play text-2xl"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-md p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Moments</h4>
                        <ul className="space-y-2">
                          {keyMoments.map((moment) => (
                            <li key={moment.id}>
                              <button className="w-full text-left px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 text-sm">
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-700">{moment.title}</span>
                                  <span className="text-gray-500">{moment.timestamp}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{moment.description}</p>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Transcript */}
                    <div className="md:ml-4 md:flex-1 mt-4 md:mt-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Meeting Transcript</h4>
                        <div className="flex space-x-2">
                          <button className="text-xs text-gray-500 px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50">
                            <i className="fas fa-search mr-1"></i> Search
                          </button>
                          <button className="text-xs text-gray-500 px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50">
                            <i className="fas fa-download mr-1"></i> Download
                          </button>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-md h-96 overflow-y-auto">
                        <div className="p-4 space-y-4">
                          {discussions.map((discussion) => (
                            <div key={discussion.id}>
                              <div className="flex items-start">
                                <img src={discussion.speakerAvatar} alt={discussion.speakerName} className="h-8 w-8 rounded-full mr-3" />
                                <div>
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900">{discussion.speakerName}</span>
                                    <span className="ml-2 text-xs text-gray-500">{discussion.timestamp}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {discussion.text}
                                  </p>
                                  {discussion.isDecision && (
                                    <div className="mt-2 px-3 py-1 bg-green-50 border border-green-100 rounded-md">
                                      <span className="text-xs font-medium text-green-800">Decision: Motion approved unanimously</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 border border-gray-200 rounded-md overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700">Topics Mentioned</h4>
                        </div>
                        <div className="p-3 flex flex-wrap gap-2">
                          {meeting.topics.map((topic, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#e6f1f9] text-[#0056a6]">
                              {topic} <span className="ml-1 text-gray-500">{Math.floor(Math.random() * 15) + 1} times</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button 
                type="button" 
                className="inline-flex w-full justify-center rounded-md bg-[#0056a6] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#004e95] sm:ml-3 sm:w-auto"
              >
                Save to My Items
              </button>
              <button 
                type="button" 
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingTranscriptModal;
