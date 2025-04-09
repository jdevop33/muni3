import React from 'react';
import { Calendar, FileText, CheckCircle, MessageSquare, Clock, Users } from 'lucide-react';

interface ProjectPageProps {
  title: string;
  description: string;
  status: 'active' | 'completed' | 'planned';
  startDate: string;
  completionDate?: string;
  lead: string;
  leadRole: string;
  relatedTopics: string[];
  recentMeetings: Array<{
    id: number;
    date: string;
    title: string;
  }>;
  recentDecisions: Array<{
    id: number;
    date: string;
    title: string;
    status: string;
  }>;
  upcomingMilestones: Array<{
    id: number;
    date: string;
    title: string;
  }>;
}

const ProjectPage: React.FC<ProjectPageProps> = ({
  title,
  description,
  status,
  startDate,
  completionDate,
  lead,
  leadRole,
  relatedTopics,
  recentMeetings,
  recentDecisions,
  upcomingMilestones
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
          <p className="text-gray-600 mb-4 max-w-3xl">{description}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {relatedTopics.map((topic, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6 md:mb-0 min-w-[220px]">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Start Date: <span className="font-medium text-gray-800">{startDate}</span></span>
          </div>
          {completionDate && (
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Est. Completion: <span className="font-medium text-gray-800">{completionDate}</span></span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-gray-500" />
            <div>
              <span className="text-sm text-gray-600">Project Lead:</span>
              <div className="font-medium text-gray-800">{lead}</div>
              <div className="text-xs text-gray-500">{leadRole}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-[#0056a6]" />
              Recent Meetings
            </h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{recentMeetings.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {recentMeetings.length > 0 ? (
              recentMeetings.map(meeting => (
                <div key={meeting.id} className="p-4">
                  <p className="text-sm font-medium text-gray-800 mb-1">{meeting.title}</p>
                  <p className="text-xs text-gray-500">{meeting.date}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No recent meetings</div>
            )}
          </div>
          <div className="bg-gray-50 p-3 border-t border-gray-200">
            <a href="#" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95]">
              View all meetings →
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-[#0056a6]" />
              Recent Decisions
            </h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{recentDecisions.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {recentDecisions.length > 0 ? (
              recentDecisions.map(decision => (
                <div key={decision.id} className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-gray-800">{decision.title}</p>
                    <span className={`text-xs px-2 py-0.5 ml-2 rounded-full ${getStatusColor(decision.status)}`}>
                      {decision.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{decision.date}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No recent decisions</div>
            )}
          </div>
          <div className="bg-gray-50 p-3 border-t border-gray-200">
            <a href="#" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95]">
              View all decisions →
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-[#0056a6]" />
              Upcoming Milestones
            </h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{upcomingMilestones.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingMilestones.length > 0 ? (
              upcomingMilestones.map(milestone => (
                <div key={milestone.id} className="p-4">
                  <p className="text-sm font-medium text-gray-800 mb-1">{milestone.title}</p>
                  <p className="text-xs text-gray-500">{milestone.date}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No upcoming milestones</div>
            )}
          </div>
          <div className="bg-gray-50 p-3 border-t border-gray-200">
            <a href="#" className="text-sm font-medium text-[#0056a6] hover:text-[#004e95]">
              View project timeline →
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center">
          <MessageSquare className="h-4 w-4 mr-2 text-[#0056a6]" />
          Project Discussion
        </h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Discussion timeline and community feedback coming soon</p>
          <button className="px-4 py-2 bg-[#0056a6] text-white rounded-lg hover:bg-[#004e95] transition-colors">
            Subscribe to Updates
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;