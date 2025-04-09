import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Meeting, Decision, Topic, Neighborhood, StatsCard, DashboardStats } from '@/lib/types';
import StatsCardComponent from '@/components/dashboard/stats-card';
import RecentMeetings from '@/components/dashboard/recent-meetings';
import RecentDecisions from '@/components/dashboard/recent-decisions';
import UpcomingMeetings from '@/components/dashboard/upcoming-meetings';
import TopicInsights from '@/components/dashboard/topic-insights';
import NeighborhoodActivity from '@/components/dashboard/neighborhood-activity';

const Dashboard: React.FC = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: true
  });

  // Fetch recent meetings
  const { data: recentMeetings, isLoading: recentMeetingsLoading } = useQuery({
    queryKey: ['/api/meetings/recent'],
    enabled: true
  });

  // Fetch upcoming meetings
  const { data: upcomingMeetings, isLoading: upcomingMeetingsLoading } = useQuery({
    queryKey: ['/api/meetings/upcoming'],
    enabled: true
  });

  // Fetch recent decisions
  const { data: recentDecisions, isLoading: recentDecisionsLoading } = useQuery({
    queryKey: ['/api/decisions/recent'],
    enabled: true
  });

  // Fetch topics
  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['/api/topics/popular'],
    enabled: true
  });

  // Fetch neighborhoods
  const { data: neighborhoods, isLoading: neighborhoodsLoading } = useQuery({
    queryKey: ['/api/neighborhoods'],
    enabled: true
  });

  // Mock data for stats cards
  const statsCards: StatsCard[] = [
    {
      title: "Recent Meetings",
      count: stats?.recentMeetings || 12,
      change: 2,
      icon: "fa-calendar-alt",
      color: "blue",
      linkText: "View all",
      linkUrl: "/meetings"
    },
    {
      title: "Key Decisions",
      count: stats?.keyDecisions || 27,
      change: 5,
      icon: "fa-check-circle",
      color: "green",
      linkText: "View all",
      linkUrl: "/decisions"
    },
    {
      title: "Active Topics",
      count: stats?.activeTopics || 9,
      icon: "fa-lightbulb",
      color: "gold",
      linkText: "Analyze",
      linkUrl: "/topics"
    },
    {
      title: "Public Delegations",
      count: stats?.publicDelegations || 32,
      change: 12,
      icon: "fa-comment",
      color: "purple",
      linkText: "View all",
      linkUrl: "/delegations"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-8 mt-2">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-heading font-semibold text-gray-900 pb-1">
              Council Meeting Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Explore Oak Bay's council meetings, track topics, and monitor decisions
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <div className="relative inline-block text-left mr-2">
              <div className="flex">
                <button type="button" className="flex items-center text-sm text-gray-700 bg-white hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-md shadow-sm font-medium">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Last 3 months
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsCards.map((card, index) => (
          <StatsCardComponent key={index} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Recent Meetings and Decisions */}
        <div className="lg:col-span-2">
          <RecentMeetings 
            meetings={recentMeetings || []} 
            loading={recentMeetingsLoading} 
          />
          <RecentDecisions 
            decisions={recentDecisions || []} 
            loading={recentDecisionsLoading} 
          />
        </div>
        
        {/* Right column - Widgets */}
        <div>
          <UpcomingMeetings 
            meetings={upcomingMeetings || []} 
            loading={upcomingMeetingsLoading} 
          />
          <TopicInsights 
            topics={topics || []} 
            loading={topicsLoading} 
          />
          <NeighborhoodActivity 
            neighborhoods={neighborhoods || []} 
            loading={neighborhoodsLoading} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
