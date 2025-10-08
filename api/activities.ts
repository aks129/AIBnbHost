import express from 'express';
import { z } from 'zod';
import { storage } from '../server/storage.js';
import { generateActivityRecommendations } from '../server/services/auto-reply.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// In-memory storage for activities (in production, use database)
const activities = new Map<string, any>();

const generateSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  preferences: z.string().optional(),
});

// Get all activities
router.get('/', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allActivities = Array.from(activities.values());
    res.json(allActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Generate activity recommendations
router.post('/generate', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validatedData = generateSchema.parse(req.body);

    // Generate recommendations using AI
    const recommendations = await generateActivityRecommendations(
      validatedData.location,
      validatedData.preferences
    );

    // Clear existing activities and store new ones
    activities.clear();

    const newActivities = recommendations.map((rec) => ({
      id: randomUUID(),
      ...rec,
      location: validatedData.location,
      createdAt: new Date().toISOString(),
    }));

    newActivities.forEach((activity) => {
      activities.set(activity.id, activity);
    });

    res.json({
      success: true,
      count: newActivities.length,
      activities: newActivities,
    });
  } catch (error) {
    console.error('Error generating activities:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to generate activities' });
  }
});

// Get activity by ID
router.get('/:id', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activity = activities.get(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Delete activity
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activity = activities.get(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    activities.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

export default router;
