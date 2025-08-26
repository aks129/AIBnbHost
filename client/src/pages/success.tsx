import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Star } from "lucide-react";
import { Link } from "wouter";

export default function Success() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/get-started";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center p-8">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Lana AI!
            </CardTitle>
            <p className="text-xl text-gray-600">
              Your 30-day free trial has started successfully
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">
                🎉 Trial Active - Full Access Unlocked!
              </h3>
              <p className="text-green-700 text-sm">
                You now have complete access to all Lana AI features for the next 30 days.
                Start automating your Airbnb guest communication today!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              <div className="text-center p-4">
                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="font-semibold text-sm">AI Messages</h4>
                <p className="text-xs text-gray-600">Personalized guest communication</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-semibold text-sm">24/7 Automation</h4>
                <p className="text-xs text-gray-600">Never miss a guest message</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                </div>
                <h4 className="font-semibold text-sm">5-Star Reviews</h4>
                <p className="text-xs text-gray-600">Guaranteed review optimization</p>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/get-started">
                <Button 
                  className="w-full bg-red-500 text-white hover:bg-red-600 py-6 text-lg font-semibold"
                  data-testid="get-started"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Get Started with Setup
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button 
                  variant="outline"
                  className="w-full py-3"
                  data-testid="skip-to-dashboard"
                >
                  Skip Setup - Go to Dashboard
                </Button>
              </Link>
              
              <p className="text-sm text-gray-500">
                Redirecting to setup in {countdown} seconds...
              </p>
            </div>

            <div className="border-t pt-6 mt-6">
              <h4 className="font-semibold mb-3">What's Next?</h4>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>✓ Check your email for setup instructions and tips</li>
                <li>✓ Connect your Airbnb properties to start automation</li>
                <li>✓ Customize message templates for your hosting style</li>
                <li>✓ Watch your review scores improve automatically</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Questions? Need help? Contact us at support@lanaai.com</p>
          <p>Your trial will automatically convert to a paid subscription after 30 days</p>
          <p>Cancel anytime from your account settings</p>
        </div>
      </div>
    </div>
  );
}