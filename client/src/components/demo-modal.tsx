import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward, X, MessageSquare, Clock, Star, Users } from "lucide-react";
import { trackDemoInterest } from "@/lib/demo-tracking";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const demoSteps = [
  {
    title: "Welcome to Lana AI",
    subtitle: "Your AI-Powered Airbnb Co-Host",
    content: "Lana AI automatically handles all guest communication throughout their entire stay journey, ensuring 5-star reviews every time.",
    visual: "welcome",
    duration: 4000
  },
  {
    title: "Pre-Arrival Magic",
    subtitle: "Personalized Welcome Messages",
    content: "Before guests arrive, Lana AI sends customized welcome messages with check-in details, local recommendations, and house rules - all tailored to their guest type.",
    visual: "pre-arrival",
    duration: 5000
  },
  {
    title: "Instant Response System",
    subtitle: "24/7 Guest Support",
    content: "Guests get immediate responses to their questions about WiFi, amenities, or local attractions. Lana AI maintains your hosting voice while providing accurate information.",
    visual: "instant-response",
    duration: 5000
  },
  {
    title: "Issue Resolution",
    subtitle: "Proactive Problem Solving",
    content: "When issues arise, Lana AI responds with empathy and practical solutions, often resolving problems before they impact your review score.",
    visual: "issue-resolution",
    duration: 5000
  },
  {
    title: "Follow-Up Excellence",
    subtitle: "Post-Stay Engagement",
    content: "After checkout, Lana AI sends personalized thank-you messages and gentle review requests, significantly boosting your review rate and ratings.",
    visual: "follow-up",
    duration: 5000
  },
  {
    title: "Results That Matter",
    subtitle: "Proven Performance",
    content: "Hosts using Lana AI see 40% more reviews, 96% five-star ratings, and save 10+ hours per week on guest communication.",
    visual: "results",
    duration: 4000
  }
];

const DemoVisual = ({ step }: { step: string }) => {
  const visuals = {
    welcome: (
      <div className="bg-gradient-to-br from-red-500 to-orange-500 p-8 rounded-lg text-white text-center">
        <MessageSquare className="w-16 h-16 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Lana AI</h3>
        <p className="opacity-90">Your intelligent co-host is ready</p>
      </div>
    ),
    "pre-arrival": (
      <div className="bg-white p-6 rounded-lg border shadow-lg">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-800">Hi Sarah! Welcome to your home away from home 🏡</p>
              <p className="text-sm text-gray-800 mt-2">I've prepared some personalized recommendations for first-time visitors like yourself...</p>
            </div>
            <div className="text-xs text-gray-500 mt-1">Sent 2 hours before arrival</div>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800">Personalized for Guest Type</Badge>
      </div>
    ),
    "instant-response": (
      <div className="bg-white p-6 rounded-lg border shadow-lg space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-blue-100 rounded-lg p-3">
              <p className="text-sm">What's the WiFi password?</p>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm">Hi! The WiFi network is "CozyHome_Guest" and the password is "Welcome2024". You'll find it on the welcome card by the TV too! 😊</p>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Clock className="w-3 h-3 mr-1" />
              Responded in 12 seconds
            </div>
          </div>
        </div>
      </div>
    ),
    "issue-resolution": (
      <div className="bg-white p-6 rounded-lg border shadow-lg space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-orange-100 rounded-lg p-3">
              <p className="text-sm">The heating isn't working properly...</p>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm">I'm so sorry about that! Let me help you right away. Try the thermostat reset (press and hold for 10 seconds). I've also contacted our maintenance team and they'll be there within 30 minutes if needed.</p>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 text-xs mt-2">Proactive Solution + Backup Plan</Badge>
          </div>
        </div>
      </div>
    ),
    "follow-up": (
      <div className="bg-white p-6 rounded-lg border shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-800">Thank you for staying with us, Sarah! 🌟</p>
              <p className="text-sm text-gray-800 mt-2">We hope you loved the local coffee shop recommendation. If you have a moment, a quick review would mean the world to us!</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">Sent 2 hours after checkout</div>
              <Badge className="bg-green-100 text-green-800">+85% Review Rate</Badge>
            </div>
          </div>
        </div>
      </div>
    ),
    results: (
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">4.96★</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </CardContent>
        </Card>
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">+40%</div>
            <div className="text-sm text-gray-600">More Reviews</div>
          </CardContent>
        </Card>
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">10hrs</div>
            <div className="text-sm text-gray-600">Saved/Week</div>
          </CardContent>
        </Card>
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <Users className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-gray-600">Satisfaction</div>
          </CardContent>
        </Card>
      </div>
    )
  };
  
  return visuals[step as keyof typeof visuals] || visuals.welcome;
};

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen && !isPlaying) {
      // Track demo view when modal opens
      trackDemoInterest({
        source: "watch-demo-modal"
      });
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && isOpen) {
      const currentDuration = demoSteps[currentStep].duration;
      const progressIncrement = 100 / (currentDuration / 100);
      
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + progressIncrement;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, isOpen]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(0);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setProgress(0);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = demoSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Lana AI Demo Walkthrough
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${(currentStep / (demoSteps.length - 1)) * 100 + (progress / demoSteps.length)}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between items-center">
            {demoSteps.map((step, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={`flex flex-col items-center space-y-1 px-2 py-1 rounded transition-all ${
                  index === currentStep
                    ? 'bg-red-50 text-red-600'
                    : index < currentStep
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${
                  index === currentStep
                    ? 'bg-red-500'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`} />
                <span className="text-xs font-medium hidden sm:block">{index + 1}</span>
              </button>
            ))}
          </div>

          {/* Main Demo Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Panel */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentStepData.title}
                </h3>
                <h4 className="text-lg text-red-600 font-semibold mb-4">
                  {currentStepData.subtitle}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {currentStepData.content}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4 pt-4">
                <Button
                  data-testid="demo-play-pause"
                  onClick={handlePlay}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                
                {currentStep < demoSteps.length - 1 && (
                  <Button
                    data-testid="demo-next"
                    onClick={handleNext}
                    variant="outline"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Next
                  </Button>
                )}
              </div>
            </div>

            {/* Visual Panel */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <DemoVisual step={currentStepData.visual} />
            </div>
          </div>

          {/* Call to Action */}
          {currentStep === demoSteps.length - 1 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg text-center">
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Ready to Transform Your Hosting?
              </h4>
              <p className="text-gray-600 mb-4">
                Join thousands of hosts who've automated their guest communication with Lana AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  data-testid="demo-schedule-call"
                  onClick={() => {
                    trackDemoInterest({ source: "demo-modal-cta" });
                    window.open("https://calendar.app.google/17Rqf8xXDXpweVPw5", "_blank");
                  }}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Schedule Demo Call
                </Button>
                <Button
                  data-testid="demo-close"
                  onClick={handleClose}
                  variant="outline"
                >
                  Continue Exploring
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}