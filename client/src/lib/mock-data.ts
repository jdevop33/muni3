import { Meeting, Decision, Topic, Neighborhood, StatsCard, DashboardStats } from '@/lib/types';

// Use this data when the API isn't available yet for local development

export const dashboardStats: DashboardStats = {
  recentMeetings: 12,
  keyDecisions: 27,
  activeTopics: 9,
  publicDelegations: 32
};

export const statsCards: StatsCard[] = [
  {
    title: "Recent Meetings",
    count: 12,
    change: 2,
    icon: "fa-calendar-alt",
    color: "blue",
    linkText: "View all",
    linkUrl: "/meetings"
  },
  {
    title: "Key Decisions",
    count: 27,
    change: 5,
    icon: "fa-check-circle",
    color: "green",
    linkText: "View all",
    linkUrl: "/decisions"
  },
  {
    title: "Active Topics",
    count: 9,
    icon: "fa-lightbulb",
    color: "gold",
    linkText: "Analyze",
    linkUrl: "/topics"
  },
  {
    title: "Public Delegations",
    count: 32,
    change: 12,
    icon: "fa-comment",
    color: "purple",
    linkText: "View all",
    linkUrl: "/delegations"
  }
];

export const recentMeetings: Meeting[] = [
  {
    id: 1,
    title: "Regular Council Meeting",
    type: "Regular Council Meeting",
    date: "April 4, 2025",
    startTime: "7:00 PM",
    duration: "2h 15m",
    status: "Completed",
    topics: ["Housing", "Community Planning", "Budget"],
    keyDecisions: [
      {
        id: 1,
        text: "Approved updates to the Official Community Plan with 6-1 vote",
        icon: "fa-check"
      },
      {
        id: 2,
        text: "Approved budget amendments for Henderson Cycling Facility Project",
        icon: "fa-check"
      }
    ],
    participants: 7,
    hasVideo: true,
    hasTranscript: true,
    hasMinutes: true
  },
  {
    id: 2,
    title: "Committee of the Whole",
    type: "Committee of the Whole",
    date: "March 25, 2025",
    startTime: "6:00 PM",
    duration: "1h 45m",
    status: "Completed",
    topics: ["Parks & Facilities", "Public Works"],
    keyDiscussions: [
      {
        id: 1,
        text: "Reviewed Carnarvon Park Master Plan implementation timeline",
        icon: "fa-comment"
      },
      {
        id: 2,
        text: "Discussed Uplands Sewer Separation Project phase completion",
        icon: "fa-comment"
      }
    ],
    participants: 5,
    hasVideo: true,
    hasTranscript: true,
    hasMinutes: true
  },
  {
    id: 3,
    title: "Special Council Meeting",
    type: "Special Council Meeting",
    date: "March 15, 2025",
    startTime: "7:30 PM",
    duration: "50m",
    status: "Completed",
    topics: ["Budget", "Capital Projects"],
    participants: 6,
    hasVideo: true,
    hasTranscript: true,
    hasMinutes: true
  }
];

export const upcomingMeetings: Meeting[] = [
  {
    id: 4,
    title: "Regular Council Meeting",
    type: "Regular Council Meeting",
    date: "May 2, 2025",
    startTime: "7:00 PM",
    duration: "",
    status: "Scheduled",
    topics: [],
    participants: 0,
    hasVideo: false,
    hasTranscript: false,
    hasMinutes: false
  },
  {
    id: 5,
    title: "Committee of the Whole",
    type: "Committee of the Whole",
    date: "May 15, 2025",
    startTime: "6:00 PM",
    duration: "",
    status: "Scheduled",
    topics: [],
    participants: 0,
    hasVideo: false,
    hasTranscript: false,
    hasMinutes: false
  },
  {
    id: 6,
    title: "Parks, Recreation & Culture Advisory Committee",
    type: "Advisory Committee",
    date: "May 22, 2025",
    startTime: "5:30 PM",
    duration: "",
    status: "Scheduled",
    topics: [],
    participants: 0,
    hasVideo: false,
    hasTranscript: false,
    hasMinutes: false
  }
];

export const recentDecisions: Decision[] = [
  {
    id: 1,
    meetingId: 1,
    meeting: "Regular Council Meeting",
    meetingType: "Regular Council Meeting",
    title: "Approved Official Community Plan Updates",
    description: "Council voted 6-1 to approve the updated Official Community Plan including new housing density provisions for Village Center.",
    date: "April 4, 2025",
    topics: ["Housing", "Community Planning"],
    votesFor: 6,
    votesAgainst: 1,
    status: "Approved",
    type: "Motion"
  },
  {
    id: 2,
    meetingId: 1,
    meeting: "Regular Council Meeting",
    meetingType: "Regular Council Meeting",
    title: "Henderson Cycling Facility Budget Increase",
    description: "Council approved a budget amendment for the Henderson Road Cycling Facility with an additional $250,000 to complete Phase 2 implementation.",
    date: "April 4, 2025",
    topics: ["Active Transportation", "Budget"],
    votesFor: 7,
    votesAgainst: 0,
    status: "Approved",
    type: "Amendment"
  },
  {
    id: 3,
    meetingId: 2,
    meeting: "Committee of the Whole",
    meetingType: "Committee of the Whole",
    title: "Blasting Regulations Amendment",
    description: "Committee recommended council approve amendments to the blasting regulations bylaw to include more stringent notification requirements.",
    date: "March 25, 2025",
    topics: ["Public Works"],
    votesFor: 5,
    votesAgainst: 0,
    status: "Recommended",
    type: "Recommendation"
  }
];

export const popularTopics: Topic[] = [
  {
    id: 1,
    name: "Housing",
    count: 24,
    percentage: 100
  },
  {
    id: 2,
    name: "Parks & Facilities",
    count: 18,
    percentage: 75
  },
  {
    id: 3,
    name: "Community Planning",
    count: 15,
    percentage: 62.5
  },
  {
    id: 4,
    name: "Budget",
    count: 12,
    percentage: 50
  },
  {
    id: 5,
    name: "Active Transportation",
    count: 10,
    percentage: 41.7
  }
];

export const neighborhoods: Neighborhood[] = [
  {
    id: 1,
    name: "North Oak Bay",
    discussions: 8,
    lastDiscussed: "April 4, 2025",
    color: "blue"
  },
  {
    id: 2,
    name: "Central Oak Bay",
    discussions: 15,
    lastDiscussed: "April 4, 2025",
    color: "purple"
  },
  {
    id: 3,
    name: "South Oak Bay",
    discussions: 6,
    lastDiscussed: "March 25, 2025",
    color: "green"
  }
];
