# CouncilInsight Administrator Guide

This guide is intended for administrators who need to manage, configure, and maintain the CouncilInsight platform in a production environment.

## Table of Contents

- [Infrastructure Overview](#infrastructure-overview)
- [Initial Setup](#initial-setup)
- [User Management](#user-management)
- [Configuration Options](#configuration-options)
- [Data Management](#data-management)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Maintenance Tasks](#maintenance-tasks)

## Infrastructure Overview

CouncilInsight uses a three-tier architecture:

1. **Web Application (Vercel)**
   - Hosts the React frontend and API endpoints
   - Scales automatically based on traffic
   - Provides global CDN distribution

2. **Data Ingestion Service (Google Cloud Run)**
   - Runs containerized Maxun for data collection
   - Executes scheduled scraping jobs
   - Processes and normalizes data

3. **Database (Neon PostgreSQL)**
   - Stores all application data
   - Provides serverless scaling
   - Offers automated backups

## Initial Setup

### Domain Configuration

1. **Custom Domain Setup**:
   - In Vercel dashboard, go to your project settings
   - Click on "Domains"
   - Add your custom domain (e.g., councilinsight.oakbay.gov)
   - Configure DNS records as instructed by Vercel

2. **SSL Configuration**:
   - Vercel automatically provisions SSL certificates
   - Ensure all traffic uses HTTPS
   - Redirect HTTP to HTTPS

### Initial Administrator Account

1. Access the database directly to create the first administrator:
   ```sql
   INSERT INTO users (username, password_hash, role, name, email) 
   VALUES (
     'admin', 
     -- Use a secure password hash
     '$2a$10$...',
     'admin',
     'Administrator',
     'admin@example.com'
   );
   ```

2. Log in with the created administrator account
3. Use the administrator interface to create additional users

## User Management

CouncilInsight supports multiple user roles:

1. **Administrator**:
   - Full system access
   - Can manage users and configurations
   - Can access all data

2. **Content Manager**:
   - Can add and edit meeting data
   - Can manage topics and decisions
   - Cannot access system configurations

3. **Viewer**:
   - Read-only access to data
   - Cannot make any changes
   - Ideal for council members and public users

### Adding Users

1. Log in as an administrator
2. Navigate to Settings > User Management
3. Click "Add User"
4. Fill in user details:
   - Username
   - Email
   - Role
   - Initial password (will require change on first login)
5. Save changes

### Modifying User Permissions

1. Navigate to Settings > User Management
2. Find the user you want to modify
3. Click "Edit"
4. Change role or other permissions
5. Save changes

### Disabling Users

1. Navigate to Settings > User Management
2. Find the user you want to disable
3. Click "Disable Account"
4. Confirm the action

Disabled users cannot log in but their account information is preserved.

## Configuration Options

### Environment Variables

Critical system configuration is managed through environment variables:

1. **Database Configuration**:
   - `DATABASE_URL`: Connection string for PostgreSQL

2. **Maxun Configuration**:
   - `VITE_MAXUN_URL`: URL to the Maxun service
   - `VITE_MAXUN_API_KEY`: API key for authentication

3. **Application Settings**:
   - `VITE_ENABLE_MAXUN_INTEGRATION`: Enable/disable Maxun (true/false)

### Updating Environment Variables

1. **In Vercel**:
   - Go to your project in the Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add or update variables as needed
   - Redeploy the application for changes to take effect

2. **In Google Cloud Run**:
   - Go to the Cloud Run service in Google Cloud Console
   - Click "Edit & Deploy New Revision"
   - Update environment variables
   - Deploy the new revision

## Data Management

### Data Ingestion Configuration

Configure data sources in the Data Ingestion page:

1. **Maxun Robots**:
   - Configure scraping frequency
   - Set target URLs
   - Configure scraping depth

2. **Direct Uploads**:
   - Configure acceptable file formats
   - Set validation rules
   - Configure data mapping

### Data Retention Policies

Set data retention policies in Settings > Data Management:

1. **Meeting Records**:
   - How long to keep historical meetings
   - Archiving policies

2. **Analytics Data**:
   - Aggregation timeframes
   - Historical data preservation

### Database Maintenance

Regularly perform database maintenance:

1. **Vacuuming**:
   - Schedule regular VACUUM operations
   - Clear unused space

2. **Index Optimization**:
   - Review and optimize indexes
   - Rebuild indexes as needed

3. **Query Performance**:
   - Monitor slow queries
   - Optimize problematic queries

## Monitoring and Logging

### Application Monitoring

1. **Vercel Monitoring**:
   - View application performance in Vercel dashboard
   - Monitor error rates and response times
   - Set up alerts for critical issues

2. **Google Cloud Monitoring**:
   - Monitor Cloud Run services
   - Track resource usage and costs
   - Set up SLO monitoring

### Database Monitoring

1. **Neon Dashboard**:
   - Monitor database performance
   - Track connection counts
   - Monitor storage usage

2. **Query Monitoring**:
   - Track slow queries
   - Monitor query patterns
   - Optimize based on usage patterns

### Error Tracking

1. **Application Errors**:
   - Review error logs in Vercel dashboard
   - Track frontend errors
   - Monitor API failures

2. **Scraping Errors**:
   - Monitor Maxun job failures
   - Track data quality issues
   - Address recurring problems

## Backup and Recovery

### Database Backups

1. **Automated Backups**:
   - Neon provides automated daily backups
   - Configure retention period in Neon dashboard

2. **Manual Backups**:
   - Use pg_dump for manual backups
   - Store backups securely off-site

### Recovery Procedures

In case of data loss or corruption:

1. **Point-in-Time Recovery**:
   - Use Neon's point-in-time recovery feature
   - Select the appropriate recovery point
   - Follow Neon's restoration process

2. **Manual Restoration**:
   - Restore from pg_dump backup
   - Verify data integrity
   - Update application configurations if needed

## Security Considerations

### Authentication Security

1. **Password Policies**:
   - Enforce strong passwords
   - Implement password expiration
   - Consider two-factor authentication

2. **Session Management**:
   - Configure session timeouts
   - Implement IP restrictions if needed
   - Monitor unusual login patterns

### Data Protection

1. **Database Security**:
   - Restrict database access
   - Use encrypted connections
   - Apply principle of least privilege

2. **API Security**:
   - Implement rate limiting
   - Validate all inputs
   - Use appropriate authentication for all endpoints

### Compliance Considerations

1. **Data Retention**:
   - Configure retention policies according to regulations
   - Implement data deletion workflows

2. **Privacy Protections**:
   - Anonymize sensitive data
   - Implement access controls
   - Track data access

## Troubleshooting

### Common Issues

1. **Application Not Loading**:
   - Check Vercel deployment status
   - Verify DNS configuration
   - Check for JavaScript errors in browser console

2. **API Errors**:
   - Review server logs in Vercel dashboard
   - Check database connectivity
   - Verify API authentication

3. **Data Ingestion Issues**:
   - Check Maxun service status
   - Verify robot configurations
   - Review scraping logs

### Advanced Troubleshooting

1. **Database Connectivity Issues**:
   - Check database connection strings
   - Verify network access
   - Review database logs

2. **Performance Problems**:
   - Analyze slow queries
   - Check for resource limitations
   - Monitor memory usage

## Maintenance Tasks

### Regular Maintenance Checklist

#### Weekly Tasks
- Review error logs
- Monitor database performance
- Check successful data ingestion

#### Monthly Tasks
- Review user accounts and permissions
- Check for system updates
- Verify backup integrity

#### Quarterly Tasks
- Review and optimize database queries
- Update documentation if needed
- Review security configurations

### Updating the Application

When new versions are released:

1. **Update Web Application**:
   - Push changes to the connected Git repository
   - Vercel will automatically deploy updates
   - Verify successful deployment

2. **Update Data Ingestion Service**:
   - Build new Docker image
   - Push to Google Container Registry
   - Deploy new version to Cloud Run

3. **Database Schema Updates**:
   - Review migration scripts
   - Test migrations in staging environment
   - Apply migrations during low-traffic periods

---

For additional support or questions, contact the development team.