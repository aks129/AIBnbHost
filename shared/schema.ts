import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export const generateMessageSchema = z.object({
  guestType: z.string(),
  communicationStage: z.string(),
  specialContext: z.string().optional(),
  tone: z.string(),
  guestName: z.string(),
});

export type Guest = typeof guests.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type GenerateMessageRequest = z.infer<typeof generateMessageSchema>;
