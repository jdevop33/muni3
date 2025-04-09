# CouncilInsight Deployment Guide

This guide provides comprehensive instructions for deploying CouncilInsight using a dual-cloud architecture with Vercel and Google Cloud Platform.

## Architecture Overview

CouncilInsight consists of two primary components:

1. **Web Application**: A React/Node.js application deployed on Vercel
2. **Maxun Service**: A web scraping service deployed on Google Cloud Run

Both components share a single PostgreSQL database hosted on Neon.tech.

## Prerequisites

Before deployment, ensure you have:

- Accounts on:
  - [Vercel](https://vercel.com)
  - [Google Cloud Platform](https://cloud.google.com)
  - [Neon](https://neon.tech) (or another PostgreSQL provider)
- The following tools installed:
  - [Node.js](https://nodejs.org) (v18+)
  - [Git](https://git-scm.com)
  - [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- Your codebase in a Git repository (GitHub, GitLab, etc.)

## Step 1: Database Setup

1. Create a PostgreSQL database on Neon.tech:
   - Sign up/login at [neon.tech](https://neon.tech)
   - Create a new project called "CouncilInsight"
   - Create a database called "councilinsight"
   - Save your connection string: `postgresql://user:password@endpoint:port/councilinsight`

2. Initialize your database schema:
   ```bash
   # Set database URL in your environment
   export DATABASE_URL=your-neon-connection-string
   
   # Push schema to database
   npm run db:push
   ```

## Step 2: Deploy Web Application to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to a Git repository
2. Log in to [Vercel](https://vercel.com)
3. Click "Add New..." → "Project"
4. Import your repository
5. Configure project settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Root Directory: `./` (project root)
6. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `VITE_MAXUN_URL`: URL of your Maxun service (add after GCP deployment)
7. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel --prod
   ```

4. When prompted, enter your environment variables

## Step 3: Deploy Maxun Service to Google Cloud Run

1. Configure GCP Project:
   ```bash
   # Install Google Cloud SDK if you haven't already
   # https://cloud.google.com/sdk/docs/install
   
   # Initialize GCP and create project
   gcloud init
   gcloud projects create councilinsight-prod
   gcloud config set project councilinsight-prod
   
   # Enable required APIs
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com \
     artifactregistry.googleapis.com cloudscheduler.googleapis.com
   ```

2. Use the deployment script:
   ```bash
   # Ensure you're in the project root
   cd /path/to/councilinsight
   
   # Set your database URL
   export DATABASE_URL=your-neon-connection-string
   
   # Make the script executable (if needed)
   chmod +x maxun/deploy-gcp.sh
   
   # Run the deployment script
   cd maxun
   ./deploy-gcp.sh
   ```

3. The script will:
   - Create a Docker repository in Artifact Registry
   - Build and push the Docker image
   - Deploy the service to Cloud Run
   - Optionally create a scheduled job for the Oak Bay council scraper

4. After deployment, note the service URL provided by the script.

## Step 4: Connect the Components

1. Return to your Vercel project settings
2. Add/update the `VITE_MAXUN_URL` environment variable with your Cloud Run service URL
3. Trigger a redeployment on Vercel

## Step 5: Verify Deployment

1. Visit your Vercel app URL
2. Navigate to the Data Ingestion page
3. Verify connection to the Maxun service by checking if robots are listed
4. Test running a robot and check if data appears in the app

## Advanced Configuration

### Secure Cloud Run with Authentication

By default, the deploy script makes the Maxun service publicly accessible. To restrict access:

1. Update the service to require authentication:
   ```bash
   gcloud run services update maxun-service \
     --no-allow-unauthenticated
   ```

2. Create a service account for Vercel to access Cloud Run:
   ```bash
   # Create service account
   gcloud iam service-accounts create vercel-maxun-access
   
   # Grant necessary permissions
   gcloud run services add-iam-policy-binding maxun-service \
     --member="serviceAccount:vercel-maxun-access@councilinsight-prod.iam.gserviceaccount.com" \
     --role="roles/run.invoker"
   
   # Create a key
   gcloud iam service-accounts keys create vercel-maxun-key.json \
     --iam-account=vercel-maxun-access@councilinsight-prod.iam.gserviceaccount.com
   ```

3. Add the service account key to Vercel environment variables

### Enable Google Vertex AI Integration (Optional)

To leverage Google's AI capabilities for meeting analysis:

1. Enable the Vertex AI API:
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

2. Update your Maxun service with Vertex AI integration code (see server.js for details)

3. Redeploy the Maxun service

### Configure Custom Domain

#### For Vercel:
1. Go to your project settings in Vercel dashboard
2. Navigate to "Domains"
3. Add your custom domain and follow verification steps

#### For Cloud Run:
1. Add a custom domain mapping:
   ```bash
   gcloud beta run domain-mappings create \
     --service maxun-service \
     --domain api.councilinsight.com
   ```

2. Update DNS records as instructed by Google Cloud

## Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct and accessible from both services
- Check firewall settings in Neon dashboard
- Ensure you're using connection pooling for better performance

### Maxun Service Not Running
- Check Cloud Run logs: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=maxun-service"`
- Verify Docker build: Build locally with `docker build -t maxun-service maxun/`
- Check if database migration was successful

### Web Application Not Loading
- Check Vercel deployment logs in dashboard
- Verify environment variables are set correctly
- Test API endpoints manually using curl

## Maintenance and Updates

### Updating the Web Application
1. Push changes to your Git repository
2. Vercel will automatically redeploy

### Updating the Maxun Service
1. Make changes to the Maxun code
2. Run the deployment script again:
   ```bash
   cd maxun
   ./deploy-gcp.sh
   ```

### Database Migrations
When changing the database schema:
1. Update your schema in `shared/schema.ts`
2. Run `npm run db:push` to update the database
3. Redeploy both services to ensure compatibility

## Monitoring

### Vercel Analytics
Enable Vercel Analytics in your project settings for web application monitoring.

### Google Cloud Monitoring
Set up Cloud Monitoring for the Maxun service:
```bash
# Create an uptime check
gcloud monitoring uptime-check create http maxun-service-uptime \
  --display-name="Maxun Service Uptime" \
  --http-path="/health" \
  --period=300 \
  --timeout=30s \
  --uri="https://your-maxun-service-url.run.app"
```

## Cost Optimization

- Vercel: Use the Hobby plan for personal projects, Pro plan for professional use
- Google Cloud Run: Set appropriate min/max instances (0/10 recommended for cost-efficiency)
- Neon: Start with the free tier, upgrade as needed based on usage

## Security Best Practices

- Keep all API keys and credentials secure
- Regularly update dependencies
- Enable HTTPS for all endpoints
- Consider implementing rate limiting
- Use the principle of least privilege for service accounts

---

For additional support, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Neon Documentation](https://neon.tech/docs)