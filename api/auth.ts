import express from 'express';
import { storage } from '../server/storage.js';
import { registerSchema, loginSchema } from '../shared/schema';
import { hashPassword, comparePassword, generateToken, sanitizeUser } from '../server/services/auth.js';
import { z } from 'zod';

const router = express.Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Register request received:', { email: req.body.email, name: req.body.name });
    const validatedData = registerSchema.parse(req.body);
    console.log('Validation passed');

    // Check if user exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      console.log('User already exists');
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    console.log('Password hashed');

    // Create user
    const user = await storage.createUser({
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
    });
    console.log('User created:', user.id);

    // Generate token
    const token = generateToken(user);
    console.log('Token generated');

    // Sanitize user
    const sanitizedUser = sanitizeUser(user);
    console.log('User sanitized:', typeof sanitizedUser.createdAt, typeof sanitizedUser.updatedAt);

    const response = {
      user: sanitizedUser,
      token
    };
    console.log('Sending response');

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error("Registration error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
    return res.status(500).json({
      error: "Failed to register user",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isValid = await comparePassword(validatedData.password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Get current user (protected)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(' ')[1];
    const { verifyToken } = await import('../server/services/auth.js');
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
