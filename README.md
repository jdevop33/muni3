# CouncilInsight for Oak Bay

CouncilInsight is a next-generation council meeting intelligence platform for Oak Bay that makes municipal meetings searchable, accessible, and connected to community projects.

## Features

- **Meeting Intelligence**: Search and access council meeting records, transcripts, and decisions.
- **Decision Tracking**: Follow the progress of council decisions and their implementation.
- **Topic Analysis**: Explore topics discussed across multiple meetings.
- **Data Integration**: Automated ingestion of meeting data from the Oak Bay municipal website.

## Architecture

CouncilInsight consists of two main components:

1. **CouncilInsight Web Application**: A full-stack web application built with Node.js, React, and PostgreSQL.
2. **Maxun Integration**: A data extraction engine that scrapes and processes data from the Oak Bay municipal website.

## Setup & Deployment

### Prerequisites

- Docker and Docker Compose
- Node.js v20+ (for local development)
- PostgreSQL (automatically provisioned in Docker Compose)

### Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

### Docker Deployment

The entire application stack can be run using Docker Compose:

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

### Cloud Deployment

We provide a deployment script for Google Cloud Run:

```bash
# Build the Docker image
./deploy.sh build

# Push to Google Container Registry
./deploy.sh push

# Deploy to Cloud Run
./deploy.sh deploy

# Or do all steps at once
./deploy.sh all
```

## Maxun Integration

CouncilInsight uses Maxun for data extraction from the Oak Bay municipal website.

### Setting up Maxun

1. Start the Maxun services: `docker-compose up -d maxun-postgres maxun-redis maxun-minio maxun-backend maxun-frontend`
2. Access the Maxun dashboard at http://localhost:5174
3. Create a new account and log in
4. Generate an API key from your user profile
5. Add the API key to your environment variables (MAXUN_API_KEY)

### Creating Robots

1. In the Maxun dashboard, create a new robot
2. Configure it to scrape the Oak Bay meeting pages
3. Run the robot to extract meeting data
4. Use the CouncilInsight Data Ingestion page to synchronize the data with the database

## Direct Data Upload

If you prefer not to use Maxun for data extraction, CouncilInsight also supports direct data upload:

1. Navigate to the Data Ingestion page
2. Select the "Direct Upload" tab
3. Choose the data type (Meetings, Decisions, or Topics)
4. Enter your data in JSON format or use the template
5. Click "Upload Data" to import it into the database

## Contributing

We welcome contributions to CouncilInsight! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.