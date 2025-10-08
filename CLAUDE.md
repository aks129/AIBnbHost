# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lana AI Airbnb Co-Host - A SaaS platform that uses Claude AI to automate Airbnb guest communication and guarantee 5-star reviews. Features a 30-day free trial with $29.99/month or yearly subscriptions (10% discount). Includes demo functionality, subscription management via Stripe, and email notifications via SendGrid.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run check

# Production build (frontend + backend)
npm run build

# Run production build
npm run start

# Database schema push (sync schema to database)
npm run db:push
```

## Architecture

### Monorepo Structure
- `api/` - Vercel serverless API function (Express app)
- `client/` - React frontend with TypeScript
- `server/` - Shared backend logic (routes, services, storage)
- `shared/` - Shared schema definitions and types (Drizzle + Zod)
- `dist/` - Built static files (served by Vercel)

### Key Technologies
- **Frontend**: React 18 + Vite + Wouter (routing) + TanStack Query (server state) + Shadcn/ui (Radix UI components)
- **Backend**: Express + TypeScript with ES modules
- **Database**: PostgreSQL via Neon serverless with Drizzle ORM
- **AI**: Anthropic Claude API (model: `claude-sonnet-4-20250514`)
- **Payments**: Stripe API for subscriptions with 30-day trials
- **Email**: SendGrid for notifications

### Path Aliases
- `@/*` → `client/src/*` (frontend imports)
- `@shared/*` → `shared/*` (shared types/schemas)

### Data Flow
1. Client makes API requests to `/api/*` endpoints
2. Vercel routes requests to [api/index.ts](api/index.ts) serverless function
3. Express app in serverless function handles routes
4. Storage layer ([server/storage.ts](server/storage.ts)) abstracts database operations (PostgreSQL or in-memory fallback)
5. Shared schema ([shared/schema.ts](shared/schema.ts)) defines database tables and validation schemas using Drizzle + Zod

### Database Schema
All tables are defined in [shared/schema.ts](shared/schema.ts):
- `users` - User accounts with authentication, Stripe info, Airbnb integration, onboarding progress, and auto-reply settings
- `guests` - Guest details, check-in/out dates, guest types, special requests
- `messages` - AI-generated and manual messages with timestamps and template tracking
- `templates` - Reusable message templates by category and guest type
- `analytics` - Monthly performance metrics and satisfaction data
- `email_signups` - Lead generation tracking
- `airbnbProperties` - Connected Airbnb property listings
- `reservations` - Guest reservations from Airbnb
- `scheduledMessages` - Automated message scheduling (pre-arrival, check-in, etc.)
- `conversationMessages` - Guest conversation history
- `activityRecommendations` - AI-generated local activity recommendations

### AI Integration
Claude AI services:
- **Model**: Always use `claude-sonnet-4-20250514` (latest)

**[server/services/claude.ts](server/services/claude.ts):**
- `generateGuestMessage()` - Creates personalized messages based on guest type, communication stage, tone, and context
- `analyzeGuestSentiment()` - Returns sentiment analysis as JSON: `{sentiment: string, confidence: number}`

**[server/services/auto-reply.ts](server/services/auto-reply.ts):**
- `analyzeMessageIntent()` - Analyzes guest messages to determine category, urgency, and if host attention is required
- `generateAutoReply()` - Creates context-aware automated responses using conversation history
- `shouldAutoReply()` - Decision engine for when to auto-reply based on intent, urgency, and business hours
- `generateActivityRecommendations()` - AI-powered local activity and attraction recommendations

### Stripe Integration
- Subscription creation with 30-day trials ([server/routes.ts:240](server/routes.ts#L240))
- Payment intent creation for one-time payments
- Webhook handling for subscription updates and payment failures
- Prices created dynamically: $29.99/month or $323.89/year (10% discount)

### Session Management
- Express sessions with PostgreSQL storage (connect-pg-simple)
- Environment-based configuration

## Environment Variables Required

See [.env.example](.env.example) for all required environment variables.

**Backend (Server-side)**:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY` - Claude AI API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `SENDGRID_API_KEY` - SendGrid API key (optional)
- `JWT_SECRET` - Secret key for JWT authentication tokens
- `AIRBNB_CLIENT_ID` - Airbnb OAuth client ID (for partner API access)
- `AIRBNB_CLIENT_SECRET` - Airbnb OAuth client secret
- `AIRBNB_REDIRECT_URI` - OAuth callback URL (e.g., https://yourdomain.com/api/airbnb/callback)
- `PORT` - Server port (default: 5000, local dev only)

**Frontend (Build-time - must be prefixed with `VITE_`)**:
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key (required for payments)

### Setting Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each variable:
   - Name: `VITE_STRIPE_PUBLIC_KEY`
   - Value: Your Stripe publishable key (starts with `pk_`)
   - Environments: Check **Production**, **Preview**, and **Development**
4. Repeat for all other required variables
5. Redeploy your application for changes to take effect

## Vercel Deployment Architecture

This app follows Vercel best practices for full-stack applications:

1. **Static Frontend**: React app built with Vite → `dist/` → Served by Vercel CDN
2. **Serverless API**: Express app in `api/index.ts` → Runs as Vercel serverless function
3. **No `express.static()`**: Static files served by Vercel, not Express (serverless limitation)
4. **Routing**: All `/api/*` requests routed to serverless function via `vercel.json`

### Development vs Production

- **Development**:
  - Run `npm run dev` for local development with hot reload
  - Uses [server/index.ts](server/index.ts) with Vite dev server integration

- **Production** (Vercel):
  - Frontend: Static files from `dist/` served by Vercel CDN
  - Backend: `api/index.ts` runs as serverless function
  - Build command: `npm run build` (just builds Vite, Vercel handles TypeScript in api/)

## Important Implementation Notes

1. **Serverless API**: All routes consolidated in [api/index.ts](api/index.ts) - this is the Vercel serverless function entry point

2. **Error Handling**: Centralized error middleware in both [server/index.ts](server/index.ts) and [api/index.ts](api/index.ts)

3. **Type Safety**: Zod schemas in [shared/schema.ts](shared/schema.ts) provide runtime validation and TypeScript types via `createInsertSchema()`

4. **Storage Abstraction**: [server/storage.ts](server/storage.ts) implements `IStorage` interface with both PostgreSQL and in-memory implementations for development/testing

5. **API Logging**: Custom middleware logs all requests with duration and response preview (truncated at 80 chars)

6. **Build Output**:
   - Vite builds to `dist/` (frontend static files)
   - Vercel automatically builds TypeScript files in `api/` folder

## Phase 2 Implementation Complete

All Phase 2 features have been implemented:

### Authentication System (Phase 2.1 & 2.2)
- JWT-based authentication with bcrypt password hashing
- Login and registration pages with form validation
- Protected routes requiring authentication
- Auth context provider for global auth state
- Token persistence in localStorage

### Onboarding Flow (Phase 2.3)
- 4-step wizard: Property Setup → Airbnb Connection → Message Preferences → Completion
- Property information collection (type, count, location)
- Airbnb OAuth integration (popup-based flow)
- Auto-reply configuration (business hours, delays)
- Progress tracking with step indicators

### Calendar & Reservations (Phase 2.4)
- Full month calendar view with date navigation
- Color-coded reservation display by status
- Upcoming reservations sidebar with guest details
- Statistics cards (revenue, booking counts)
- Mock reservation data (awaiting real Airbnb API integration)

### Automated Messaging (Phase 2.4)
- 5-category template system: Pre-arrival, Check-in, Mid-stay, Check-out, Post-stay
- Template CRUD operations with inline editor
- Time offset configuration for scheduling
- Variable substitution support ([Guest Name], [Property Name], etc.)
- Enable/disable toggles per template

### Conversations & Auto-Reply (Phase 2.5)
- Guest conversation management with message threading
- AI-powered intent analysis (category, urgency, host attention required)
- Auto-reply generation using Claude with conversation context
- Smart decision engine for when to auto-reply
- Manual override capability

### Activity Recommendations (Phase 2.5)
- AI-generated local recommendations by location
- Diverse categories: dining, attractions, outdoor, culture
- Guest preference customization
- 6 recommendations per generation
- Shareable with guests via messages

### API Routes
- `/api/auth` - Authentication (login, register, /me)
- `/api/users` - User profile and onboarding data
- `/api/airbnb` - OAuth integration and connection status
- `/api/reservations` - Reservation listing and sync
- `/api/scheduled-messages` - Message template CRUD
- `/api/conversations` - Guest conversations and auto-reply
- `/api/activities` - Activity recommendation generation

## Communication Style Preference

Use simple, everyday language when writing user-facing content or generating messages.
