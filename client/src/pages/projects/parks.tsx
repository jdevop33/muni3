import React from 'react';
import ProjectPage from '../../components/ui/project-page';

const ParksPage: React.FC = () => {
  return (
    <ProjectPage
      title="Parks & Facilities Modernization"
      description="Revitalizing Oak Bay's parks, recreational spaces, and community facilities to improve accessibility, enhance environmental sustainability, and provide modern amenities for residents of all ages."
      status="active"
      startDate="Feb 8, 2024"
      completionDate="Mar 31, 2026"
      lead="Emily Rodriguez"
      leadRole="Parks & Recreation Director"
      relatedTopics={['Parks', 'Recreation', 'Accessibility', 'Environmental Sustainability']}
      recentMeetings={[
        {
          id: 1,
          date: "Mar 22, 2024",
          title: "Recreation Center Renovation Review"
        },
        {
          id: 2,
          date: "Mar 5, 2024",
          title: "Waterfront Park Enhancement Planning"
        },
        {
          id: 3,
          date: "Feb 18, 2024",
          title: "Community Garden Expansion Consultation"
        }
      ]}
      recentDecisions={[
        {
          id: 1,
          date: "Mar 22, 2024",
          title: "Playground Equipment Modernization",
          status: "approved"
        },
        {
          id: 2,
          date: "Mar 5, 2024",
          title: "Accessibility Improvements Budget",
          status: "approved"
        },
        {
          id: 3,
          date: "Feb 18, 2024",
          title: "Native Plant Restoration Program",
          status: "pending"
        }
      ]}
      upcomingMilestones={[
        {
          id: 1,
          date: "Apr 15, 2024",
          title: "Community Sports Field Assessment"
        },
        {
          id: 2,
          date: "May 3, 2024",
          title: "Parks Master Plan Public Forum"
        },
        {
          id: 3,
          date: "June 12, 2024",
          title: "Recreation Center Design Unveiling"
        }
      ]}
    />
  );
};

export default ParksPage;