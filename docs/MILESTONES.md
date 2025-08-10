# Ask Dahlia - Milestone Plan

This document outlines the upcoming milestones for the Ask Dahlia project, focusing on functionality and integration.

## Current Status

- ✅ Frontend UI: Landing, Login, Dashboard, Documents, SEC search, Chat, Terms, Risk matrix, Email drafting
- ✅ Backend foundation: Drizzle schema, Neon Postgres + pgvector, JWT middleware, access request
- ✅ Authentication: Login/logout, access requests with email notifications, approvals
- ✅ Deployment: Netlify UI, Render Worker skeleton

## Milestone 1: Worker Chat + RAG Wiring

**Objective**: Implement real-time chat with RAG capabilities connected to document corpus.

### Tasks

1. **Document Ingestion**
   - Implement `/worker/ingest` endpoint
   - Create document parser for PDF, DOCX, TXT, MD
   - Build chunking logic (900-1200 tokens with 15% overlap)
   - Add embedding generation with OpenAI/Cohere
   - Store chunks and embeddings in pgvector
   - Add progress tracking and error handling

2. **RAG Retrieval Pipeline**
   - Implement semantic search with cosine similarity
   - Add Cohere reranking for candidate passages
   - Create hybrid retrieval with keyword + semantic search
   - Build context assembly with metadata preservation

3. **Chat Integration**
   - Connect `/worker/chat` to LLM providers
   - Implement SSE streaming for responses
   - Add structured response formatting
   - Create citation tracking with source verification
   - Build prompt templates with system instructions
   - Implement conversation history management

4. **UI Enhancements**
   - Connect chat UI to streaming endpoints
   - Add real-time streaming display
   - Implement citation display and interaction
   - Build suggested clauses UI
   - Add risk signal visualization

**Estimated Effort**: 2-3 weeks

## Milestone 2: SEC EDGAR Integration

**Objective**: Add real-time SEC filing search and integration with corpus.

### Tasks

1. **SEC API Integration**
   - Implement `/worker/sec/search` endpoint
   - Add search by ticker/CIK with form type filtering
   - Create date range and full-text search
   - Implement proper rate limiting and backoff
   - Add response caching for performance

2. **Filing Processing**
   - Implement `/worker/sec/get` for detailed filing retrieval
   - Create section extraction (Items 1, 1A, 7, etc.)
   - Build table and chart parsing
   - Add metadata extraction for filtering

3. **Corpus Integration**
   - Implement "Add to corpus" functionality
   - Create section-level ingestion
   - Preserve filing metadata and provenance
   - Add special citation handling for SEC sources

4. **UI Enhancements**
   - Connect SEC search UI to live API
   - Implement filing detail view
   - Add section navigation
   - Build corpus integration UI

**Estimated Effort**: 1-2 weeks

## Milestone 3: Voice & Export Features

**Objective**: Add voice interaction and document export capabilities.

### Tasks

1. **Speech-to-Text Integration**
   - Implement `/worker/stt` endpoint with OpenAI Whisper
   - Add alternative provider (ElevenLabs)
   - Create audio preprocessing for quality
   - Implement language detection
   - Add real-time transcription UI

2. **Text-to-Speech Integration**
   - Implement `/worker/tts` endpoint with ElevenLabs
   - Create voice selection options
   - Add SSML for better pronunciation
   - Implement audio caching for performance
   - Build streaming audio playback

3. **Document Export**
   - Implement `/worker/export` for multiple formats
   - Add DOCX generation with styling
   - Create PDF export with branding
   - Build TXT export for compatibility
   - Implement citation appendix generation

4. **Batch Operations**
   - Add multi-document export with ZIP
   - Create batch processing queue
   - Implement progress tracking
   - Add notification on completion

**Estimated Effort**: 1-2 weeks

## Milestone 4: Usage Tracking & Quotas

**Objective**: Implement comprehensive usage tracking and quota management.

### Tasks

1. **Usage Logging**
   - Enhance worker logging for all API calls
   - Track tokens, cost, and execution time
   - Implement provider-specific pricing
   - Create detailed usage logs table
   - Build nightly rollups for summary metrics

2. **Quota Management**
   - Implement user quota configuration
   - Add daily and monthly limits
   - Create cost-based quotas
   - Build quota check middleware
   - Implement graceful throttling

3. **Admin Dashboard**
   - Create usage analytics visualization
   - Build user comparison charts
   - Add cost projection and trends
   - Implement quota adjustment UI
   - Create export for billing

4. **User Feedback**
   - Add quota display in UI
   - Implement usage warnings
   - Create upgrade/request flow
   - Build throttle explanation modals

**Estimated Effort**: 1-2 weeks

## Long-term Roadmap

Beyond these initial milestones, future development could include:

1. **Advanced Analytics**
   - Contract risk scoring
   - Trend detection across corpus
   - Automated compliance checking
   - Anomaly detection in legal language

2. **Collaboration Features**
   - Multi-user editing
   - Comment threads
   - Approval workflows
   - Team management

3. **Enterprise Integration**
   - SSO/SAML authentication
   - API for third-party integration
   - Custom model fine-tuning
   - On-premise deployment option

4. **Industry-Specific Templates**
   - Vertical-specific clause libraries
   - Regulatory compliance packs
   - Industry benchmark comparisons
   - Specialized risk matrices

5. **AI Enhancement**
   - Custom RAG architectures
   - Domain-specific embeddings
   - Fine-tuned domain models
   - Automated QA for responses

## Implementation Strategy

To ensure efficient delivery:

1. **Prioritize Critical Path**
   - Focus on RAG functionality first
   - Implement auth and permissions early
   - Build core features before refinements

2. **Modular Design**
   - Create abstraction layers for providers
   - Use dependency injection for flexibility
   - Design for component swapping

3. **Progressive Enhancement**
   - Start with minimal viable features
   - Add refinements in subsequent passes
   - Release early and iterate

4. **Feedback Loops**
   - Implement telemetry for usage patterns
   - Collect user feedback systematically
   - Adapt priorities based on actual usage
