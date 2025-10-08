import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { storage } from '../server/storage';
import { generateGuestMessage, analyzeGuestSentiment } from '../server/services/claude';
import { sendSignupNotification, sendDemoInterestNotification } from '../server/services/email';
import { generateMessageSchema, emailSignupSchema, type User } from '../shared/schema';
import { z } from 'zod';
import Stripe from 'stripe';
import authRouter from './auth';
import airbnbRouter from './airbnb';
import usersRouter from './users';
import reservationsRouter from './reservations';
import scheduledMessagesRouter from './scheduled-messages';
import conversationsRouter from './conversations';
import activitiesRouter from './activities';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Auth routes
app.use('/api/auth', authRouter);
app.use('/api/airbnb', airbnbRouter);
app.use('/api/users', usersRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/scheduled-messages', scheduledMessagesRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/activities', activitiesRouter);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }
    if (logLine.length > 80) {
      logLine = logLine.slice(0, 79) + "…";
    }
    console.log(logLine);
  });

  next();
});

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

// Sentiment analysis
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

// Email signup
app.post("/api/email-signup", async (req, res) => {
  try {
    const validatedData = emailSignupSchema.parse(req.body);
    const existingSignups = await storage.getEmailSignups();
    const existingEmail = existingSignups.find(signup => signup.email === validatedData.email);

    if (existingEmail) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const signup = await storage.createEmailSignup({
      email: validatedData.email,
      name: validatedData.name,
      source: "website"
    });

    try {
      await sendSignupNotification({
        email: signup.email,
        name: signup.name || undefined,
        source: signup.source || "website",
        timestamp: new Date().toISOString()
      });
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
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

// Demo interest
app.post("/api/demo-interest", async (req, res) => {
  try {
    const { email, name, source, userAgent } = req.body;
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

// Stripe routes
app.post("/api/create-subscription", async (req, res) => {
  try {
    const { email, name, planType = 'monthly' } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    let customer;
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({ email, name });
    }

    const prices = {
      monthly: await stripe.prices.create({
        unit_amount: 2999,
        currency: 'usd',
        recurring: { interval: 'month' },
        product_data: { name: 'Lana AI Airbnb Co-Host - Monthly' }
      }),
      yearly: await stripe.prices.create({
        unit_amount: 32389,
        currency: 'usd',
        recurring: { interval: 'year' },
        product_data: { name: 'Lana AI Airbnb Co-Host - Yearly' }
      })
    };

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: prices[planType as keyof typeof prices].id }],
      trial_period_days: 30,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    try {
      await storage.createUser({
        email,
        name,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: 'trialing',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionType: planType as 'monthly' | 'yearly'
      });
    } catch (error) {
      console.error("Failed to store user:", error);
    }

    const latestInvoice = subscription.latest_invoice as any;
    const clientSecret = latestInvoice?.payment_intent?.client_secret || null;

    res.json({
      subscriptionId: subscription.id,
      clientSecret,
      customerId: customer.id,
      trialEnd: subscription.trial_end
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
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: { plan: planType }
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

app.post("/api/stripe-webhook", async (req, res) => {
  try {
    const event = req.body;
    switch (event.type) {
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        try {
          const users = await storage.getUsers();
          const user = users.find((u: User) => u.stripeSubscriptionId === subscription.id);
          if (user) {
            await storage.updateUser(user.id, {
              subscriptionStatus: subscription.status as any
            });
          }
        } catch (error) {
          console.error("Failed to update user subscription status:", error);
        }
        break;
      case 'invoice.payment_failed':
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

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Export for Vercel
export default app;
