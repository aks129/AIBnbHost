/**
 * AI Agents for Smart Home and Property Management Integrations
 *
 * These agents use Claude AI to make intelligent decisions about:
 * - Guest arrivals/departures (automate smart home settings)
 * - Temperature control based on occupancy and weather
 * - Security monitoring and alerts
 * - Message automation based on property events
 */

import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

if (!apiKey) {
  console.error('WARNING: ANTHROPIC_API_KEY or CLAUDE_API_KEY not set for integration agents');
}

const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

interface GuestArrivalContext {
  guestName: string;
  checkInTime: string;
  propertyType: string;
  weather?: {
    temperature: number;
    condition: string;
  };
  preferences?: {
    preferredTemp?: number;
    lightingPreference?: string;
  };
}

interface SecurityEvent {
  cameraName: string;
  eventType: 'motion' | 'person' | 'doorbell';
  timestamp: string;
  hasGuest: boolean;
  expectedArrival?: string;
}

/**
 * Google Home AI Agent
 * Decides smart home actions based on guest status and preferences
 */
export async function googleHomeAgent(context: GuestArrivalContext): Promise<{
  actions: Array<{ device: string; command: string; value?: any }>;
  reasoning: string;
}> {
  if (!anthropic) {
    throw new Error('AI agent not configured - missing API key');
  }

  const prompt = `You are a smart home automation AI for an Airbnb property. A guest is arriving soon.

Guest Details:
- Name: ${context.guestName}
- Check-in: ${context.checkInTime}
- Property: ${context.propertyType}
${context.weather ? `- Weather: ${context.weather.temperature}°F, ${context.weather.condition}` : ''}
${context.preferences?.preferredTemp ? `- Preferred Temperature: ${context.preferences.preferredTemp}°F` : ''}

Based on this information, decide what smart home actions to take (lights, thermostat, locks, etc.).
Provide your response in JSON format with:
{
  "actions": [{"device": "device_name", "command": "action", "value": optional_value}],
  "reasoning": "brief explanation"
}

Consider:
- Welcoming atmosphere (lights, temperature)
- Energy efficiency
- Guest comfort
- Time of day`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const result = JSON.parse(content.text);
      return result;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Google Home agent error:', error);
    // Return safe defaults
    return {
      actions: [
        { device: 'thermostat', command: 'set_temperature', value: 72 },
        { device: 'front_lights', command: 'turn_on', value: 80 }
      ],
      reasoning: 'Using default welcoming settings due to AI error'
    };
  }
}

/**
 * Mysa Thermostat AI Agent
 * Optimizes temperature based on occupancy, weather, and energy efficiency
 */
export async function mysaAgent(context: {
  occupancyStatus: 'occupied' | 'vacant' | 'arriving_soon' | 'departing_soon';
  currentTemp: number;
  outsideTemp?: number;
  weatherForecast?: string;
  timeOfDay: string;
  energyMode?: 'eco' | 'comfort' | 'balanced';
}): Promise<{
  targetTemp: number;
  mode: 'heat' | 'cool' | 'auto' | 'off';
  reasoning: string;
}> {
  if (!anthropic) {
    throw new Error('AI agent not configured - missing API key');
  }

  const prompt = `You are an AI agent managing thermostat settings for an Airbnb property.

Current Status:
- Occupancy: ${context.occupancyStatus}
- Current Indoor Temp: ${context.currentTemp}°F
${context.outsideTemp ? `- Outside Temp: ${context.outsideTemp}°F` : ''}
${context.weatherForecast ? `- Weather: ${context.weatherForecast}` : ''}
- Time: ${context.timeOfDay}
- Energy Mode: ${context.energyMode || 'balanced'}

Decide the optimal temperature and mode. Respond in JSON:
{
  "targetTemp": number,
  "mode": "heat|cool|auto|off",
  "reasoning": "explanation"
}

Consider:
- Guest comfort when occupied
- Energy savings when vacant
- Prepare for arrivals
- Weather conditions`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const result = JSON.parse(content.text);
      return result;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Mysa agent error:', error);
    // Return safe defaults based on occupancy
    const defaults = {
      occupied: { targetTemp: 72, mode: 'auto' as const },
      vacant: { targetTemp: 65, mode: 'auto' as const },
      arriving_soon: { targetTemp: 72, mode: 'auto' as const },
      departing_soon: { targetTemp: 68, mode: 'auto' as const },
    };

    return {
      ...defaults[context.occupancyStatus],
      reasoning: 'Using default settings due to AI error'
    };
  }
}

/**
 * Blink Camera AI Agent
 * Analyzes security events and determines if action is needed
 */
export async function blinkAgent(event: SecurityEvent): Promise<{
  alertLevel: 'none' | 'info' | 'warning' | 'urgent';
  action: 'ignore' | 'log' | 'notify_owner' | 'notify_authorities';
  message: string;
  reasoning: string;
}> {
  if (!anthropic) {
    throw new Error('AI agent not configured - missing API key');
  }

  const prompt = `You are a security AI monitoring a vacation rental property via Blink cameras.

Event Details:
- Camera: ${event.cameraName}
- Event Type: ${event.eventType}
- Time: ${event.timestamp}
- Guest Currently Staying: ${event.hasGuest ? 'Yes' : 'No'}
${event.expectedArrival ? `- Expected Guest Arrival: ${event.expectedArrival}` : ''}

Analyze this event and decide the appropriate response. Respond in JSON:
{
  "alertLevel": "none|info|warning|urgent",
  "action": "ignore|log|notify_owner|notify_authorities",
  "message": "message to send to owner if notifying",
  "reasoning": "brief explanation"
}

Consider:
- Expected guest activity vs unexpected activity
- Time of day
- Pattern of events
- False positives (animals, delivery, etc.)`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const result = JSON.parse(content.text);
      return result;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Blink agent error:', error);
    return {
      alertLevel: 'info',
      action: 'log',
      message: 'Motion detected',
      reasoning: 'Default logging due to AI error'
    };
  }
}

/**
 * Airbnb Integration AI Agent
 * Generates contextual responses and manages guest communication
 */
export async function airbnbAgent(context: {
  messageType: 'inquiry' | 'booking_request' | 'check_in_question' | 'issue_report' | 'general';
  guestMessage: string;
  guestName: string;
  reservationStatus?: string;
  propertyInfo: {
    name: string;
    checkInInstructions?: string;
    houseRules?: string;
  };
}): Promise<{
  response: string;
  suggestedActions?: Array<{ action: string; description: string }>;
  urgencyLevel: 'low' | 'medium' | 'high';
}> {
  if (!anthropic) {
    throw new Error('AI agent not configured - missing API key');
  }

  const prompt = `You are an AI assistant managing Airbnb guest communications for a property.

Message Context:
- Type: ${context.messageType}
- Guest: ${context.guestName}
- Property: ${context.propertyInfo.name}
${context.reservationStatus ? `- Reservation: ${context.reservationStatus}` : ''}

Guest's Message:
"${context.guestMessage}"

${context.propertyInfo.checkInInstructions ? `Check-in Instructions: ${context.propertyInfo.checkInInstructions}` : ''}
${context.propertyInfo.houseRules ? `House Rules: ${context.propertyInfo.houseRules}` : ''}

Generate a helpful, friendly response. Also suggest any actions the host should take. Respond in JSON:
{
  "response": "your message to guest",
  "suggestedActions": [{"action": "action_name", "description": "what to do"}],
  "urgencyLevel": "low|medium|high"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const result = JSON.parse(content.text);
      return result;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Airbnb agent error:', error);
    return {
      response: `Hi ${context.guestName}, thanks for your message! I'll get back to you shortly.`,
      urgencyLevel: 'medium',
      suggestedActions: [{ action: 'manual_review', description: 'Review and respond to this message manually' }]
    };
  }
}

/**
 * Unified Property Automation Agent
 * Coordinates all integrations for comprehensive property management
 */
export async function propertyAutomationAgent(context: {
  event: 'guest_arriving' | 'guest_departed' | 'security_alert' | 'weather_change' | 'maintenance_needed';
  details: any;
  availableIntegrations: string[];
}): Promise<{
  actions: Array<{
    integration: string;
    commands: any[];
  }>;
  notifications: Array<{
    recipient: 'owner' | 'guest';
    message: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  reasoning: string;
}> {
  if (!anthropic) {
    throw new Error('AI agent not configured - missing API key');
  }

  const prompt = `You are a master AI agent coordinating all smart systems for a vacation rental property.

Event: ${context.event}
Details: ${JSON.stringify(context.details, null, 2)}
Available Integrations: ${context.availableIntegrations.join(', ')}

Determine what actions to take across all available systems to handle this event effectively.
Respond in JSON:
{
  "actions": [{"integration": "name", "commands": [array of commands]}],
  "notifications": [{"recipient": "owner|guest", "message": "text", "priority": "low|medium|high"}],
  "reasoning": "explanation of your decisions"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const result = JSON.parse(content.text);
      return result;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Property automation agent error:', error);
    return {
      actions: [],
      notifications: [{
        recipient: 'owner',
        message: `Event: ${context.event} - Please review manually`,
        priority: 'medium'
      }],
      reasoning: 'Error occurred, manual review recommended'
    };
  }
}
