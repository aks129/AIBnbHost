import { useState } from 'react';
import { useNavigate } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { PropertySetupStep } from '@/components/onboarding/property-setup-step';
import { AirbnbConnectionStep } from '@/components/onboarding/airbnb-connection-step';
import { MessagePreferencesStep } from '@/components/onboarding/message-preferences-step';
import { CompletionStep } from '@/components/onboarding/completion-step';

const STEPS = [
  { id: 1, title: 'Property Setup', description: 'Tell us about your property' },
  { id: 2, title: 'Connect Airbnb', description: 'Link your Airbnb account' },
  { id: 3, title: 'Message Preferences', description: 'Configure auto-reply settings' },
  { id: 4, title: 'Complete', description: 'You\'re all set!' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    numberOfProperties: 1,
    primaryLocation: '',
    autoReplyEnabled: true,
    responseDelayMinutes: 15,
    businessHoursStart: '09:00',
    businessHoursEnd: '21:00',
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = async (stepData: any) => {
    setFormData({ ...formData, ...stepData });

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch('/api/users/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          onboardingCompleted: 4,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      toast({
        title: 'Onboarding complete!',
        description: 'Welcome to Lana AI',
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete onboarding',
        variant: 'destructive',
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PropertySetupStep onNext={handleNext} initialData={formData} />;
      case 2:
        return <AirbnbConnectionStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <MessagePreferencesStep onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 4:
        return <CompletionStep onComplete={() => completeOnboarding()} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Lana AI</h1>
          <p className="text-gray-600">Let's get your AI co-host set up in just a few steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  step.id === currentStep ? 'text-blue-600 font-semibold' : 'text-gray-400'
                }`}
              >
                <div className="text-sm">{step.title}</div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-center mt-2 text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
