import express from 'express';
import { z } from 'zod';
import { storage } from '../server/storage.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// In-memory storage for templates (in production, use database)
const templates = new Map<string, any>();

// Seed some default templates
const seedTemplates = () => {
  if (templates.size === 0) {
    const defaultTemplates = [
      {
        id: randomUUID(),
        name: 'Pre-Arrival Welcome',
        category: 'pre-arrival',
        subject: 'Excited to host you at [Property Name]!',
        content: `Hi [Guest Name],

We're thrilled that you'll be staying with us soon! Your reservation is confirmed for [Check-In Date] to [Check-Out Date].

Here are a few things to help you prepare:
- Check-in time is 3:00 PM
- Check-out time is 11:00 AM
- WiFi password will be provided upon arrival

If you have any questions before your arrival, feel free to reach out!

Looking forward to hosting you,
Your Host`,
        enabled: true,
        sendTimeOffset: -24, // 24 hours before check-in
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        name: 'Check-In Instructions',
        category: 'check-in',
        subject: 'Check-in details for [Property Name]',
        content: `Hi [Guest Name],

Welcome! You can check in starting at 3:00 PM today.

Access Instructions:
- The lockbox code is: 1234
- Located on the right side of the front door
- WiFi: [Property WiFi]
- Password: [WiFi Password]

The full house manual is inside on the kitchen counter.

Enjoy your stay!`,
        enabled: true,
        sendTimeOffset: -2, // 2 hours before check-in
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        name: 'Mid-Stay Check',
        category: 'mid-stay',
        subject: 'How is everything going?',
        content: `Hi [Guest Name],

Just checking in to make sure everything is going well with your stay!

Is there anything you need? Any questions about the area or the property?

We want to make sure you have the best experience possible.

Best regards,
Your Host`,
        enabled: true,
        sendTimeOffset: 48, // 2 days after check-in
        createdAt: new Date().toISOString(),
      },
    ];

    defaultTemplates.forEach(template => templates.set(template.id, template));
  }
};

seedTemplates();

const templateSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['pre-arrival', 'check-in', 'mid-stay', 'check-out', 'post-stay']),
  subject: z.string().min(1),
  content: z.string().min(1),
  enabled: z.boolean().optional(),
  sendTimeOffset: z.number(),
});

// Get all message templates
router.get('/templates', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    seedTemplates();
    const allTemplates = Array.from(templates.values());
    res.json(allTemplates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create a new template
router.post('/templates', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validatedData = templateSchema.parse(req.body);

    const newTemplate = {
      id: randomUUID(),
      ...validatedData,
      enabled: validatedData.enabled ?? true,
      createdAt: new Date().toISOString(),
    };

    templates.set(newTemplate.id, newTemplate);
    res.json(newTemplate);
  } catch (error) {
    console.error('Error creating template:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update a template
router.put('/templates/:id', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const template = templates.get(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const validatedData = templateSchema.partial().parse(req.body);
    const updatedTemplate = {
      ...template,
      ...validatedData,
    };

    templates.set(req.params.id, updatedTemplate);
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete a template
router.delete('/templates/:id', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const template = templates.get(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    templates.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Get scheduled messages for a reservation
router.get('/reservation/:reservationId', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // In production, query database for scheduled messages
    res.json([]);
  } catch (error) {
    console.error('Error fetching scheduled messages:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled messages' });
  }
});

export default router;
