# CouncilInsight Quick Deployment Guide

This guide provides a simplified overview of deployment options for the CouncilInsight platform. For detailed instructions, refer to [DEPLOY.md](./DEPLOY.md).

## Option 1: Vercel + Google Cloud Run (Recommended)

### Step 1: Deploy Web Application to Vercel

```bash
# Run the Vercel deployment script
./deploy-vercel.sh
```

This script will:
- Install Vercel CLI if needed
- Prompt you for environment variables
- Deploy the application to Vercel

### Step 2: Deploy Maxun Service to Google Cloud Run

```bash
# Ensure you have Google Cloud SDK installed
# https://cloud.google.com/sdk/docs/install

# Set up environment variable
export DATABASE_URL=your-neon-connection-string

# Run the GCP deployment script
cd maxun
./deploy-gcp.sh
```

### Step 3: Update Vercel with Maxun URL

After deploying to Google Cloud Run, update your Vercel environment variables with the Maxun service URL.

## Option 2: All-in-One Google Cloud Run Deployment

```bash
# Set up environment variable
export DATABASE_URL=your-neon-connection-string

# Run the all-in-one deployment script
./deploy-cloudrun.sh
```

This script deploys both the web application and Maxun service to Google Cloud Run.

## Option 3: Manual Deployment

For custom deployment configurations, follow the detailed instructions in [DEPLOY.md](./DEPLOY.md).

## Prerequisites for All Options

1. PostgreSQL database (e.g., from Neon)
   - You will need your database connection string in the format:
   - `postgresql://user:password@endpoint:port/database`

2. Git repository for your codebase
   - Ensure you've committed all changes

3. For Google Cloud deployments:
   - Google Cloud account
   - Google Cloud SDK installed
   - Project created in Google Cloud

4. For Vertex AI integration (optional):
   - Enable Vertex AI API in GCP

## Post-Deployment

After deploying, verify your application by:

1. Testing the web interface
2. Checking if the Maxun service can be accessed
3. Running a test scrape from the Data Ingestion page
4. Verifying data appears in the application