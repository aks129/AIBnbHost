import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, MessageSquare, Users } from "lucide-react";
import type { Analytics } from "@shared/schema";

export default function AnalyticsSection() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics/current"],
  });

  const commonQuestions = [
    { question: "WiFi password and setup", percentage: 34, color: "bg-blue-100 text-blue-800" },
    { question: "Check-in/check-out procedures", percentage: 28, color: "bg-green-100 text-green-800" },
    { question: "Local restaurant recommendations", percentage: 19, color: "bg-purple-100 text-purple-800" },
    { question: "Transportation and parking", percentage: 12, color: "bg-orange-100 text-orange-800" },
    { question: "Appliance instructions", percentage: 7, color: "bg-red-100 text-red-800" },
  ];

  if (isLoading) {
    return (
      <section id="analytics" className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Performance Analytics</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track the impact of AI-powered communication on your guest satisfaction and review ratings.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="analytics" className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Performance Analytics</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track the impact of AI-powered communication on your guest satisfaction and review ratings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review Rating Trends */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Review Rating Trends</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Before Claude AI</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-600 mr-2">4.2</span>
                    <div className="flex text-gray-400">
                      {[1, 2, 3, 4].map((star) => (
                        <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                      <svg className="w-4 h-4" viewBox="0 0 20 20">
                        <path fill="currentColor" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">After Claude AI</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-green-600 mr-2" data-testid="current-rating">
                      {analytics?.averageRating || "4.96"}
                    </span>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">+18%</div>
                    <div className="text-sm text-green-700">Rating Improvement</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Time Analytics */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Response Time Analytics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Response Time</span>
                  <span className="text-2xl font-bold text-green-600" data-testid="avg-response-time">
                    {analytics?.averageResponseTime ? 
                      (analytics.averageResponseTime < 60 ? `${analytics.averageResponseTime} seconds` : `${Math.floor(analytics.averageResponseTime / 60)} minutes`) :
                      "47 seconds"
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">24/7 Availability</span>
                  <span className="text-lg font-semibold text-gray-800">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Guest Satisfaction</span>
                  <span className="text-lg font-semibold text-green-600" data-testid="satisfaction-rate">
                    {analytics?.guestSatisfaction || "98.5"}%
                  </span>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">85%</div>
                    <div className="text-sm text-blue-700">Time Saved vs Manual</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Communication Summary */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Monthly Communication Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600" data-testid="monthly-messages">
                    {analytics?.totalMessages || 147}
                  </div>
                  <div className="text-sm text-blue-700">Messages Sent</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600" data-testid="monthly-guests">
                    {analytics?.totalGuests || 23}
                  </div>
                  <div className="text-sm text-green-700">Guests Served</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600" data-testid="issues-resolved">
                    {analytics?.issuesResolved || 12}
                  </div>
                  <div className="text-sm text-purple-700">Issues Resolved</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600" data-testid="five-star-reviews">
                    {analytics?.fiveStarReviews || 21}
                  </div>
                  <div className="text-sm text-yellow-700">5-Star Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Guest Questions */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Most Common Guest Questions</h3>
              <div className="space-y-3">
                {commonQuestions.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    data-testid={`question-${index}`}
                  >
                    <span className="text-gray-800">{item.question}</span>
                    <span className={`${item.color} px-2 py-1 rounded-full text-xs font-medium`}>
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
