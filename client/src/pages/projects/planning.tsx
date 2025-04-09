import React from 'react';
import ProjectPage from '../../components/ui/project-page';

const PlanningPage: React.FC = () => {
  return (
    <ProjectPage
      title="Community Planning Framework"
      description="Developing a comprehensive planning framework for Oak Bay that balances growth, heritage preservation, and community values to guide decision-making and development for the next decade."
      status="active"
      startDate="Nov 15, 2023"
      completionDate="Dec 15, 2024"
      lead="David Thompson"
      leadRole="Chief Planner"
      relatedTopics={['Urban Planning', 'Heritage', 'Zoning', 'Community Development']}
      recentMeetings={[
        {
          id: 1,
          date: "Mar 18, 2024",
          title: "Heritage Conservation Area Review"
        },
        {
          id: 2,
          date: "Feb 22, 2024",
          title: "Commercial Areas Revitalization Strategy"
        },
        {
          id: 3,
          date: "Jan 30, 2024",
          title: "Community Design Guidelines Workshop"
        }
      ]}
      recentDecisions={[
        {
          id: 1,
          date: "Mar 18, 2024",
          title: "Heritage Inventory Update",
          status: "approved"
        },
        {
          id: 2,
          date: "Feb 22, 2024",
          title: "Village Core Enhancement Program",
          status: "pending"
        },
        {
          id: 3,
          date: "Jan 30, 2024",
          title: "Neighborhood Character Definitions",
          status: "approved"
        }
      ]}
      upcomingMilestones={[
        {
          id: 1,
          date: "Apr 25, 2024",
          title: "Draft Planning Framework Release"
        },
        {
          id: 2,
          date: "May 20, 2024",
          title: "Community Open Houses (3 Locations)"
        },
        {
          id: 3,
          date: "June 28, 2024",
          title: "Planning Framework Revision Based on Feedback"
        }
      ]}
    />
  );
};

export default PlanningPage;