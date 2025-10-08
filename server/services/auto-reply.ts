import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

export interface AutoReplyContext {
  guestName: string;
  guestMessage: string;
  propertyName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  hostName?: string;
}

export interface MessageIntent {
  category: 'question' | 'request' | 'complaint' | 'information' | 'greeting' | 'other';
  urgency: 'low' | 'medium' | 'high';
  requiresHostAttention: boolean;
  summary: string;
}

/**
 * Analyze guest message intent and urgency
 */
export async function analyzeMessageIntent(message: string): Promise<MessageIntent> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Analyze this guest message and classify it. Return a JSON object with:
- category: one of [question, request, complaint, information, greeting, other]
- urgency: one of [low, medium, high]
- requiresHostAttention: boolean (true if host should personally respond)
- summary: brief one-sentence summary

Guest message: "${message}"

Respond with ONLY the JSON object, no other text.`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const parsed = JSON.parse(content.text);
      return {
        category: parsed.category || 'other',
        urgency: parsed.urgency || 'medium',
        requiresHostAttention: parsed.requiresHostAttention || false,
        summary: parsed.summary || message.substring(0, 100),
      };
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error analyzing message intent:', error);
    // Default conservative response
    return {
      category: 'other',
      urgency: 'medium',
      requiresHostAttention: true,
      summary: message.substring(0, 100),
    };
  }
}

/**
 * Generate auto-reply for guest message
 */
export async function generateAutoReply(context: AutoReplyContext): Promise<string> {
  const systemPrompt = `You are an AI assistant helping manage Airbnb guest communications.

Your role:
- Respond warmly and professionally to guest messages
- Provide helpful information about the property and local area
- Answer common questions about check-in, WiFi, amenities, etc.
- Be concise but friendly
- Use the guest's name when appropriate
- Sign off as the host or property manager

Property context:
${context.propertyName ? `Property: ${context.propertyName}` : ''}
${context.checkInDate ? `Check-in: ${context.checkInDate}` : ''}
${context.checkOutDate ? `Check-out: ${context.checkOutDate}` : ''}

Guidelines:
- For urgent issues (emergencies, major problems), suggest they call the host directly
- For maintenance issues, acknowledge and say the host will address it
- For local recommendations, be specific and helpful
- Keep responses under 150 words unless more detail is clearly needed`;

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Add conversation history if available
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    messages.push(...context.conversationHistory);
  }

  // Add current message
  messages.push({
    role: 'user',
    content: context.guestMessage,
  });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error generating auto-reply:', error);
    throw new Error('Failed to generate auto-reply');
  }
}

/**
 * Determine if message should be auto-replied
 */
export function shouldAutoReply(
  intent: MessageIntent,
  userSettings: {
    autoReplyEnabled: boolean;
    businessHoursStart: string;
    businessHoursEnd: string;
  }
): boolean {
  if (!userSettings.autoReplyEnabled) {
    return false;
  }

  // Don't auto-reply to high urgency or complaints without host review
  if (intent.urgency === 'high' || intent.category === 'complaint') {
    return false;
  }

  // Check business hours
  const now = new Date();
  const currentHour = now.getHours();
  const startHour = parseInt(userSettings.businessHoursStart.split(':')[0]);
  const endHour = parseInt(userSettings.businessHoursEnd.split(':')[0]);

  const isBusinessHours = currentHour >= startHour && currentHour < endHour;

  // Auto-reply during business hours for simple queries
  if (isBusinessHours && ['question', 'greeting', 'information'].includes(intent.category)) {
    return true;
  }

  // For requests outside business hours, auto-reply with acknowledgment
  if (!isBusinessHours && intent.category === 'request') {
    return true;
  }

  return false;
}

/**
 * Get activity recommendations for a location using Claude
 */
export async function generateActivityRecommendations(
  location: string,
  guestPreferences?: string
): Promise<Array<{ title: string; description: string; category: string }>> {
  const prompt = `Generate 6 activity recommendations for guests staying in ${location}.
${guestPreferences ? `Guest preferences: ${guestPreferences}` : ''}

Provide diverse activities including:
- Local attractions
- Restaurants/dining
- Outdoor activities
- Cultural experiences
- Hidden gems

Return a JSON array with objects containing: title, description (2-3 sentences), category.

Respond with ONLY the JSON array, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt,
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const activities = JSON.parse(content.text);
      return activities;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error generating activity recommendations:', error);
    return [];
  }
}
