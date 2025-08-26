import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Bot, TrendingUp } from "lucide-react";
import type { Guest, Message, Analytics } from "@shared/schema";

export default function DashboardCards() {
  const { data: guests = [], isLoading: guestsLoading } = useQuery<Guest[]>({
    queryKey: ["/api/guests"],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics/current"],
  });

  const activeGuests = guests.filter(guest => guest.status !== "completed");
  const recentMessages = messages.slice(0, 3);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      arriving: { color: "bg-green-100 text-green-800", label: "Arriving" },
      "checked-in": { color: "bg-blue-100 text-blue-800", label: "Checked In" },
      departing: { color: "bg-yellow-100 text-yellow-800", label: "Departing" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) === 1 ? '' : 's'} ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) === 1 ? '' : 's'} ago`;
    }
  };

  return (
    <section id="dashboard" className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Your AI Communication Dashboard</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Monitor all guest communications, track review ratings, and manage your automated workflows from one central location.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Active Guests Card */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Active Guests</h3>
                <Users className="w-6 h-6 text-red-500" />
              </div>
              
              {guestsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {activeGuests.map((guest) => {
                    const badge = getStatusBadge(guest.status);
                    return (
                      <div 
                        key={guest.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400"
                        data-testid={`guest-card-${guest.id}`}
                      >
                        <div>
                          <div className="font-medium text-gray-800" data-testid={`guest-name-${guest.id}`}>
                            {guest.name}
                          </div>
                          <div className="text-sm text-gray-600" data-testid={`guest-checkin-${guest.id}`}>
                            Check-in: {new Date(guest.checkInDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={badge.color} data-testid={`guest-status-${guest.id}`}>
                          {badge.label}
                        </Badge>
                      </div>
                    );
                  })}
                  
                  {activeGuests.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No active guests at the moment</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Messages Card */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent AI Messages</h3>
                <Bot className="w-6 h-6 text-teal-600" />
              </div>
              
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMessages.map((message) => {
                    const guest = guests.find(g => g.id === message.guestId);
                    return (
                      <div key={message.id} className="flex items-start space-x-3" data-testid={`message-${message.id}`}>
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">
                            {message.messageType === 'welcome' ? 'Welcome Message Sent' :
                             message.messageType === 'checkin' ? 'Check-in Reminder' :
                             message.messageType === 'midstay' ? 'Mid-stay Check-in' :
                             message.messageType === 'checkout' ? 'Check-out Reminder' :
                             'Message Sent'}
                          </div>
                          <div className="text-xs text-gray-600">
                            To {guest?.name || 'Guest'} • {formatTimeAgo(new Date(message.sentAt || Date.now()))}
                          </div>
                          <div className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded max-w-xs">
                            "{message.content.substring(0, 60)}..."
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {recentMessages.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No recent messages</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics Card */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">This Month's Performance</h3>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              
              {analyticsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : analytics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-gray-800" data-testid="average-rating">
                        {analytics.averageRating}
                      </span>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-bold text-green-600" data-testid="response-time">
                      {analytics.averageResponseTime && analytics.averageResponseTime < 60 ? `${analytics.averageResponseTime}s` : `${Math.floor((analytics.averageResponseTime || 0) / 60)}m`}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Messages Sent</span>
                    <span className="font-bold text-gray-800" data-testid="messages-sent">
                      {analytics.totalMessages}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Guest Satisfaction</span>
                    <span className="font-bold text-green-600" data-testid="guest-satisfaction">
                      {analytics.guestSatisfaction}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${analytics.guestSatisfaction}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No analytics data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
