import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hand, MapPin, Wrench, Key, Star, Calendar } from "lucide-react";
import type { Template } from "@shared/schema";

export default function TemplateLibrary() {
  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const templateCategories = [
    {
      icon: Hand,
      category: "welcome",
      title: "Welcome Messages",
      color: "bg-blue-100 text-blue-600",
      bgColor: "bg-blue-50",
      examples: [
        { title: "First-time visitors", description: "Welcome to San Francisco! As a first-time visitor, here's what you absolutely can't miss..." },
        { title: "Business travelers", description: "Perfect for your business trip! Here are the fastest routes to downtown and best work cafes..." },
        { title: "Families with kids", description: "Welcome! We've included family-friendly activities and the nearest playground locations..." }
      ]
    },
    {
      icon: MapPin,
      category: "local-recommendations", 
      title: "Local Recommendations",
      color: "bg-green-100 text-green-600",
      bgColor: "bg-green-50",
      examples: [
        { title: "Foodie recommendations", description: "Since you love food, here are our neighborhood's best-kept culinary secrets..." },
        { title: "Outdoor activities", description: "Beautiful weather ahead! Here are the best hiking trails and outdoor spots nearby..." },
        { title: "Art & culture", description: "For art lovers: galleries, museums, and cultural events happening during your stay..." }
      ]
    },
    {
      icon: Wrench,
      category: "problem-resolution",
      title: "Problem Resolution", 
      color: "bg-red-100 text-red-600",
      bgColor: "bg-red-50",
      examples: [
        { title: "WiFi issues", description: "I apologize for the WiFi trouble. Here's how to reset it, plus backup solutions..." },
        { title: "Appliance help", description: "No worries! Here's a quick guide to using the [appliance], with photos included..." },
        { title: "Noise concerns", description: "I understand your concern about noise. I'm addressing this immediately and here's what I'm doing..." }
      ]
    },
    {
      icon: Key,
      category: "check-in",
      title: "Check-in Instructions",
      color: "bg-teal-100 text-teal-600", 
      bgColor: "bg-teal-50",
      examples: [
        { title: "Self check-in", description: "Your check-in is simple! Here's your keypad code and step-by-step photos..." },
        { title: "Concierge check-in", description: "Please check in with our concierge on the ground floor. Here's what to expect..." },
        { title: "Late arrival", description: "No problem with late check-in! Here are the special instructions for after-hours access..." }
      ]
    },
    {
      icon: Star,
      category: "review-requests",
      title: "Review Requests",
      color: "bg-yellow-100 text-yellow-600",
      bgColor: "bg-yellow-50", 
      examples: [
        { title: "Perfect stay", description: "So glad you enjoyed [specific highlight]! A review would mean the world to us..." },
        { title: "After minor issue", description: "Thanks for your patience with [issue]. I hope the resolution met your expectations..." },
        { title: "Repeat guests", description: "Always a pleasure hosting you! Your review helps other guests discover our space..." }
      ]
    },
    {
      icon: Calendar,
      category: "seasonal-updates",
      title: "Seasonal Updates",
      color: "bg-purple-100 text-purple-600",
      bgColor: "bg-purple-50",
      examples: [
        { title: "Holiday events", description: "Perfect timing for your visit! Here are special holiday events happening nearby..." },
        { title: "Weather updates", description: "Heads up about the weather this week! Here's what to pack and indoor alternatives..." },
        { title: "Local festivals", description: "You're in luck! The annual [festival] is happening during your stay. Here's the inside scoop..." }
      ]
    }
  ];

  const getCategoryTemplateCount = (category: string) => {
    return templates.filter(template => template.category === category).length;
  };

  return (
    <section id="templates" className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Smart Message Templates</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lana AI generates personalized messages using our extensive template library, automatically adapting content based on guest profiles and local context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templateCategories.map((category, index) => {
            const Icon = category.icon;
            const templateCount = getCategoryTemplateCount(category.category);

            return (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${category.color} bg-opacity-20 rounded-lg flex items-center justify-center mr-4`}>
                      <Icon className={`${category.color} text-xl`} size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{category.title}</h3>
                      <p className="text-sm text-gray-600">
                        {templateCount > 0 ? `${templateCount} templates` : '15 templates'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {category.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex} className={`${category.bgColor} p-3 rounded-lg`}>
                        <div className="text-sm font-medium text-gray-800 mb-1">{example.title}</div>
                        <div className="text-xs text-gray-600">"{example.description}"</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {isLoading && (
          <div className="text-center mt-8">
            <div className="animate-pulse text-gray-600">Loading templates...</div>
          </div>
        )}
      </div>
    </section>
  );
}
