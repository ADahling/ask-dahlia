# Operations Playbook
## Ask Dahlia - Split Deployment (Netlify UI + Render Worker)

### Deployment Architecture

#### Split Deployment Model

Ask Dahlia uses a split deployment architecture with two primary components:

1. **Netlify UI**: Next.js frontend application with lightweight API routes
   - Handles user interface, authentication, and light proxy operations
   - Deployed as a static export to Netlify
   - Configured with essential environment variables

2. **Render Worker API**: Express.js backend service for heavy processing
   - Handles token-intensive operations (chat, embeddings, processing)
   - Manages direct provider interactions (OpenAI, Anthropic, etc.)
   - Connects to vector database and file storage
   - Deploys as a web service on Render

This split architecture allows us to:
- Keep the UI responsive and fast-loading
- Avoid Netlify function timeout limitations (10 seconds)
- Process large documents and run LLM operations without constraints
- Maintain a clean separation of concerns

### Deployment Process

#### Netlify UI Deployment

1. **Build Preparation**
   ```bash
   # Install dependencies
   cd ask-dahlia
   bun install

   # Build the application
   bun run build

   # Create deployment package
   mkdir -p output
   zip -r9 output/output.zip out
   ```

2. **Environment Variables**
   Configure these environment variables in Netlify:
   - `WORKER_API_BASE`: The URL of your Render worker (e.g., https://ask-dahlia-worker.onrender.com)
   - `WORKER_API_SECRET`: Shared secret for HMAC authentication
   - `DATABASE_URL`: Postgres connection string (with pgvector extension)
   - `JWT_SECRET`: Secret for JWT authentication
   - `NEXT_PUBLIC_APP_URL`: The Netlify URL of your application

3. **Deployment Settings**
   - Build command: `cd ask-dahlia && bun run build && mkdir -p output && zip -r9 output/output.zip out`
   - Publish directory: `ask-dahlia/output`
   - Output directory in `next.config.js`: Set to `out`
   - Next.js configuration: `output: 'export'` in `next.config.js`

4. **Post-Deployment Verification**
   - Verify that the site loads correctly
   - Check that authentication flows work
   - Confirm that the worker API connection is established
   - Test proxy functionality for API routes

#### Render Worker Deployment

1. **Service Configuration**
   - Service Type: Web Service
   - Runtime: Node.js
   - Build Command: `cd worker && npm install && npm run build`
   - Start Command: `cd worker && node dist/index.js`
   - Auto-Deploy: Yes

2. **Environment Variables**
   Configure these environment variables in Render:
   - `WORKER_API_SECRET`: Same as Netlify (for HMAC verification)
   - `DATABASE_URL`: Postgres connection string (with pgvector extension)
   - `OPENAI_API_KEY`: OpenAI API key
   - `ANTHROPIC_API_KEY`: Anthropic API key
   - `COHERE_API_KEY`: Cohere API key (for embeddings/reranking)
   - `ELEVENLABS_API_KEY`: ElevenLabs API key (for voice)
   - Other provider keys as needed
   - `SEC_USER_AGENT`: SEC EDGAR API user agent string

3. **Resource Allocation**
   - Recommended: Standard instance (512 MB)
   - For heavy usage: Plus instance (1 GB)
   - Scale up based on usage metrics

4. **Post-Deployment Verification**
   - Test the health endpoint: `GET /health`
   - Verify HMAC authentication works
   - Test a basic chat operation
   - Monitor logs for any errors

### Database Setup

#### Postgres with pgvector

1. **Create Database**
   We recommend using Neon or Supabase for PostgreSQL with pgvector support.

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Run Migrations**
   ```bash
   cd ask-dahlia
   bun drizzle-kit push:pg
   ```

3. **Verify Database**
   ```bash
   cd ask-dahlia
   bun drizzle-kit studio
   ```

### Monitoring and Troubleshooting

#### Netlify Monitoring

1. **View Deployment Status**
   - Netlify Dashboard > Sites > ask-dahlia > Deploys

2. **Check Build Logs**
   - Netlify Dashboard > Sites > ask-dahlia > Deploys > [Latest Deploy] > View deploy log

3. **Monitor Function Invocations**
   - Netlify Dashboard > Sites > ask-dahlia > Functions

4. **Common Issues and Solutions**
   - **Build Failures**: Check for missing dependencies or build configuration issues
   - **Function Timeouts**: Move intensive operations to the Worker API
   - **CORS Errors**: Verify CORS configuration in the Worker API

#### Render Monitoring

1. **View Service Status**
   - Render Dashboard > Web Services > ask-dahlia-worker

2. **Check Logs**
   - Render Dashboard > Web Services > ask-dahlia-worker > Logs

3. **Monitor Resource Usage**
   - Render Dashboard > Web Services > ask-dahlia-worker > Metrics

4. **Common Issues and Solutions**
   - **Memory Errors**: Increase service resources
   - **Timeout Errors**: Check long-running operations
   - **Connection Errors**: Verify database and provider connectivity

### Operational Procedures

#### Database Maintenance

1. **Backup Schedule**
   - Daily automated backups (provided by Neon/Supabase)
   - Weekly manual backups for critical data

2. **Index Optimization**
   - Monthly VACUUM ANALYZE
   - Quarterly reindex of vector indices

#### Security Procedures

1. **API Key Rotation**
   - Rotate provider API keys quarterly
   - Update keys in environment variables without downtime
   - Verify functionality after rotation

2. **Secret Management**
   - Store secrets in environment variables only
   - Never commit secrets to code
   - Use separate keys for development and production

#### Scaling Strategy

1. **Horizontal Scaling**
   - Deploy multiple worker instances for increased load
   - Use load balancing to distribute requests

2. **Vertical Scaling**
   - Increase worker resource allocation as needed
   - Monitor memory and CPU usage for scaling decisions

3. **Database Scaling**
   - Use connection pooling
   - Consider read replicas for high query loads
   - Scale database resources based on usage patterns

### Disaster Recovery

#### Backup and Restore

1. **Backup Procedures**
   - Database: Use provider backup mechanisms
   - Configuration: Store in version control
   - Environment variables: Document securely

2. **Restore Procedures**
   - Database: Restore from latest backup
   - Application: Redeploy from version control
   - Configuration: Reapply environment variables

#### Incident Response

1. **Service Outage**
   - Check worker logs for errors
   - Verify provider service status
   - Check database connectivity
   - Redeploy if necessary

2. **Data Breach**
   - Rotate all secrets and API keys
   - Audit access logs
   - Notify affected users if applicable
   - Address vulnerability

### Update Procedures

#### Frontend Updates

1. **Testing**
   - Verify locally with `bun dev`
   - Test against staging Worker API
   - Confirm all routes function properly

2. **Deployment**
   - Push changes to main branch
   - Trigger Netlify deployment
   - Verify deployment success

#### Worker API Updates

1. **Testing**
   - Test locally with `npm run dev`
   - Verify all endpoints function properly
   - Check error handling

2. **Deployment**
   - Push changes to main branch
   - Trigger Render deployment
   - Monitor logs during deployment

#### Database Schema Updates

1. **Migration Planning**
   - Create migration files with Drizzle
   - Test migrations in development environment
   - Document rollback procedure

2. **Migration Execution**
   - Schedule maintenance window if needed
   - Apply migrations with minimal downtime
   - Verify application functionality post-migration

### Provider Integration Management

#### OpenAI Configuration

1. **Model Selection**
   - Default: `gpt-4o`
   - Fallback: `gpt-3.5-turbo`
   - Configure in environment variables

2. **Rate Limiting**
   - Implement backoff strategy for rate limits
   - Monitor token usage
   - Set usage alerts

#### Anthropic Configuration

1. **Model Selection**
   - Default: `claude-3-5-sonnet-20240620`
   - Fallback: `claude-3-haiku-20240307`
   - Configure in environment variables

2. **Rate Limiting**
   - Implement backoff strategy for rate limits
   - Monitor token usage
   - Set usage alerts

#### SEC EDGAR Integration

1. **Rate Limiting**
   - Respect SEC guidelines (10 requests per second)
   - Implement mandatory delays between requests
   - Cache frequent requests

2. **User Agent**
   - Set proper user agent with email contact
   - Configure in environment variables
   - Format: "Company Name Contact <email@example.com>"

### Quota Management

#### User Quotas

1. **Configuration**
   - Set daily and monthly token limits per user
   - Configure cost limits per user
   - Adjust based on usage patterns

2. **Enforcement**
   - Check quotas before processing requests
   - Return friendly error messages for exceeded quotas
   - Provide upgrade path for users hitting limits

#### Admin Controls

1. **Usage Dashboard**
   - Monitor usage by user
   - Track costs by provider
   - Identify high-usage patterns

2. **Quota Adjustment**
   - Increase limits for power users
   - Adjust global limits based on cost metrics
   - Implement temporary boosts for specific use cases

### Security Best Practices

#### Authentication Security

1. **JWT Configuration**
   - Short expiry times (7 days max)
   - Secure cookie settings
   - HTTPS only

2. **Worker API Authentication**
   - HMAC signature verification
   - Timeouts for stale requests
   - IP restrictions if applicable

#### Data Security

1. **PII Handling**
   - Minimize collection of personal data
   - Encrypt sensitive information
   - Implement data retention policies

2. **Document Security**
   - Secure upload handling
   - Virus scanning for uploads
   - Access control for document storage

### Troubleshooting Guide

#### Common Issues

1. **Worker Connection Failures**
   - Check CORS configuration
   - Verify HMAC signatures
   - Confirm environment variables

2. **LLM Provider Errors**
   - Check API key validity
   - Verify rate limit status
   - Confirm model availability

3. **Vector Search Issues**
   - Check index status
   - Verify embedding dimension matching
   - Confirm database connectivity

#### Resolution Steps

1. **Diagnose**
   - Check logs in both Netlify and Render
   - Identify error patterns
   - Isolate affected components

2. **Resolve**
   - Apply targeted fixes
   - Update configuration if needed
   - Restart services if necessary

3. **Verify**
   - Confirm issue resolution
   - Monitor for recurrence
   - Document solution for future reference

### Performance Optimization

#### Frontend Optimization

1. **Bundle Size**
   - Analyze with `npm run analyze`
   - Implement code splitting
   - Optimize dependencies

2. **Loading Experience**
   - Use LQIP for images
   - Implement skeleton loaders
   - Minimize CLS

#### Worker API Optimization

1. **Response Times**
   - Cache frequent operations
   - Optimize database queries
   - Use efficient serialization

2. **Resource Usage**
   - Monitor memory consumption
   - Implement garbage collection
   - Optimize file processing

### Maintenance Schedule

#### Regular Maintenance

1. **Weekly**
   - Review error logs
   - Check usage metrics
   - Verify backup integrity

2. **Monthly**
   - Database optimization
   - Performance analysis
   - Security scan

3. **Quarterly**
   - API key rotation
   - Dependency updates
   - Comprehensive testing

#### Planned Downtime

1. **Major Updates**
   - Schedule during low-usage periods
   - Notify users in advance
   - Prepare rollback plan

2. **Infrastructure Changes**
   - Document migration plan
   - Test thoroughly in staging
   - Execute with minimal disruption
