# Phase 2 Specification: User Authentication & Airbnb Integration

## Overview
Transform the demo-only SaaS into a fully functional platform where users can authenticate, connect their Airbnb account, and automate guest communication.

## 1. Authentication System

### 1.1 User Registration
**Endpoint**: `POST /api/auth/register`

**Request Body**:
```typescript
{
  email: string;          // Valid email format
  password: string;       // Min 8 chars, 1 uppercase, 1 number
  name: string;           // Full name
}
```

**Response**:
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;          // JWT token
}
```

**Validation Rules**:
- Email must be unique
- Password must meet complexity requirements
- Name required (min 2 characters)

### 1.2 User Login
**Endpoint**: `POST /api/auth/login`

**Request Body**:
```typescript
{
  email: string;
  password: string;
}
```

**Response**:
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    onboardingCompleted: boolean;
    airbnbConnected: boolean;
  };
  token: string;
}
```

### 1.3 Session Management
- JWT-based authentication
- Token expiry: 7 days
- Refresh token support
- Secure httpOnly cookies

### 1.4 Password Security
- bcrypt hashing (salt rounds: 10)
- No plain text storage
- Password reset via email (future)

## 2. Onboarding Flow

### 2.1 Step 1: Welcome & Profile Setup
**Page**: `/onboarding/welcome`

**Data Collection**:
- Property type (apartment, house, villa, etc.)
- Number of properties
- Primary location
- Communication preferences

### 2.2 Step 2: Airbnb Connection
**Page**: `/onboarding/connect-airbnb`

**Flow**:
1. Display "Connect Airbnb" button
2. OAuth flow to Airbnb
3. Store access token securely
4. Fetch basic property info
5. Display success confirmation

**Endpoint**: `POST /api/integrations/airbnb/connect`

**Request Body**:
```typescript
{
  authorizationCode: string;  // From Airbnb OAuth
}
```

**Response**:
```typescript
{
  success: boolean;
  properties: Array<{
    id: string;
    name: string;
    address: string;
    type: string;
  }>;
}
```

### 2.3 Step 3: Message Templates Setup
**Page**: `/onboarding/templates`

**Features**:
- Pre-filled template library
- Customize default templates
- Set tone preferences (friendly, professional, casual)
- Preview AI-generated samples

### 2.4 Step 4: Automation Preferences
**Page**: `/onboarding/automation`

**Settings**:
- Auto-reply enabled/disabled
- Response delay (immediate, 15min, 30min, 1hr)
- Business hours (when to send messages)
- Blackout periods (when NOT to send)

## 3. Airbnb Integration via MCP

### 3.1 MCP Server Setup
**Technology**: `@modelcontextprotocol/sdk`

**MCP Tools**:
```typescript
// Get user's listings
async function getListings(userId: string): Promise<Listing[]>

// Get reservations/bookings
async function getReservations(userId: string, startDate: Date, endDate: Date): Promise<Reservation[]>

// Get messages thread
async function getMessages(reservationId: string): Promise<Message[]>

// Send message to guest
async function sendMessage(reservationId: string, content: string): Promise<void>

// Get property details
async function getPropertyDetails(listingId: string): Promise<PropertyDetails>
```

### 3.2 Database Schema Updates

**Add to users table**:
```sql
ALTER TABLE users ADD COLUMN airbnb_access_token TEXT;
ALTER TABLE users ADD COLUMN airbnb_refresh_token TEXT;
ALTER TABLE users ADD COLUMN airbnb_user_id TEXT;
ALTER TABLE users ADD COLUMN airbnb_connected_at TIMESTAMP;
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN auto_reply_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN response_delay_minutes INTEGER DEFAULT 15;
```

**New table: airbnb_properties**:
```sql
CREATE TABLE airbnb_properties (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  airbnb_property_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  max_guests INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**New table: reservations**:
```sql
CREATE TABLE reservations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  property_id VARCHAR NOT NULL REFERENCES airbnb_properties(id),
  airbnb_reservation_id TEXT NOT NULL UNIQUE,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  check_in_date TIMESTAMP NOT NULL,
  check_out_date TIMESTAMP NOT NULL,
  number_of_guests INTEGER,
  status TEXT NOT NULL, -- confirmed, checked_in, checked_out, cancelled
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**New table: scheduled_messages**:
```sql
CREATE TABLE scheduled_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  reservation_id VARCHAR NOT NULL REFERENCES reservations(id),
  message_type TEXT NOT NULL, -- pre_arrival, check_in, mid_stay, check_out, post_stay
  scheduled_time TIMESTAMP NOT NULL,
  content TEXT NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**New table: conversation_messages**:
```sql
CREATE TABLE conversation_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  reservation_id VARCHAR NOT NULL REFERENCES reservations(id),
  airbnb_message_id TEXT,
  direction TEXT NOT NULL, -- inbound, outbound
  sender TEXT NOT NULL, -- host, guest
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**New table: activity_recommendations**:
```sql
CREATE TABLE activity_recommendations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id VARCHAR NOT NULL REFERENCES airbnb_properties(id),
  category TEXT NOT NULL, -- dining, attractions, outdoor, shopping, nightlife
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  distance_km DECIMAL(5, 2),
  price_range TEXT, -- $, $$, $$$, $$$$
  rating DECIMAL(3, 2),
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 4. Calendar & Schedule View

### 4.1 Calendar Page
**Route**: `/dashboard/calendar`

**Features**:
- Monthly calendar view
- Show all reservations
- Color-coded by status (upcoming, active, past)
- Click reservation to see details

**Endpoint**: `GET /api/reservations/calendar`

**Query Params**:
```typescript
{
  month: number;    // 1-12
  year: number;     // 2024, 2025, etc.
}
```

**Response**:
```typescript
{
  reservations: Array<{
    id: string;
    guestName: string;
    propertyName: string;
    checkIn: string;  // ISO date
    checkOut: string; // ISO date
    status: string;
    scheduledMessages: number;  // Count
  }>;
}
```

### 4.2 Reservation Detail View
**Component**: `ReservationDetailModal`

**Shows**:
- Guest information
- Property details
- Stay dates and duration
- Scheduled messages timeline
- Message history
- Quick actions (send message, add note)

## 5. Scheduled Messages

### 5.1 Message Automation Rules
**Default Schedule**:
- **Pre-arrival**: 3 days before check-in (property details, directions)
- **Check-in day**: Morning of check-in (check-in instructions, WiFi)
- **Mid-stay**: Day 2 (check if everything is okay)
- **Check-out**: Morning of check-out (check-out instructions)
- **Post-stay**: 1 day after check-out (thank you, review request)

### 5.2 Scheduled Messages Endpoint
**Endpoint**: `POST /api/scheduled-messages`

**Request Body**:
```typescript
{
  reservationId: string;
  messageType: 'pre_arrival' | 'check_in' | 'mid_stay' | 'check_out' | 'post_stay';
  scheduledTime: string;  // ISO timestamp
  content?: string;       // Optional override
}
```

### 5.3 Auto-Generate Messages
**Endpoint**: `POST /api/scheduled-messages/auto-generate`

**Request Body**:
```typescript
{
  reservationId: string;
}
```

**Response**:
```typescript
{
  messages: Array<{
    id: string;
    type: string;
    scheduledTime: string;
    content: string;
    sent: boolean;
  }>;
}
```

**Logic**:
1. Get reservation details
2. Calculate appropriate send times
3. Generate personalized content using Claude
4. Create scheduled message records
5. Return preview for user approval

### 5.4 Message Sending Worker
**Background Job**: Runs every 5 minutes

**Process**:
1. Query `scheduled_messages` where `sent = false` AND `scheduled_time <= NOW()`
2. For each message:
   - Send via Airbnb MCP
   - Mark as sent
   - Log in `conversation_messages`
3. Handle errors and retry logic

## 6. Auto-Reply System

### 6.1 Webhook Handler
**Endpoint**: `POST /api/webhooks/airbnb-message`

**Request Body** (from Airbnb):
```typescript
{
  reservationId: string;
  messageId: string;
  sender: 'guest';
  content: string;
  timestamp: string;
}
```

### 6.2 Auto-Reply Logic
**Flow**:
1. Receive incoming message
2. Check if user has auto-reply enabled
3. Check if within business hours
4. Analyze message intent using Claude
5. Generate appropriate response
6. Send response via MCP
7. Log both messages

**Intent Analysis Prompt**:
```
Analyze this guest message and determine the intent:
- question (needs specific answer)
- request (needs action)
- complaint (needs resolution)
- casual (just chatting)
- urgent (needs immediate attention)

Message: "{message content}"

Return JSON: { "intent": "...", "urgency": "low|medium|high", "suggestedResponse": "..." }
```

### 6.3 Response Generation
**Endpoint**: `POST /api/messages/auto-reply`

**Request Body**:
```typescript
{
  reservationId: string;
  guestMessage: string;
  context?: {
    propertyDetails: object;
    reservationDetails: object;
  };
}
```

**Response**:
```typescript
{
  reply: string;
  confidence: number;    // 0-1, how confident AI is in response
  requiresHumanReview: boolean;
}
```

**Rules**:
- If confidence < 0.7, flag for human review
- If intent = "complaint", notify user immediately
- If urgency = "high", send immediately regardless of delay setting

## 7. Activity Recommendations

### 7.1 Recommendations Engine
**Endpoint**: `GET /api/recommendations/:propertyId`

**Query Params**:
```typescript
{
  category?: string;     // dining, attractions, etc.
  maxDistance?: number;  // km
  priceRange?: string;   // $, $$, $$$, $$$$
}
```

**Response**:
```typescript
{
  recommendations: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    address: string;
    distance: number;
    priceRange: string;
    rating: number;
    url: string;
  }>;
}
```

### 7.2 Integration with Messages
**Feature**: Include recommendations in messages

**Example**: Pre-arrival message includes:
```
Hi {guest name}!

We're excited to host you at {property name}! Here are some local favorites:

🍽️ Dining:
- {Restaurant 1} (0.5km away) - Amazing local cuisine
- {Restaurant 2} (1.2km away) - Perfect for breakfast

🎭 Attractions:
- {Attraction 1} (2km away) - Must-see museum
- {Attraction 2} (3km away) - Beautiful park

[Generated by AI, personalized for your stay]
```

### 7.3 Recommendation Sources
1. **Google Places API**: Get nearby businesses
2. **User-curated list**: Allow users to add favorites
3. **Guest preferences**: Learn from past interactions
4. **Seasonal**: Recommend based on time of year

## 8. UI Components

### 8.1 New Pages
1. `/login` - Login form
2. `/register` - Registration form
3. `/onboarding/*` - Multi-step onboarding
4. `/dashboard/calendar` - Calendar view
5. `/dashboard/properties` - Property management
6. `/dashboard/messages` - Message center
7. `/dashboard/settings` - User settings

### 8.2 New Components
1. `AuthLayout` - Layout wrapper for auth pages
2. `OnboardingWizard` - Multi-step form
3. `CalendarView` - Monthly calendar with reservations
4. `ReservationCard` - Display reservation details
5. `MessageThread` - Chat-like message view
6. `ScheduledMessagesList` - Timeline of scheduled messages
7. `ActivityRecommendationCard` - Display recommendations
8. `AutoReplyToggle` - Enable/disable auto-reply
9. `PropertySelector` - Choose property for settings

### 8.3 State Management
Use TanStack Query for:
- User authentication state
- Reservations data
- Messages cache
- Real-time updates via polling/websockets

## 9. Security Considerations

### 9.1 API Security
- All endpoints require authentication (except `/auth/*`)
- Rate limiting on sensitive endpoints
- Input validation on all requests
- SQL injection prevention (use parameterized queries)

### 9.2 Data Privacy
- Encrypt Airbnb tokens at rest
- Never log sensitive data (passwords, tokens)
- GDPR compliance for user data
- Data retention policies

### 9.3 OAuth Security
- Store tokens encrypted
- Use refresh tokens properly
- Handle token expiry gracefully
- Secure redirect URIs

## 10. Testing Strategy

### 10.1 Unit Tests
- Authentication logic
- Message generation
- Schedule calculation
- Intent analysis

### 10.2 Integration Tests
- Airbnb MCP connection
- Database operations
- Email sending
- Webhook handling

### 10.3 E2E Tests
- Full registration → onboarding → message flow
- Auto-reply simulation
- Calendar interactions

## 11. Deployment & Monitoring

### 11.1 Environment Variables (Additional)
```
AIRBNB_CLIENT_ID=
AIRBNB_CLIENT_SECRET=
AIRBNB_REDIRECT_URI=
JWT_SECRET=
GOOGLE_PLACES_API_KEY=
```

### 11.2 Background Jobs
- Message sender (every 5 minutes)
- Reservation sync (every 30 minutes)
- Token refresh (daily)

### 11.3 Monitoring
- Track auto-reply success rate
- Monitor message delivery
- Alert on failed authentications
- Log API errors

## 12. Success Metrics

### 12.1 Key Metrics
- User registration rate
- Onboarding completion rate
- Airbnb connection success rate
- Auto-reply accuracy
- User satisfaction with AI responses
- Average response time to guests

### 12.2 Analytics Events
- `user_registered`
- `onboarding_completed`
- `airbnb_connected`
- `auto_reply_sent`
- `message_scheduled`
- `recommendation_viewed`

## 13. Future Enhancements (Phase 3)
- Multi-property support
- Team collaboration
- Advanced analytics dashboard
- Custom AI training on user's style
- Multi-language support
- Mobile app
