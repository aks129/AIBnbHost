import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailSignupResponse {
  success: boolean;
  message: string;
  id: string;
}

export default function EmailSignup() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const emailSignup = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/email-signup", data);
      return response.json() as Promise<EmailSignupResponse>;
    },
    onSuccess: (data) => {
      setIsSuccess(true);
      toast({
        title: "Successfully Signed Up!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to sign up";
      toast({
        title: "Signup Failed",
        description: message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Name Required", 
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    emailSignup.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto shadow-xl">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">You're All Set!</h3>
          <p className="text-gray-600 mb-4">
            Thanks for signing up! We'll keep you updated on Lana AI's latest features and hosting insights.
          </p>
          <p className="text-sm text-gray-500">
            Check your email for a confirmation message.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto shadow-xl">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <Mail className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Get Early Access
          </h3>
          <p className="text-gray-600">
            Be the first to know when Lana AI is available for your Airbnb hosting needs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700 mb-2">
              Your Name
            </Label>
            <Input
              id="signup-name"
              data-testid="input-signup-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
              disabled={emailSignup.isPending}
            />
          </div>

          <div>
            <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </Label>
            <Input
              id="signup-email"
              data-testid="input-signup-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
              className="w-full"
              disabled={emailSignup.isPending}
            />
          </div>

          <Button
            data-testid="button-signup-submit"
            type="submit"
            disabled={emailSignup.isPending}
            className="w-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <Mail className="w-4 h-4 mr-2" />
            {emailSignup.isPending ? "Signing Up..." : "Get Early Access"}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </CardContent>
    </Card>
  );
}