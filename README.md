# CouncilInsight Documentation

CouncilInsight is a council meeting intelligence platform designed to enhance municipal transparency and community engagement for Oak Bay. This document provides comprehensive information about the application architecture, features, and development guidelines.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Maxun Integration](#maxun-integration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

CouncilInsight transforms how municipal council meetings are accessed and analyzed, focusing on both city managers' and community members' needs. The platform makes council meetings searchable and accessible, providing insights into discussions, decisions, and topics to improve transparency in municipal governance.

## Features

### Dashboard
- Meeting statistics and key metrics
- Recent and upcoming meetings overview
- Decision tracking and analytics
- Topic trend analysis

### Meeting Management
- Comprehensive meeting information
- Video and transcript integration
- Key discussion highlights
- Searchable meeting content

### Decision Tracking
- Decision history with voting records
- Status tracking and implementation monitoring
- Related topics and neighborhood impacts

### Topic Analysis
- Topic categorization and tracking
- Trend analysis over time
- Cross-meeting topic relationships

### Neighborhood Focus
- Geographic impact visualization
- Neighborhood-specific decision tracking
- Community-focused insights

### Data Ingestion
- Maxun integration for web scraping
- Direct document upload capabilities
- CSV data import functionality

## Architecture

CouncilInsight implements a dual-deployment architecture:

1. **Web Application (Frontend + API)**: Deployed on Vercel
   - React-based frontend with TanStack Query
   - Express.js backend with RESTful APIs
   - Serverless functions for extended functionality

2. **Data Ingestion Service**: Deployed on Google Cloud Run
   - Containerized Maxun robots for web scraping
   - Scheduled data collection jobs
   - Direct database writing capabilities

3. **Shared Database**: Neon PostgreSQL
   - Accessible to both services
   - Managed through Drizzle ORM
   - Serverless PostgreSQL for scalability

## Tech Stack

### Frontend
- React 18
- TypeScript
- TanStack Query for data fetching
- Tailwind CSS for styling
- Shadcn UI components
- Lucide React icons
- Wouter for routing

### Backend
- Express.js
- Drizzle ORM
- PostgreSQL (Neon)
- Node.js

### Data Ingestion
- Maxun (dockerized web scraping)
- Express.js APIs for triggering data collection
- CSV parsing utilities

### Deployment
- Vercel for web application
- Google Cloud Run for data ingestion service
- Neon for PostgreSQL database

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Docker (for Maxun development)
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/councilinsight.git
   cd councilinsight
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/councilinsight
   
   # For Maxun integration (if used)
   VITE_MAXUN_URL=http://your-maxun-instance:8080
   VITE_MAXUN_API_KEY=your-maxun-api-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Setup (Maxun)

For development with the Maxun scraping component:

1. Navigate to the Maxun directory:
   ```bash
   cd maxun
   ```

2. Build the Docker image:
   ```bash
   docker build -t maxun-local .
   ```

3. Run the container:
   ```bash
   docker run -p 8080:8080 -e DATABASE_URL=your-db-url maxun-local
   ```

## Project Structure

```
councilinsight/
├── client/               # Frontend code
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Application pages
│   │   └── App.tsx       # Main application component
├── server/               # Backend code
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage interface
│   ├── db.ts             # Database connection
│   ├── maxun-client.ts   # Maxun API client
│   └── index.ts          # Server entry point
├── shared/               # Shared code between client and server
│   └── schema.ts         # Database schema definitions
├── maxun/                # Maxun scraping service
│   ├── robots/           # Scraping robot definitions
│   ├── Dockerfile        # Docker configuration
│   └── server.js         # Maxun server code
├── public/               # Static assets
└── drizzle/              # Drizzle migration files
```

## Data Models

CouncilInsight uses several core data models to organize information:

### User
Represents application users with different permission levels.

### Meeting
Represents council meetings with metadata like date, type, status, etc.

### Decision
Tracks decisions made during council meetings, including voting records.

### Topic
Represents topics discussed across meetings.

### Neighborhood
Geographic areas referenced in discussions and decisions.

### MeetingDiscussion
Captures specific discussions within meetings.

### MeetingKeyMoment
Highlights important moments in meeting proceedings.

For detailed schema information, refer to `shared/schema.ts`.

## API Reference

CouncilInsight exposes a RESTful API for interacting with the application data. All API endpoints are prefixed with `/api`.

### Dashboard Endpoints
- `GET /api/dashboard/stats`: Get dashboard statistics

### Meeting Endpoints
- `GET /api/meetings`: Get all meetings
- `GET /api/meetings/recent`: Get recent meetings
- `GET /api/meetings/upcoming`: Get upcoming meetings
- `GET /api/meetings/:id`: Get meeting by ID
- `GET /api/meetings/:id/discussions`: Get discussions for a meeting
- `GET /api/meetings/:id/key-moments`: Get key moments for a meeting
- `POST /api/meetings/upload`: Upload meeting data

### Decision Endpoints
- `GET /api/decisions`: Get all decisions
- `GET /api/decisions/recent`: Get recent decisions
- `GET /api/decisions/:id`: Get decision by ID
- `GET /api/meetings/:id/decisions`: Get decisions for a meeting
- `POST /api/decisions/upload`: Upload decision data

### Topic Endpoints
- `GET /api/topics`: Get all topics
- `GET /api/topics/popular`: Get popular topics
- `GET /api/topics/:name`: Get topic by name
- `GET /api/topics/:name/meetings`: Get meetings for a topic
- `POST /api/topics/upload`: Upload topic data

### Neighborhood Endpoints
- `GET /api/neighborhoods`: Get all neighborhoods
- `GET /api/neighborhoods/:id`: Get neighborhood by ID
- `GET /api/neighborhoods/:id/meetings`: Get meetings for a neighborhood

### Maxun Integration Endpoints
- `GET /api/maxun/robots`: List available robots
- `POST /api/maxun/robots/:id/run`: Run a specific robot
- `GET /api/maxun/jobs/:id`: Get job status and results
- `POST /api/maxun/sync`: Sync robot data to database

## Environment Variables

CouncilInsight uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string

### Optional Variables
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)
- `VITE_MAXUN_URL`: URL to the Maxun service
- `VITE_MAXUN_API_KEY`: API key for Maxun authentication
- `VITE_MAXUN_USERNAME`: Username for Maxun basic authentication
- `VITE_MAXUN_PASSWORD`: Password for Maxun basic authentication
- `VITE_ENABLE_MAXUN_INTEGRATION`: Enable/disable Maxun integration (true/false)

**Note:** All client-side variables must be prefixed with `VITE_` to be accessible in the browser.

## Maxun Integration

CouncilInsight can integrate with the Maxun web scraping service to automatically collect council meeting data.

### Maxun Service Setup

1. Install Maxun (if not using the provided Docker container):
   ```bash
   npm install -g maxun
   ```

2. Configure Maxun with your scraping robots:
   ```bash
   mkdir -p maxun/robots
   # Add robot definitions to the robots directory
   ```

3. Start Maxun service:
   ```bash
   maxun start --port 8080
   ```

### Connecting CouncilInsight to Maxun

1. Set the Maxun URL and authentication in your environment variables:
   ```
   VITE_MAXUN_URL=http://localhost:8080
   VITE_MAXUN_API_KEY=your-api-key
   ```

2. Use the Data Ingestion page in CouncilInsight to:
   - View available robots
   - Run robots manually
   - Check job status
   - Import data from completed jobs

### Robot Development

To create new scraping robots for Maxun:

1. Create a new robot definition file in `maxun/robots/`
2. Define the scraping logic following Maxun's robot format
3. Restart the Maxun service to load the new robot
4. Access the robot through the CouncilInsight Data Ingestion page

## Deployment

CouncilInsight supports multiple deployment options, with the recommended approach being a dual-deployment to Vercel and Google Cloud Run. See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

## Troubleshooting

### Common Issues

#### Application Won't Start
- Check if all dependencies are installed
- Verify environment variables are correctly set
- Ensure the database connection is active

#### API Errors
- Check server logs for errors
- Verify database schema is up to date
- Ensure API endpoints are correctly called

#### Maxun Integration Issues
- Verify Maxun service is running
- Check authentication credentials
- Ensure robots are correctly defined

#### Database Issues
- Verify connection string is correct
- Check database permissions
- Run database migrations if needed

## Contributing

We welcome contributions to CouncilInsight! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

---

For more information or support, please contact the project maintainers.