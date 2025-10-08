import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, decimal, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  password: text("password").notNull(), // bcrypt hashed
  name: text("name"),

  // Stripe fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").$type<'active' | 'trialing' | 'canceled' | 'incomplete' | 'past_due'>(),
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionType: text("subscription_type").$type<'monthly' | 'yearly'>(),

  // Airbnb integration
  airbnbAccessToken: text("airbnb_access_token"),
  airbnbRefreshToken: text("airbnb_refresh_token"),
  airbnbUserId: text("airbnb_user_id"),
  airbnbConnectedAt: timestamp("airbnb_connected_at"),

  // Onboarding and preferences
  onboardingCompleted: integer("onboarding_completed").default(0), // boolean as int
  propertyType: text("property_type"),
  numberOfProperties: integer("number_of_properties").default(1),
  primaryLocation: text("primary_location"),

  // Auto-reply settings
  autoReplyEnabled: integer("auto_reply_enabled").default(1), // boolean as int
  responseDelayMinutes: integer("response_delay_minutes").default(15),
  businessHoursStart: text("business_hours_start").default("09:00"),
  businessHoursEnd: text("business_hours_end").default("21:00"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const guests = pgTable("guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  guestType: text("guest_type").notNull(), // "first-time", "business", "family", "couple"
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  status: text("status").notNull(), // "arriving", "checked-in", "departing", "completed"
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guestId: varchar("guest_id").references(() => guests.id).notNull(),
  messageType: text("message_type").notNull(), // "welcome", "checkin", "midstay", "checkout", "problem"
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  isAiGenerated: integer("is_ai_generated").default(1),
  templateUsed: text("template_used"),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // "welcome", "local-recommendations", "problem-resolution", etc.
  name: text("name").notNull(),
  content: text("content").notNull(),
  guestTypes: jsonb("guest_types").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalMessages: integer("total_messages").default(0),
  totalGuests: integer("total_guests").default(0),
  fiveStarReviews: integer("five_star_reviews").default(0),
  issuesResolved: integer("issues_resolved").default(0),
  averageResponseTime: integer("average_response_time").default(0), // in seconds
  guestSatisfaction: decimal("guest_satisfaction", { precision: 5, scale: 2 }),
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

export const emailSignups = pgTable("email_signups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  source: text("source").default("website"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Airbnb properties
export const airbnbProperties = pgTable("airbnb_properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  airbnbPropertyId: text("airbnb_property_id").notNull().unique(),
  name: text("name").notNull(),
  address: text("address"),
  propertyType: text("property_type"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  maxGuests: integer("max_guests"),
  timezone: text("timezone").default("America/New_York"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reservations
export const reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  propertyId: varchar("property_id").references(() => airbnbProperties.id).notNull(),
  airbnbReservationId: text("airbnb_reservation_id").notNull().unique(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone"),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  numberOfGuests: integer("number_of_guests"),
  status: text("status").notNull().$type<'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'>(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Scheduled messages
export const scheduledMessages = pgTable("scheduled_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  reservationId: varchar("reservation_id").references(() => reservations.id).notNull(),
  messageType: text("message_type").notNull().$type<'pre_arrival' | 'check_in' | 'mid_stay' | 'check_out' | 'post_stay'>(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  content: text("content").notNull(),
  sent: integer("sent").default(0), // boolean as int
  sentAt: timestamp("sent_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Conversation messages
export const conversationMessages = pgTable("conversation_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  reservationId: varchar("reservation_id").references(() => reservations.id).notNull(),
  airbnbMessageId: text("airbnb_message_id"),
  direction: text("direction").notNull().$type<'inbound' | 'outbound'>(),
  sender: text("sender").notNull().$type<'host' | 'guest'>(),
  content: text("content").notNull(),
  isAiGenerated: integer("is_ai_generated").default(0), // boolean as int
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  requiresReview: integer("requires_review").default(0), // boolean as int
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity recommendations
export const activityRecommendations = pgTable("activity_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => airbnbProperties.id).notNull(),
  category: text("category").notNull().$type<'dining' | 'attractions' | 'outdoor' | 'shopping' | 'nightlife'>(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  distanceKm: decimal("distance_km", { precision: 5, scale: 2 }),
  priceRange: text("price_range").$type<'$' | '$$' | '$$$' | '$$$$'>(),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  url: text("url"),
  placeId: text("place_id"), // Google Places ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export const insertEmailSignupSchema = createInsertSchema(emailSignups).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const generateMessageSchema = z.object({
  guestType: z.string(),
  communicationStage: z.string(),
  specialContext: z.string().optional(),
  tone: z.string(),
  guestName: z.string(),
});

export const emailSignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
});

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Insert schemas for new tables
export const insertPropertySchema = createInsertSchema(airbnbProperties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduledMessageSchema = createInsertSchema(scheduledMessages).omit({
  id: true,
  createdAt: true,
});

export const insertConversationMessageSchema = createInsertSchema(conversationMessages).omit({
  id: true,
  createdAt: true,
});

export const insertActivityRecommendationSchema = createInsertSchema(activityRecommendations).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type EmailSignup = typeof emailSignups.$inferSelect;
export type AirbnbProperty = typeof airbnbProperties.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type ScheduledMessage = typeof scheduledMessages.$inferSelect;
export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type ActivityRecommendation = typeof activityRecommendations.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type InsertEmailSignup = z.infer<typeof insertEmailSignupSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type InsertScheduledMessage = z.infer<typeof insertScheduledMessageSchema>;
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;
export type InsertActivityRecommendation = z.infer<typeof insertActivityRecommendationSchema>;

export type GenerateMessageRequest = z.infer<typeof generateMessageSchema>;
export type EmailSignupRequest = z.infer<typeof emailSignupSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
