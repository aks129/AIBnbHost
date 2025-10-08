import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  status?: string;
  stats?: {
    eventsToday: number;
    lastSync: string;
    dataPoints: number;
  };
}

export default function Integrations() {
  const [, setLocation] = useLocation();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      // Mock data for now - replace with actual API call
      setIntegrations([
        {
          id: "airbnb",
          name: "Airbnb",
          description: "Sync reservations and guest messages",
          icon: "🏠",
          connected: false,
          stats: {
            eventsToday: 0,
            lastSync: "Never",
            dataPoints: 0,
          },
        },
        {
          id: "google-home",
          name: "Google Home",
          description: "Control smart home devices for guests",
          icon: "🏡",
          connected: false,
          stats: {
            eventsToday: 0,
            lastSync: "Never",
            dataPoints: 0,
          },
        },
        {
          id: "mysa",
          name: "Mysa Thermostats",
          description: "Manage temperature settings automatically",
          icon: "🌡️",
          connected: false,
          stats: {
            eventsToday: 0,
            lastSync: "Never",
            dataPoints: 0,
          },
        },
        {
          id: "blink",
          name: "Blink Cameras",
          description: "Monitor property and get security alerts",
          icon: "📹",
          connected: false,
          stats: {
            eventsToday: 0,
            lastSync: "Never",
            dataPoints: 0,
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (integrationId: string) => {
    setLocation(`/integrations/${integrationId}`);
  };

  const handleConfigure = (integrationId: string) => {
    setLocation(`/profile?tab=integrations&integration=${integrationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading integrations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integrations Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Connect and manage all your property management tools
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.connected).length} / {integrations.length}
                </p>
              </div>
              <div className="text-3xl">🔗</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.reduce((sum, i) => sum + (i.stats?.eventsToday || 0), 0)}
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Agents Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.connected).length}
                </p>
              </div>
              <div className="text-3xl">🤖</div>
            </div>
          </div>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-4xl">{integration.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {integration.description}
                      </p>
                      {integration.connected && (
                        <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Connected
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {integration.connected && integration.stats && (
                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Events Today</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {integration.stats.eventsToday}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Sync</p>
                      <p className="text-sm font-medium text-gray-900">
                        {integration.stats.lastSync}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Data Points</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {integration.stats.dataPoints}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {integration.connected ? (
                    <>
                      <button
                        onClick={() => handleViewDetails(integration.id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleConfigure(integration.id)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                      >
                        Settings
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConfigure(integration.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Connect Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            🚀 Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <button
              onClick={() => setLocation("/ai-agents")}
              className="bg-white px-4 py-3 rounded-lg text-left hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-1">🤖</div>
              <p className="font-medium text-gray-900">AI Agents Panel</p>
              <p className="text-xs text-gray-600">Manage automation agents</p>
            </button>

            <button
              onClick={() => setLocation("/profile?tab=integrations")}
              className="bg-white px-4 py-3 rounded-lg text-left hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-1">⚙️</div>
              <p className="font-medium text-gray-900">Integration Settings</p>
              <p className="text-xs text-gray-600">Configure connections</p>
            </button>

            <button
              onClick={() => setLocation("/activities")}
              className="bg-white px-4 py-3 rounded-lg text-left hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-1">📋</div>
              <p className="font-medium text-gray-900">Activity Log</p>
              <p className="text-xs text-gray-600">View all integration events</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
