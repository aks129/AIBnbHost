import { type Guest, type Message, type Template, type Analytics, type EmailSignup, type InsertGuest, type InsertMessage, type InsertTemplate, type InsertAnalytics, type InsertEmailSignup } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Guest operations
  getGuests(): Promise<Guest[]>;
  getGuest(id: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: string, guest: Partial<InsertGuest>): Promise<Guest | undefined>;

  // Message operations
  getMessages(): Promise<Message[]>;
  getMessagesByGuestId(guestId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;

  // Analytics operations
  getAnalytics(): Promise<Analytics[]>;
  getCurrentMonthAnalytics(): Promise<Analytics | undefined>;
  createOrUpdateAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Email signup operations
  getEmailSignups(): Promise<EmailSignup[]>;
  createEmailSignup(signup: InsertEmailSignup): Promise<EmailSignup>;
}

export class MemStorage implements IStorage {
  private guests: Map<string, Guest>;
  private messages: Map<string, Message>;
  private templates: Map<string, Template>;
  private analytics: Map<string, Analytics>;
  private emailSignups: Map<string, EmailSignup>;

  constructor() {
    this.guests = new Map();
    this.messages = new Map();
    this.templates = new Map();
    this.analytics = new Map();
    this.emailSignups = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed guests
    const sampleGuests: Guest[] = [
      {
        id: "guest-1",
        name: "Sarah Chen",
        email: "sarah@example.com",
        guestType: "first-time",
        checkInDate: new Date("2024-12-15T15:00:00Z"),
        checkOutDate: new Date("2024-12-18T11:00:00Z"),
        status: "arriving",
        specialRequests: null,
        createdAt: new Date(),
      },
      {
        id: "guest-2", 
        name: "Mike Johnson",
        email: "mike@example.com",
        guestType: "business",
        checkInDate: new Date("2024-12-14T15:00:00Z"),
        checkOutDate: new Date("2024-12-17T11:00:00Z"),
        status: "checked-in",
        specialRequests: null,
        createdAt: new Date(),
      },
      {
        id: "guest-3",
        name: "Emma Rodriguez", 
        email: "emma@example.com",
        guestType: "couple",
        checkInDate: new Date("2024-12-13T15:00:00Z"),
        checkOutDate: new Date("2024-12-16T11:00:00Z"),
        status: "departing",
        specialRequests: "Anniversary celebration",
        createdAt: new Date(),
      },
    ];

    sampleGuests.forEach(guest => this.guests.set(guest.id, guest));

    // Seed messages
    const sampleMessages: Message[] = [
      {
        id: "msg-1",
        guestId: "guest-1",
        messageType: "welcome",
        content: "Hi Sarah! Welcome to San Francisco! Your check-in is confirmed for today at 3:00 PM. Since this is your first visit, I've prepared some insider recommendations...",
        sentAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        isAiGenerated: 1,
        templateUsed: "welcome-first-time",
      },
      {
        id: "msg-2",
        guestId: "guest-2", 
        messageType: "checkin",
        content: "Hi Mike! Just a friendly reminder that check-in is available anytime after 3:00 PM today. Your keypad code is 1234#...",
        sentAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        isAiGenerated: 1,
        templateUsed: "checkin-reminder",
      },
      {
        id: "msg-3",
        guestId: "guest-3",
        messageType: "local-recommendations", 
        content: "Hi Emma! Since you're celebrating your anniversary, here are some romantic spots I'd recommend for dinner tonight...",
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        isAiGenerated: 1,
        templateUsed: "local-romantic",
      },
    ];

    sampleMessages.forEach(msg => this.messages.set(msg.id, msg));

    // Seed templates
    const sampleTemplates: Template[] = [
      {
        id: "tpl-1",
        category: "welcome",
        name: "First-time visitors",
        content: "Welcome to {city}! As a first-time visitor, here's what you absolutely can't miss...",
        guestTypes: ["first-time"],
        tags: ["welcome", "first-visit", "recommendations"],
      },
      {
        id: "tpl-2",
        category: "welcome", 
        name: "Business travelers",
        content: "Perfect for your business trip! Here are the fastest routes to downtown and best work cafes...",
        guestTypes: ["business"],
        tags: ["welcome", "business", "work"],
      },
      {
        id: "tpl-3",
        category: "local-recommendations",
        name: "Foodie recommendations",
        content: "Since you love food, here are our neighborhood's best-kept culinary secrets...",
        guestTypes: ["first-time", "couple", "family"],
        tags: ["food", "restaurants", "local"],
      },
    ];

    sampleTemplates.forEach(tpl => this.templates.set(tpl.id, tpl));

    // Seed analytics - using current month/year
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    const currentAnalytics: Analytics = {
      id: "analytics-current",
      month: currentMonth,
      year: currentYear,
      averageRating: "4.96",
      totalMessages: 147,
      totalGuests: 23,
      fiveStarReviews: 21,
      issuesResolved: 12,
      averageResponseTime: 47,
      guestSatisfaction: "98.50",
    };

    this.analytics.set(currentAnalytics.id, currentAnalytics);
  }

  async getGuests(): Promise<Guest[]> {
    return Array.from(this.guests.values());
  }

  async getGuest(id: string): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = randomUUID();
    const guest: Guest = { 
      ...insertGuest, 
      id,
      createdAt: new Date(),
      specialRequests: insertGuest.specialRequests || null,
    };
    this.guests.set(id, guest);
    return guest;
  }

  async updateGuest(id: string, guestUpdate: Partial<InsertGuest>): Promise<Guest | undefined> {
    const guest = this.guests.get(id);
    if (!guest) return undefined;
    
    const updatedGuest = { ...guest, ...guestUpdate };
    this.guests.set(id, updatedGuest);
    return updatedGuest;
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async getMessagesByGuestId(guestId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(msg => msg.guestId === guestId);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      sentAt: new Date(),
      isAiGenerated: insertMessage.isAiGenerated || 1,
      templateUsed: insertMessage.templateUsed || null,
    };
    this.messages.set(id, message);
    return message;
  }

  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(tpl => tpl.category === category);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = { 
      ...insertTemplate, 
      id,
      guestTypes: insertTemplate.guestTypes ? [...insertTemplate.guestTypes] : [],
      tags: insertTemplate.tags ? [...insertTemplate.tags] : [],
    };
    this.templates.set(id, template);
    return template;
  }

  async getAnalytics(): Promise<Analytics[]> {
    return Array.from(this.analytics.values());
  }

  async getCurrentMonthAnalytics(): Promise<Analytics | undefined> {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    return Array.from(this.analytics.values()).find(
      analytics => analytics.month === currentMonth && analytics.year === currentYear
    );
  }

  async createOrUpdateAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const existing = Array.from(this.analytics.values()).find(
      analytics => analytics.month === insertAnalytics.month && analytics.year === insertAnalytics.year
    );

    if (existing) {
      const updated = { ...existing, ...insertAnalytics };
      this.analytics.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const analytics: Analytics = { 
        ...insertAnalytics, 
        id,
        averageRating: insertAnalytics.averageRating || null,
        totalMessages: insertAnalytics.totalMessages || 0,
        totalGuests: insertAnalytics.totalGuests || 0,
        fiveStarReviews: insertAnalytics.fiveStarReviews || 0,
        issuesResolved: insertAnalytics.issuesResolved || 0,
        averageResponseTime: insertAnalytics.averageResponseTime || 0,
        guestSatisfaction: insertAnalytics.guestSatisfaction || null,
      };
      this.analytics.set(id, analytics);
      return analytics;
    }
  }

  async getEmailSignups(): Promise<EmailSignup[]> {
    return Array.from(this.emailSignups.values());
  }

  async createEmailSignup(insertSignup: InsertEmailSignup): Promise<EmailSignup> {
    const id = randomUUID();
    const signup: EmailSignup = {
      ...insertSignup,
      id,
      createdAt: new Date(),
      name: insertSignup.name || null,
      source: insertSignup.source || "website",
    };
    this.emailSignups.set(id, signup);
    return signup;
  }
}

export const storage = new MemStorage();
