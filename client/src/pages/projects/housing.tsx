import React from 'react';
import ProjectPage from '../../components/ui/project-page';

const HousingPage: React.FC = () => {
  return (
    <ProjectPage
      title="Housing Action Plan"
      description="Comprehensive initiative to address housing affordability, diversity, and supply in Oak Bay, focusing on sustainable growth while preserving neighborhood character."
      status="active"
      startDate="Jan 15, 2024"
      completionDate="Dec 31, 2025"
      lead="Sarah Johnson"
      leadRole="Director of Planning"
      relatedTopics={['Housing', 'Zoning', 'Affordability', 'Urban Planning']}
      recentMeetings={[
        {
          id: 1,
          date: "Mar 28, 2024",
          title: "Housing Needs Assessment Review"
        },
        {
          id: 2,
          date: "Feb 15, 2024",
          title: "Public Consultation - Housing Options"
        },
        {
          id: 3,
          date: "Jan 22, 2024",
          title: "Housing Action Plan Launch"
        }
      ]}
      recentDecisions={[
        {
          id: 1,
          date: "Mar 28, 2024",
          title: "Secondary Suite Policy Amendments",
          status: "approved"
        },
        {
          id: 2,
          date: "Feb 15, 2024",
          title: "Affordable Housing Fund Allocation",
          status: "pending"
        }
      ]}
      upcomingMilestones={[
        {
          id: 1,
          date: "Apr 18, 2024",
          title: "Draft Housing Strategy Presentation"
        },
        {
          id: 2,
          date: "May 12, 2024",
          title: "Public Hearing - Zoning Amendments"
        },
        {
          id: 3,
          date: "June 5, 2024",
          title: "Housing Diversity Policy Review"
        }
      ]}
    />
  );
};

export default HousingPage;