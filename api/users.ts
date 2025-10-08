import express from 'express';
import { z } from 'zod';
import { storage } from '../server/storage';

const router = express.Router();

// Update onboarding data
const onboardingSchema = z.object({
  propertyType: z.string().optional(),
  numberOfProperties: z.number().optional(),
  primaryLocation: z.string().optional(),
  autoReplyEnabled: z.boolean().optional(),
  responseDelayMinutes: z.number().optional(),
  businessHoursStart: z.string().optional(),
  businessHoursEnd: z.string().optional(),
  onboardingCompleted: z.number().min(0).max(4).optional(),
});

router.put('/onboarding', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validatedData = onboardingSchema.parse(req.body);

    const updatedUser = await storage.updateUser(req.user.id, {
      ...validatedData,
      updatedAt: new Date(),
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating onboarding:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update onboarding' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
