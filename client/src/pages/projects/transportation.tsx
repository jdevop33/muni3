import React from 'react';
import ProjectPage from '../../components/ui/project-page';

const TransportationPage: React.FC = () => {
  return (
    <ProjectPage
      title="Active Transportation Initiative"
      description="Enhancing Oak Bay's pedestrian and cycling infrastructure to promote sustainable transportation, improve safety, and reduce traffic congestion while supporting climate action goals."
      status="active"
      startDate="Oct 10, 2023"
      completionDate="Sep 30, 2025"
      lead="Michael Chen"
      leadRole="Transportation Engineer"
      relatedTopics={['Transportation', 'Cycling', 'Pedestrian Safety', 'Climate Action']}
      recentMeetings={[
        {
          id: 1,
          date: "Mar 14, 2024",
          title: "Bicycle Network Expansion Review"
        },
        {
          id: 2,
          date: "Feb 8, 2024",
          title: "Traffic Calming Measures Discussion"
        },
        {
          id: 3,
          date: "Jan 12, 2024",
          title: "Pedestrian Crossing Safety Assessment"
        }
      ]}
      recentDecisions={[
        {
          id: 1,
          date: "Mar 14, 2024",
          title: "Oak Bay Avenue Bike Lane Extension",
          status: "approved"
        },
        {
          id: 2,
          date: "Feb 8, 2024",
          title: "School Zone Safety Enhancement Funding",
          status: "approved"
        },
        {
          id: 3,
          date: "Jan 12, 2024",
          title: "Pedestrian-First Intersection Redesign",
          status: "pending"
        }
      ]}
      upcomingMilestones={[
        {
          id: 1,
          date: "Apr 22, 2024",
          title: "Community Cycling Workshop"
        },
        {
          id: 2,
          date: "May 18, 2024",
          title: "Henderson Road Corridor Improvements"
        },
        {
          id: 3,
          date: "June 15, 2024",
          title: "Active Transportation Master Plan Review"
        }
      ]}
    />
  );
};

export default TransportationPage;