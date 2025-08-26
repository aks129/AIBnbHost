import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Check, 
  Settings, 
  MessageSquare, 
  BarChart3, 
  Users,
  Calendar,
  Mail,
  Home
} from "lucide-react";

export default function GetStarted() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();

  const steps = [
    {
      id: 1,
      title: "Welcome to Lana AI",
      description: "Let's set up your AI-powered Airbnb co-host"
    },
    {
      id: 2,
      title: "Connect Your Properties",
      description: "Link your Airbnb listings for automated communication"
    },
    {
      id: 3,
      title: "Customize Your Style",
      description: "Set your communication preferences and tone"
    },
    {
      id: 4,
      title: "You're All Set!",
      description: "Start automating your guest communication"
    }
  ];

  const currentStep = steps.find(s => s.id === step) || steps[0];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Lana AI!</h2>
              <p className="text-gray-600 mb-6">
                Your AI co-host is ready to help you achieve consistent 5-star reviews through automated, personalized guest communication.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Smart Messaging</h3>
                  <p className="text-sm text-gray-600">AI generates personalized messages for every guest interaction</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Performance Tracking</h3>
                  <p className="text-sm text-gray-600">Monitor your review scores and response rates in real-time</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Calendar className="w-6 h-6 text-purple-500 mt-1" />
                <div>
                  <h3 className="font-semibold">24/7 Automation</h3>
                  <p className="text-sm text-gray-600">Never miss a guest message with round-the-clock responses</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Users className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Guest Satisfaction</h3>
                  <p className="text-sm text-gray-600">Proven to increase 5-star reviews by 40% on average</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Your Properties</h2>
              <p className="text-gray-600 mb-6">
                Add your Airbnb listings to enable automated guest communication
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Property Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="property-url">Airbnb Property URL</Label>
                  <Input 
                    id="property-url"
                    placeholder="https://www.airbnb.com/rooms/12345678"
                    data-testid="input-property-url"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Copy and paste your Airbnb listing URL here
                  </p>
                </div>

                <div>
                  <Label htmlFor="property-name">Property Name</Label>
                  <Input 
                    id="property-name"
                    placeholder="Downtown Cozy Apartment"
                    data-testid="input-property-name"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Quick Setup Option</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    We'll automatically detect your property details and set up basic automation.
                    You can customize everything later.
                  </p>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                    Auto-detect Property Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Customize Your Style</h2>
              <p className="text-gray-600 mb-6">
                Set your communication tone and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Communication Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="style" value="professional" className="text-red-500" />
                    <div>
                      <div className="font-semibold">Professional</div>
                      <div className="text-sm text-gray-600">Formal, business-oriented tone</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="style" value="friendly" className="text-red-500" defaultChecked />
                    <div>
                      <div className="font-semibold">Friendly</div>
                      <div className="text-sm text-gray-600">Warm and welcoming approach</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="style" value="casual" className="text-red-500" />
                    <div>
                      <div className="font-semibold">Casual</div>
                      <div className="text-sm text-gray-600">Relaxed, conversational style</div>
                    </div>
                  </label>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Response Timing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="text-red-500" />
                    <span>Instant responses (within 1 minute)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="text-red-500" />
                    <span>Pre-arrival messages (24 hours before)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="text-red-500" />
                    <span>Check-in assistance (day of arrival)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="text-red-500" />
                    <span>Follow-up messages (after checkout)</span>
                  </label>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="host-name">Your Host Name</Label>
                  <Input 
                    id="host-name"
                    placeholder="Sarah"
                    data-testid="input-host-name"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    How should Lana AI sign your messages?
                  </p>
                </div>
                <div>
                  <Label htmlFor="special-instructions">Special Instructions (Optional)</Label>
                  <Input 
                    id="special-instructions"
                    placeholder="Always mention the roof deck access"
                    data-testid="input-special-instructions"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
              <p className="text-gray-600 mb-6">
                Lana AI is now ready to start automating your guest communication
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-3">Setup Complete! Here's what happens next:</h3>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                  Lana AI will monitor your Airbnb messages 24/7
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                  Personalized responses will be sent automatically
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                  You'll receive daily performance reports
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                  Review scores will start improving within days
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">View Analytics</h4>
                      <p className="text-sm text-gray-600">Monitor your performance metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-8 h-8 text-purple-500" />
                    <div>
                      <h4 className="font-semibold">Message Templates</h4>
                      <p className="text-sm text-gray-600">Customize your automated responses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepItem.id ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepItem.id ? <Check className="w-4 h-4" /> : stepItem.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-1 mx-4 ${
                    step > stepItem.id ? 'bg-red-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">{currentStep.title}</h1>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            data-testid="button-previous"
          >
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Step {step} of {steps.length}
            </span>
          </div>

          <Button
            onClick={() => {
              if (step === steps.length) {
                setLocation("/");
              } else {
                setStep(Math.min(steps.length, step + 1));
              }
            }}
            className="bg-red-500 text-white hover:bg-red-600"
            data-testid="button-next"
          >
            {step === steps.length ? "Go to Dashboard" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Skip Option */}
        {step < steps.length && (
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-gray-500 hover:text-gray-700"
              data-testid="button-skip"
            >
              Skip setup and go to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}