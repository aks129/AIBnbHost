# Overview

This is "Lana AI Airbnb Co-Host" - a comprehensive SaaS web application that showcases and sells AI automation for Airbnb client communication to guarantee 5-star reviews. The platform serves as both a demonstration tool and fully functional subscription service with 30-day trial and $29.99/month pricing (yearly with 10% discount). The application leverages Claude AI to generate personalized guest messages, manage templates, track analytics, and streamline host-guest communication to consistently achieve 5-star reviews.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack React Query for server state management
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with dedicated route handlers
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Development**: Hot reload with Vite development server integration

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL for cloud-native deployment
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **In-Memory Storage**: Fallback memory storage implementation for development/testing
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

## Database Schema Design
- **Users Table**: Stores subscriber information with Stripe customer and subscription IDs
- **Guests Table**: Stores guest information, check-in/out dates, guest types, and special requests
- **Messages Table**: Tracks all AI-generated and manual messages with timestamps and templates
- **Templates Table**: Manages reusable message templates by category and guest type
- **Analytics Table**: Aggregates monthly performance metrics and guest satisfaction data
- **Email Signups Table**: Tracks lead generation and demo interest for marketing

## Authentication and Authorization
- **Session-based Authentication**: Express sessions with PostgreSQL storage
- **Request Validation**: Zod schemas for runtime type checking and validation
- **CORS Configuration**: Configured for development and production environments

## AI Integration Architecture
- **AI Provider**: Anthropic's Claude API (Claude Sonnet 4) for message generation
- **Message Personalization**: Context-aware message generation based on guest type, stay stage, and special requirements
- **Sentiment Analysis**: AI-powered guest sentiment tracking and response optimization
- **Template Management**: AI-assisted template creation and categorization

## Development and Build System
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Comprehensive TypeScript configuration with strict mode
- **Code Quality**: Path mapping for clean imports and modular architecture
- **Environment Management**: Separate development and production configurations

# External Dependencies

## Core Framework Dependencies
- **Frontend**: React, TypeScript, Vite, Wouter for routing
- **Backend**: Express.js, Node.js with ES modules
- **Database**: Drizzle ORM, Neon PostgreSQL, connect-pg-simple

## AI and External APIs
- **AI Service**: Anthropic Claude API for message generation and sentiment analysis
- **Payment Processing**: Stripe API for subscription management with 30-day trials
- **Email Notifications**: SendGrid for demo interest and signup notifications
- **API Key Management**: Environment-based configuration for API credentials

## UI and Styling
- **Component Library**: Shadcn/ui with Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono)

## State Management and Data Fetching
- **Server State**: TanStack React Query for API state management
- **Form Management**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for runtime type validation and schema generation

## Development Tools
- **Build Tools**: Vite, esbuild, tsx for development server
- **Database Tools**: Drizzle Kit for migrations and schema management
- **Development Utilities**: Replit-specific plugins for enhanced development experience