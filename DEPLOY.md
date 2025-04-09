# CouncilInsight Deployment Guide

This guide provides step-by-step instructions for deploying CouncilInsight to various cloud platforms, with a focus on the recommended dual-deployment architecture: Vercel for the web application and Google Cloud Run for the data ingestion service.

## Recommended Architecture

CouncilInsight works best with a dual-deployment approach:
1. **Web Application:** Deploy to Vercel for optimal frontend performance and serverless functions
2. **Data Ingestion Service (Maxun):** Deploy to Google Cloud Run for containerized robot execution
3. **Shared Database:** Neon PostgreSQL database accessible to both services

This architecture separates concerns while maintaining data consistency through the shared database.

## 1. Vercel Deployment (Web Application)

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
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`
   - Root Directory: `./` (project root)
5. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `VITE_MAXUN_URL`: URL to your Maxun instance (if applicable)
   - `VITE_MAXUN_API_KEY`: Your Maxun API key (if using API authentication)
   - Or `VITE_MAXUN_USERNAME` and `VITE_MAXUN_PASSWORD` if using basic authentication
6. Click "Deploy"
7. Once deployed, your app will be available at `https://your-project-name.vercel.app`

**Note: vercel.json Configuration**
CouncilInsight includes a `vercel.json` file in the root directory that contains configuration specifically for Vercel deployment, including:
- URL rewrites to support SPA routing
- Build configuration optimized for Vite apps

**Note about Environment Variables:**
- All client-side environment variables must be prefixed with `VITE_` to be accessible in the browser.
- For backend environment variables (like `DATABASE_URL`), use normal naming conventions.
- Vercel automatically exposes system environment variables like `VERCEL_ENV`.

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

## 2. Google Cloud Run Deployment (Maxun Data Ingestion Service)

For the data ingestion service, we use Google Cloud Run which is ideal for containerized applications.

### Prerequisites
- Google Cloud CLI installed and configured
- Docker installed locally for building containers
- A Google Cloud project with billing enabled
- Cloud Run API enabled in your Google Cloud project

### Deployment Steps for Maxun Container

1. Inside the root directory, navigate to the Maxun directory:
   ```bash
   cd maxun
   ```

2. Build the Maxun Docker image:
   ```bash
   docker build -t gcr.io/[YOUR_PROJECT_ID]/maxun-service .
   ```

3. Push the image to Google Container Registry:
   ```bash
   docker push gcr.io/[YOUR_PROJECT_ID]/maxun-service
   ```

4. Deploy the container to Cloud Run:
   ```bash
   gcloud run deploy maxun-service \
     --image gcr.io/[YOUR_PROJECT_ID]/maxun-service \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="DATABASE_URL=[YOUR_NEON_DB_URL],MAXUN_API_KEY=[YOUR_API_KEY]"
   ```

5. Configure scheduled jobs (recommended for production):
   ```bash
   gcloud scheduler jobs create http maxun-daily-scrape \
     --schedule="0 2 * * *" \
     --uri="https://maxun-service-[HASH].run.app/api/maxun/sync" \
     --http-method=POST
   ```

### Connecting Web App to Maxun Service

Once deployed, update your Vercel environment variables:
- `VITE_MAXUN_URL`: Set to the URL of your deployed Cloud Run service (e.g., `https://maxun-service-[HASH].run.app`)
- `VITE_MAXUN_API_KEY`: Your Maxun API key for authentication

This architecture allows:
- Scheduled data collection through Cloud Run
- On-demand data collection triggered from the web application
- Consistent data access through the shared Neon database

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
- Ensure your Cloud Run service has the necessary permissions to access the database

### Dual-Deployment Architecture Issues
- **Cross-Origin Issues:** If you experience CORS errors, ensure your Cloud Run service has the appropriate headers:
  ```
  Access-Control-Allow-Origin: https://your-vercel-app.vercel.app
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
  ```
- **Synchronization Issues:** If data isn't appearing in the web app after ingestion:
  1. Check database permissions for both services
  2. Verify that both services are using the same database schema version
  3. Check Cloud Run logs for any errors during data processing
- **Authentication Issues:** Ensure your Maxun API key is correctly set in both environments

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