import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "active" | "inactive" | "processing";
  integration: string;
  recentActions: Array<{
    timestamp: string;
    action: string;
    result: string;
  }>;
}

export default function AIAgents() {
  const [, setLocation] = useLocation();
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "google-home-agent",
      name: "Smart Home Automation",
      description: "Controls lights, thermostat, and locks based on guest arrivals and preferences",
      icon: "🏡",
      status: "active",
      integration: "google-home",
      recentActions: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          action: "Guest arriving in 30 minutes",
          result: "Set temperature to 72°F, turned on entry lights to 80%",
        },
      ],
    },
    {
      id: "mysa-agent",
      name: "Temperature Optimizer",
      description: "Optimizes HVAC settings for comfort and energy efficiency based on occupancy",
      icon: "🌡️",
      status: "active",
      integration: "mysa",
      recentActions: [
        {
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          action: "Guest departed",
          result: "Set to eco mode (65°F) to save energy",
        },
      ],
    },
    {
      id: "blink-agent",
      name: "Security Monitor",
      description: "Analyzes camera events and sends intelligent security alerts",
      icon: "📹",
      status: "active",
      integration: "blink",
      recentActions: [
        {
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          action: "Motion detected at front door",
          result: "Expected guest arrival - no alert sent",
        },
      ],
    },
    {
      id: "airbnb-agent",
      name: "Guest Communication",
      description: "Generates contextual responses to guest messages automatically",
      icon: "💬",
      status: "active",
      integration: "airbnb",
      recentActions: [
        {
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          action: "Guest asked about check-in",
          result: "Sent personalized check-in instructions",
        },
      ],
    },
    {
      id: "property-automation-agent",
      name: "Master Coordinator",
      description: "Coordinates all integrations for comprehensive property management",
      icon: "🤖",
      status: "active",
      integration: "all",
      recentActions: [
        {
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          action: "Guest check-in event",
          result: "Coordinated welcome: lights on, temp set, security disarmed, welcome message sent",
        },
      ],
    },
  ]);

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [testingAgent, setTestingAgent] = useState<string | null>(null);

  const handleTestAgent = async (agentId: string) => {
    setTestingAgent(agentId);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/ai-agents/${agentId}/test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: "guest_arriving",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Agent Test Complete:\n\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error("Test failed:", error);
      alert("Agent test failed - check console for details");
    } finally {
      setTestingAgent(null);
    }
  };

  const toggleAgentStatus = (agentId: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        return {
          ...agent,
          status: agent.status === "active" ? "inactive" : "active",
        };
      }
      return agent;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Agents Control Panel</h1>
          <p className="mt-2 text-gray-600">
            Monitor and control your AI-powered property management agents
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.filter(a => a.status === "active").length}
                </p>
              </div>
              <div className="text-3xl">🤖</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actions Today</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900">3.2 hrs</p>
              </div>
              <div className="text-3xl">⏱️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">98%</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-4xl">{agent.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        agent.status === "active"
                          ? "bg-green-100 text-green-800"
                          : agent.status === "processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                </div>

                {/* Recent Actions */}
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Recent Actions</h4>
                  {agent.recentActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">
                          {action.action}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(action.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs">{action.result}</p>
                    </div>
                  ))}
                  {agent.recentActions.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No recent actions</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => toggleAgentStatus(agent.id)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                      agent.status === "active"
                        ? "bg-red-50 text-red-700 hover:bg-red-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {agent.status === "active" ? "Pause Agent" : "Activate Agent"}
                  </button>
                  <button
                    onClick={() => handleTestAgent(agent.id)}
                    disabled={testingAgent === agent.id}
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 disabled:opacity-50"
                  >
                    {testingAgent === agent.id ? "Testing..." : "Test Agent"}
                  </button>
                  <button
                    onClick={() => setSelectedAgent(agent)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Configuration Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedAgent.icon}</span>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedAgent.name} Configuration
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Agent Settings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">Auto-Execute Actions</label>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">Send Notifications</label>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Action Delay (minutes)
                      </label>
                      <input
                        type="number"
                        defaultValue={0}
                        min={0}
                        max={60}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Automation Rules
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Define when and how this agent should act
                  </p>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        When: Guest checks in
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Then: Prepare property (lights, temp, security)
                      </p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      + Add New Rule
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
