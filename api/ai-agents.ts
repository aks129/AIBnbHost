import express from 'express';
import {
  googleHomeAgent,
  mysaAgent,
  blinkAgent,
  airbnbAgent,
  propertyAutomationAgent
} from '../server/services/integration-agents.js';

const router = express.Router();

// Test Google Home agent
router.post('/google-home-agent/test', async (req, res) => {
  try {
    const result = await googleHomeAgent({
      guestName: "Test Guest",
      checkInTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      propertyType: "Modern Apartment",
      weather: {
        temperature: 72,
        condition: "Clear"
      },
      preferences: {
        preferredTemp: 70
      }
    });

    res.json({
      success: true,
      agent: "Google Home Automation",
      result
    });
  } catch (error) {
    console.error("Google Home agent test failed:", error);
    res.status(500).json({
      error: "Agent test failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Test Mysa agent
router.post('/mysa-agent/test', async (req, res) => {
  try {
    const result = await mysaAgent({
      occupancyStatus: "arriving_soon",
      currentTemp: 68,
      outsideTemp: 55,
      weatherForecast: "Partly cloudy",
      timeOfDay: new Date().toLocaleTimeString(),
      energyMode: "balanced"
    });

    res.json({
      success: true,
      agent: "Mysa Temperature Optimizer",
      result
    });
  } catch (error) {
    console.error("Mysa agent test failed:", error);
    res.status(500).json({
      error: "Agent test failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Test Blink agent
router.post('/blink-agent/test', async (req, res) => {
  try {
    const result = await blinkAgent({
      cameraName: "Front Door",
      eventType: "motion",
      timestamp: new Date().toISOString(),
      hasGuest: true,
      expectedArrival: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });

    res.json({
      success: true,
      agent: "Blink Security Monitor",
      result
    });
  } catch (error) {
    console.error("Blink agent test failed:", error);
    res.status(500).json({
      error: "Agent test failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Test Airbnb agent
router.post('/airbnb-agent/test', async (req, res) => {
  try {
    const result = await airbnbAgent({
      messageType: "check_in_question",
      guestMessage: "What time is check-in and where can I park?",
      guestName: "Test Guest",
      reservationStatus: "confirmed",
      propertyInfo: {
        name: "Downtown Loft",
        checkInInstructions: "Check-in is after 3 PM. Use code 1234# at the front door.",
        houseRules: "No smoking, no pets, quiet hours 10 PM - 8 AM"
      }
    });

    res.json({
      success: true,
      agent: "Airbnb Guest Communication",
      result
    });
  } catch (error) {
    console.error("Airbnb agent test failed:", error);
    res.status(500).json({
      error: "Agent test failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Test Property Automation agent
router.post('/property-automation-agent/test', async (req, res) => {
  try {
    const result = await propertyAutomationAgent({
      event: "guest_arriving",
      details: {
        guestName: "Test Guest",
        checkInTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        propertyName: "Downtown Loft"
      },
      availableIntegrations: ["google-home", "mysa", "blink", "airbnb"]
    });

    res.json({
      success: true,
      agent: "Property Automation Master",
      result
    });
  } catch (error) {
    console.error("Property automation agent test failed:", error);
    res.status(500).json({
      error: "Agent test failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get agent status
router.get('/status', async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // In a real implementation, fetch actual agent statuses from database
    res.json({
      agents: [
        {
          id: "google-home-agent",
          name: "Smart Home Automation",
          status: "active",
          actionsToday: 12,
          lastAction: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "mysa-agent",
          name: "Temperature Optimizer",
          status: "active",
          actionsToday: 8,
          lastAction: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "blink-agent",
          name: "Security Monitor",
          status: "active",
          actionsToday: 15,
          lastAction: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: "airbnb-agent",
          name: "Guest Communication",
          status: "active",
          actionsToday: 5,
          lastAction: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        },
        {
          id: "property-automation-agent",
          name: "Master Coordinator",
          status: "active",
          actionsToday: 3,
          lastAction: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
      ]
    });
  } catch (error) {
    console.error("Failed to get agent status:", error);
    res.status(500).json({ error: "Failed to get agent status" });
  }
});

export default router;
