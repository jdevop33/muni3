# CouncilInsight Deployment Guide

This guide provides step-by-step instructions for deploying CouncilInsight to various cloud platforms, with a focus on Vercel + Neon DB integration as the recommended approach.

## 1. Vercel Deployment (Recommended)

### Prerequisites
- A Vercel account (https://vercel.com)
- A Neon Database account (https://neon.tech)
- Git repository with your CouncilInsight codebase

### Setup Neon Database

1. Sign up or log in to Neon (https://neon.tech)
2. Create a new project
3. Create a new database named `councilinsight`
4. Go to the "Connection Details" section and copy your connection string
   - It should look like: `postgresql://username:password@endpoint/councilinsight`

### Deploy to Vercel

#### Option 1: Using Vercel Dashboard (Recommended for beginners)

1. Log in to your Vercel account
2. Click "Add New..." and select "Project"
3. Import your Git repository containing CouncilInsight
4. Configure project settings:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `MAXUN_URL`: URL to your Maxun instance (if applicable)
   - `MAXUN_API_KEY`: Your Maxun API key (if using API authentication)
   - Or `MAXUN_USERNAME` and `MAXUN_PASSWORD` if using basic authentication
6. Click "Deploy"
7. Once deployed, your app will be available at `https://your-project-name.vercel.app`

#### Option 2: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to your project directory and run:
   ```bash
   vercel
   ```

3. Follow the CLI prompts to connect to your Vercel account and configure the project
4. When asked about environment variables, add the same ones mentioned in Option 1
5. For subsequent deployments, use:
   ```bash
   vercel --prod
   ```

### Connect Neon and Vercel (Optional but recommended)

For even tighter integration:

1. In your Neon dashboard, go to the "Integrations" tab
2. Select Vercel integration
3. Connect to your Vercel account and select your project
4. This will automatically set up the `DATABASE_URL` in your Vercel project

### Initial Database Setup

After deployment, you'll need to initialize your database:

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Functions" > "Console"
3. Run the database push command:
   ```bash
   npm run db:push
   ```

## 2. Google Cloud Run Deployment

CouncilInsight includes built-in support for Google Cloud Run deployment via the included `deploy.sh` script.

### Prerequisites
- Google Cloud CLI installed and configured
- Docker installed locally
- A Google Cloud project with billing enabled
- Cloud Run API enabled in your Google Cloud project

### Deployment Steps

1. Update the `deploy.sh` script with your Google Cloud project ID if needed
2. Set up environment variables:
   ```bash
   export PROJECT_ID=your-gcp-project-id
   export DATABASE_URL=your-postgresql-connection-string
   export MAXUN_URL=your-maxun-url
   export MAXUN_API_KEY=your-maxun-api-key
   ```

3. Run the deployment script:
   ```bash
   ./deploy.sh all
   ```

4. The script will:
   - Build your application Docker image
   - Push it to Google Container Registry
   - Deploy it to Cloud Run
   - Output the deployed URL

## 3. AWS Elastic Beanstalk Deployment

For AWS users, Elastic Beanstalk provides a simple way to deploy the application.

### Prerequisites
- AWS account
- AWS CLI installed and configured
- EB CLI installed

### Deployment Steps

1. Initialize the EB CLI in your project directory:
   ```bash
   eb init
   ```

2. Create a new environment:
   ```bash
   eb create councilinsight-production
   ```

3. Set environment variables:
   ```bash
   eb setenv DATABASE_URL=your-postgresql-connection-string MAXUN_URL=your-maxun-url MAXUN_API_KEY=your-maxun-api-key
   ```

4. Deploy the application:
   ```bash
   eb deploy
   ```

## 4. Custom Server Deployment with Docker

For deployment to any server with Docker support:

1. Make sure Docker and Docker Compose are installed on your server
2. Clone your repository to the server
3. Create a `.env` file with all required environment variables
4. Start the application with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Troubleshooting

### Database Connection Issues
- Verify that your DATABASE_URL is correct and accessible from the deployment platform
- For Neon DB, ensure that your IP address is allowed in the connection pooling settings
- Check that the required database extensions are enabled

### Application Errors
- Review the deployment logs in your platform's dashboard
- Check application logs using the platform's logging interface
- For Vercel, use the "Functions" > "Logs" section in your project dashboard

### Maxun Integration Issues
- Verify that your Maxun instance is accessible from the internet
- Check that your API key or credentials are correctly set up
- Try running a test robot from the Data Ingestion page after deployment

## Maintenance

### Database Migrations
CouncilInsight uses Drizzle ORM which handles schema migrations automatically. To update your database schema:

1. Make changes to your schema in `shared/schema.ts`
2. Run `npm run db:push` to apply the changes to your database

### Updating the Application
For updates:

1. Push your changes to your Git repository
2. If using Vercel with GitHub integration, changes will be deployed automatically
3. Otherwise, run the appropriate deployment command for your platform