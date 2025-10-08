import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '../../shared/schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Sanitize user object (remove sensitive fields and convert dates to strings)
 */
export function sanitizeUser(user: User) {
  const { password, airbnbAccessToken, airbnbRefreshToken, ...rest } = user;

  // Convert Date objects to ISO strings for JSON serialization
  return {
    ...rest,
    createdAt: rest.createdAt instanceof Date ? rest.createdAt.toISOString() : (rest.createdAt || null),
    updatedAt: rest.updatedAt instanceof Date ? rest.updatedAt.toISOString() : (rest.updatedAt || null),
    trialEndsAt: rest.trialEndsAt instanceof Date ? rest.trialEndsAt.toISOString() : (rest.trialEndsAt || null),
    airbnbConnectedAt: rest.airbnbConnectedAt instanceof Date ? rest.airbnbConnectedAt.toISOString() : (rest.airbnbConnectedAt || null),
  };
}
