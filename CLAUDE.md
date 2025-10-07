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
- `client/` - React frontend with TypeScript
- `server/` - Express backend with TypeScript
- `shared/` - Shared schema definitions and types (Drizzle + Zod)

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
2. Backend routes ([server/routes.ts](server/routes.ts)) handle requests
3. Storage layer ([server/storage.ts](server/storage.ts)) abstracts database operations (PostgreSQL or in-memory fallback)
4. Shared schema ([shared/schema.ts](shared/schema.ts)) defines database tables and validation schemas using Drizzle + Zod

### Database Schema
All tables are defined in [shared/schema.ts](shared/schema.ts):
- `users` - Subscriber info with Stripe customer/subscription IDs
- `guests` - Guest details, check-in/out dates, guest types, special requests
- `messages` - AI-generated and manual messages with timestamps and template tracking
- `templates` - Reusable message templates by category and guest type
- `analytics` - Monthly performance metrics and satisfaction data
- `email_signups` - Lead generation tracking

### AI Integration
Claude AI service ([server/services/claude.ts](server/services/claude.ts)):
- **Model**: Always use `claude-sonnet-4-20250514` (latest)
- `generateGuestMessage()` - Creates personalized messages based on guest type, communication stage, tone, and context
- `analyzeGuestSentiment()` - Returns sentiment analysis as JSON: `{sentiment: string, confidence: number}`

### Stripe Integration
- Subscription creation with 30-day trials ([server/routes.ts:240](server/routes.ts#L240))
- Payment intent creation for one-time payments
- Webhook handling for subscription updates and payment failures
- Prices created dynamically: $29.99/month or $323.89/year (10% discount)

### Session Management
- Express sessions with PostgreSQL storage (connect-pg-simple)
- Environment-based configuration

## Environment Variables Required

```
DATABASE_URL=<Neon PostgreSQL connection string>
ANTHROPIC_API_KEY=<Claude API key>
STRIPE_SECRET_KEY=<Stripe secret key>
SENDGRID_API_KEY=<SendGrid API key>
PORT=5000 (default, other ports are firewalled)
```

## Important Implementation Notes

1. **Single Port Architecture**: Both API and client are served from the same port (default: 5000). Other ports are firewalled.

2. **Development vs Production**:
   - Development: Vite dev server integrated with Express
   - Production: Static files served from `dist/`

3. **Error Handling**: Centralized error middleware in [server/index.ts:42](server/index.ts#L42)

4. **Type Safety**: Zod schemas in `shared/schema.ts` provide runtime validation and TypeScript types via `createInsertSchema()`

5. **Storage Abstraction**: [server/storage.ts](server/storage.ts) implements `IStorage` interface with both PostgreSQL and in-memory implementations for development/testing

6. **API Logging**: Custom middleware logs all `/api/*` requests with duration and response preview (truncated at 80 chars)

## Communication Style Preference

Use simple, everyday language when writing user-facing content or generating messages.
