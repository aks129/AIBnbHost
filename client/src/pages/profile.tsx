import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import Navigation from "@/components/navigation";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  subscriptionStatus: string | null;
  subscriptionType: string | null;
  trialEndsAt: string | null;
  airbnbUserId: string | null;
  airbnbConnectedAt: string | null;
  onboardingCompleted: number;
  propertyType: string | null;
  numberOfProperties: number;
  primaryLocation: string | null;
  autoReplyEnabled: number;
  responseDelayMinutes: number;
  businessHoursStart: string;
  businessHoursEnd: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon: string;
  status?: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"account" | "integrations">("account");
  const [saving, setSaving] = useState(false);

  // Airbnb connection state
  const [airbnbUsername, setAirbnbUsername] = useState("");
  const [airbnbPassword, setAirbnbPassword] = useState("");
  const [airbnbConnecting, setAirbnbConnecting] = useState(false);

  // Integrations state
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "airbnb",
      name: "Airbnb",
      description: "Sync reservations and guest messages",
      connected: false,
      icon: "🏠",
    },
    {
      id: "google-home",
      name: "Google Home",
      description: "Control smart home devices for guests",
      connected: false,
      icon: "🏡",
    },
    {
      id: "mysa",
      name: "Mysa Thermostats",
      description: "Manage temperature settings automatically",
      connected: false,
      icon: "🌡️",
    },
    {
      id: "blink",
      name: "Blink Cameras",
      description: "Monitor property and get security alerts",
      connected: false,
      icon: "📹",
    },
  ]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setLocation("/login");
        return;
      }
      if (authUser) {
        setUser(authUser as any);

        // Update integrations connected status
        setIntegrations(prev => prev.map(integration => {
          if (integration.id === "airbnb" && authUser.airbnbUserId) {
            return { ...integration, connected: true, status: "Connected" };
          }
          return integration;
        }));
        setLoading(false);
      }
    }
  }, [authUser, authLoading, isAuthenticated, setLocation]);

  const handleAirbnbConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setAirbnbConnecting(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/integrations/airbnb/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: airbnbUsername,
          password: airbnbPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, airbnbUserId: data.userId, airbnbConnectedAt: new Date().toISOString() } : null);
        setIntegrations(prev => prev.map(int =>
          int.id === "airbnb" ? { ...int, connected: true, status: "Connected" } : int
        ));
        setAirbnbUsername("");
        setAirbnbPassword("");
        alert("Successfully connected to Airbnb!");
      } else {
        const error = await response.json();
        alert(`Failed to connect: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Airbnb connection error:", error);
      alert("Failed to connect to Airbnb");
    } finally {
      setAirbnbConnecting(false);
    }
  };

  const handleIntegrationToggle = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    if (integration.connected) {
      // Disconnect
      if (confirm(`Disconnect ${integration.name}?`)) {
        try {
          const token = localStorage.getItem("auth_token");
          await fetch(`/api/integrations/${integrationId}/disconnect`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setIntegrations(prev => prev.map(int =>
            int.id === integrationId ? { ...int, connected: false, status: undefined } : int
          ));
        } catch (error) {
          console.error("Disconnect error:", error);
        }
      }
    } else {
      // Show connection dialog based on integration type
      if (integrationId === "airbnb") {
        setActiveTab("integrations");
      } else {
        // For other integrations, show coming soon or OAuth flow
        alert(`${integration.name} connection coming soon!`);
      }
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/users/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          autoReplyEnabled: user.autoReplyEnabled,
          responseDelayMinutes: user.responseDelayMinutes,
          businessHoursStart: user.businessHoursStart,
          businessHoursEnd: user.businessHoursEnd,
        }),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and integrations
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("account")}
              className={`${
                activeTab === "account"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Account Settings
            </button>
            <button
              onClick={() => setActiveTab("integrations")}
              className={`${
                activeTab === "integrations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Integrations
            </button>
          </nav>
        </div>

        {/* Account Settings Tab */}
        {activeTab === "account" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
            </div>
            <div className="px-6 py-5 space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={user.name || ""}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Subscription Info */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Subscription</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">Status</label>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {user.subscriptionStatus || "No active subscription"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Plan</label>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {user.subscriptionType || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Settings */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">AI Assistant Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto-Reply</label>
                      <p className="text-xs text-gray-500">Automatically respond to guest messages</p>
                    </div>
                    <button
                      onClick={() => setUser({ ...user, autoReplyEnabled: user.autoReplyEnabled ? 0 : 1 })}
                      className={`${
                        user.autoReplyEnabled
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
                    >
                      <span
                        className={`${
                          user.autoReplyEnabled ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Response Delay (minutes)
                    </label>
                    <input
                      type="number"
                      value={user.responseDelayMinutes}
                      onChange={(e) => setUser({ ...user, responseDelayMinutes: parseInt(e.target.value) })}
                      min="0"
                      max="60"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Delay before sending auto-replies (0-60 minutes)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Business Hours Start
                      </label>
                      <input
                        type="time"
                        value={user.businessHoursStart}
                        onChange={(e) => setUser({ ...user, businessHoursStart: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Business Hours End
                      </label>
                      <input
                        type="time"
                        value={user.businessHoursEnd}
                        onChange={(e) => setUser({ ...user, businessHoursEnd: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            {/* Integration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.map((integration) => (
                <div key={integration.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-3xl">{integration.icon}</span>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-gray-500">{integration.description}</p>
                        {integration.connected && (
                          <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Connected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    {integration.id === "airbnb" && !integration.connected ? (
                      <form onSubmit={handleAirbnbConnect} className="space-y-3">
                        <div>
                          <input
                            type="text"
                            placeholder="Airbnb username/email"
                            value={airbnbUsername}
                            onChange={(e) => setAirbnbUsername(e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="password"
                            placeholder="Airbnb password"
                            value={airbnbPassword}
                            onChange={(e) => setAirbnbPassword(e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={airbnbConnecting}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                          {airbnbConnecting ? "Connecting..." : "Connect Airbnb"}
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => handleIntegrationToggle(integration.id)}
                        className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                          integration.connected
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {integration.connected ? "Disconnect" : "Connect"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Agents Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                AI-Powered Integrations
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Each integration comes with a dedicated AI agent that can:
              </p>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="mr-2">🏠</span>
                  <span><strong>Airbnb:</strong> Sync reservations, auto-respond to guests, and manage bookings</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🏡</span>
                  <span><strong>Google Home:</strong> Control lights, thermostats, and locks for guest arrivals</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🌡️</span>
                  <span><strong>Mysa:</strong> Automatically adjust temperature based on occupancy and weather</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📹</span>
                  <span><strong>Blink:</strong> Monitor property security and send alerts for unusual activity</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
