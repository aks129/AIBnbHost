import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateGuestMessage, analyzeGuestSentiment } from "./services/claude";
import { sendSignupNotification, sendDemoInterestNotification } from "./services/email";
import { generateMessageSchema, emailSignupSchema, type User } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function setupRoutes(app: Express): Promise<void> {
  
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

  // Demo interest tracking route
  app.post("/api/demo-interest", async (req, res) => {
    try {
      const { email, name, source, userAgent } = req.body;
      
      // Send notification email about demo interest
      try {
        await sendDemoInterestNotification({
          email: email || undefined,
          name: name || undefined,
          source: source || "website",
          timestamp: new Date().toISOString(),
          userAgent: userAgent || req.get('User-Agent')
        });
      } catch (emailError) {
        console.error("Failed to send demo interest notification:", emailError);
        // Don't fail the request if email notification fails
      }
      
      res.json({ 
        success: true, 
        message: "Demo interest tracked successfully"
      });
    } catch (error) {
      console.error("Error tracking demo interest:", error);
      res.status(500).json({ 
        error: "Failed to track demo interest",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Stripe payment routes
  app.post("/api/create-subscription", async (req, res) => {
    try {
      const { email, name, planType = 'monthly' } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Create or get Stripe customer
      let customer;
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email,
          name,
        });
      }

      // Create price objects for monthly and yearly plans
      const prices = {
        monthly: await stripe.prices.create({
          unit_amount: 2999, // $29.99
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: {
            name: 'Lana AI Airbnb Co-Host - Monthly',
          },
        }),
        yearly: await stripe.prices.create({
          unit_amount: 32389, // $323.89 (10% discount)
          currency: 'usd',
          recurring: { interval: 'year' },
          product_data: {
            name: 'Lana AI Airbnb Co-Host - Yearly',
          },
        }),
      };

      // Create subscription with 30-day trial
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: prices[planType as keyof typeof prices].id,
        }],
        trial_period_days: 30,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Store user in database
      try {
        await storage.createUser({
          email,
          name,
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: 'trialing',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          subscriptionType: planType as 'monthly' | 'yearly',
        });
      } catch (error) {
        console.error("Failed to store user:", error);
      }

      // For subscription with trial, payment intent might not be available immediately
      const latestInvoice = subscription.latest_invoice as any;
      const clientSecret = latestInvoice?.payment_intent?.client_secret || null;

      res.json({
        subscriptionId: subscription.id,
        clientSecret,
        customerId: customer.id,
        trialEnd: subscription.trial_end,
      });
    } catch (error: any) {
      console.error("Stripe subscription error:", error);
      res.status(500).json({ 
        error: "Failed to create subscription",
        message: error.message
      });
    }
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, planType = 'monthly' } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          plan: planType,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Payment intent error:", error);
      res.status(500).json({ 
        error: "Failed to create payment intent",
        message: error.message
      });
    }
  });

  // Webhook for Stripe events
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    try {
      // Note: In production, you'd verify the webhook signature here
      const event = req.body;

      switch (event.type) {
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          // Update user subscription status in database
          try {
            const users = await storage.getUsers();
            const user = users.find((u: User) => u.stripeSubscriptionId === subscription.id);
            if (user) {
              await storage.updateUser(user.id, {
                subscriptionStatus: subscription.status as 'active' | 'trialing' | 'canceled' | 'incomplete' | 'past_due',
              });
            }
          } catch (error) {
            console.error("Failed to update user subscription status:", error);
          }
          break;

        case 'invoice.payment_failed':
          // Handle failed payment
          console.log('Payment failed for subscription:', event.data.object.subscription);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).send(`Webhook Error: ${error}`);
    }
  });

}

export async function registerRoutes(app: Express): Promise<Server> {
  await setupRoutes(app);
  const httpServer = createServer(app);
  return httpServer;
}
