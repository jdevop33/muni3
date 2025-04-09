// Common types used throughout the application

export interface User {
  id: number;
  name: string;
  role: string;
  avatar?: string;
}

export interface Meeting {
  id: number;
  title: string;
  type: 'Regular Council Meeting' | 'Committee of the Whole' | 'Special Council Meeting' | string;
  date: string;
  startTime: string;
  duration: string;
  status: 'Completed' | 'Scheduled' | 'In Progress' | 'Cancelled';
  topics: string[];
  keyDiscussions?: KeyDiscussion[];
  keyDecisions?: KeyDecision[];
  participants: number;
  hasVideo: boolean;
  hasTranscript: boolean;
  hasMinutes: boolean;
}

export interface KeyDiscussion {
  id: number;
  text: string;
  icon: string;
}

export interface KeyDecision {
  id: number;
  text: string;
  icon: string;
}

export interface Decision {
  id: number;
  meetingId: number;
  meeting: string;
  meetingType: string;
  title: string;
  description: string;
  date: string;
  topics: string[];
  votesFor?: number;
  votesAgainst?: number;
  status: string;
  type: string;
}

export interface Topic {
  id: number;
  name: string;
  count: number;
  percentage?: number;
}

export interface Neighborhood {
  id: number;
  name: string;
  discussions: number;
  lastDiscussed: string;
  color: string;
}

export interface MeetingDiscussion {
  id: number;
  meetingId: number;
  speakerId?: number;
  speakerName: string;
  speakerRole?: string;
  speakerAvatar?: string;
  text: string;
  timestamp: string;
  isDecision: boolean;
  decisionId?: number;
}

export interface MeetingKeyMoment {
  id: number;
  meetingId: number;
  title: string;
  timestamp: string;
  description?: string;
}

export interface DashboardStats {
  recentMeetings: number;
  keyDecisions: number;
  activeTopics: number;
  publicDelegations: number;
}

export interface StatsCard {
  title: string;
  count: number;
  change?: number;
  icon: string;
  color: string;
  linkText: string;
  linkUrl: string;
}
