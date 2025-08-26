import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateGuestMessage, analyzeGuestSentiment } from "./services/claude";
import { sendSignupNotification } from "./services/email";
import { generateMessageSchema, emailSignupSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Guest routes
  app.get("/api/guests", async (req, res) => {
    try {
      const guests = await storage.getGuests();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guests" });
    }
  });

  app.get("/api/guests/:id", async (req, res) => {
    try {
      const guest = await storage.getGuest(req.params.id);
      if (!guest) {
        return res.status(404).json({ error: "Guest not found" });
      }
      res.json(guest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guest" });
    }
  });

  // Message routes
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/guest/:guestId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByGuestId(req.params.guestId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guest messages" });
    }
  });

  // Generate message with Claude AI
  app.post("/api/messages/generate", async (req, res) => {
    try {
      const validatedData = generateMessageSchema.parse(req.body);
      
      const generatedMessage = await generateGuestMessage(validatedData);
      
      res.json({ 
        message: generatedMessage,
        generatedAt: new Date().toISOString(),
        model: "claude-sonnet-4-20250514"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      
      console.error("Error generating message:", error);
      res.status(500).json({ 
        error: "Failed to generate message",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Save generated message
  app.post("/api/messages", async (req, res) => {
    try {
      const message = await storage.createMessage(req.body);
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to save message" });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const { category } = req.query;
      let templates;
      
      if (category && typeof category === 'string') {
        templates = await storage.getTemplatesByCategory(category);
      } else {
        templates = await storage.getTemplates();
      }
      
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/current", async (req, res) => {
    try {
      const analytics = await storage.getCurrentMonthAnalytics();
      if (!analytics) {
        return res.status(404).json({ error: "No current month analytics found" });
      }
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current analytics" });
    }
  });

  // Sentiment analysis route  
  app.post("/api/analyze-sentiment", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message text is required" });
      }

      const sentiment = await analyzeGuestSentiment(message);
      res.json(sentiment);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ 
        error: "Failed to analyze sentiment",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Email signup route
  app.post("/api/email-signup", async (req, res) => {
    try {
      const validatedData = emailSignupSchema.parse(req.body);
      
      // Check if email already exists
      const existingSignups = await storage.getEmailSignups();
      const existingEmail = existingSignups.find(signup => signup.email === validatedData.email);
      
      if (existingEmail) {
        return res.status(409).json({ error: "Email already registered" });
      }
      
      // Create the signup
      const signup = await storage.createEmailSignup({
        email: validatedData.email,
        name: validatedData.name,
        source: "website"
      });
      
      // Send notification email
      try {
        await sendSignupNotification({
          email: signup.email,
          name: signup.name || undefined,
          source: signup.source || "website",
          timestamp: new Date().toISOString()
        });
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
        // Don't fail the signup if email notification fails
      }
      
      res.json({ 
        success: true, 
        message: "Successfully signed up for updates!",
        id: signup.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid signup data", details: error.errors });
      }
      
      console.error("Error processing email signup:", error);
      res.status(500).json({ 
        error: "Failed to process signup",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
