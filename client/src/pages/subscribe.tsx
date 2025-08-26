import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Star, MessageSquare, Clock, Users } from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const subscriptionSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  planType: z.enum(["monthly", "yearly"]),
});

type SubscriptionForm = z.infer<typeof subscriptionSchema>;

const CheckoutForm = ({ planType }: { planType: "monthly" | "yearly" }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to Lana AI!",
          description: "Your 30-day trial has started. Check your email for setup instructions.",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-red-500 text-white hover:bg-red-600 py-6 text-lg font-semibold"
        data-testid="confirm-payment"
      >
        {isLoading ? "Processing..." : `Start 30-Day Free Trial (Then $${planType === "monthly" ? "29.99/mo" : "323.89/yr"})`}
      </Button>
    </form>
  );
};

const PricingCard = ({ 
  title, 
  price, 
  period, 
  originalPrice, 
  features, 
  isPopular, 
  onSelect,
  isSelected 
}: {
  title: string;
  price: string;
  period: string;
  originalPrice?: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
  isSelected: boolean;
}) => (
  <Card className={`relative ${isSelected ? 'ring-2 ring-red-500' : ''} ${isPopular ? 'border-red-500' : ''}`}>
    {isPopular && (
      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white">
        Most Popular
      </Badge>
    )}
    <CardHeader className="text-center pb-4">
      <CardTitle className="text-xl font-bold">{title}</CardTitle>
      <div className="mt-4">
        <div className="flex items-center justify-center">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-gray-600 ml-1">/{period}</span>
        </div>
        {originalPrice && (
          <div className="text-sm text-gray-500 line-through">${originalPrice}/{period}</div>
        )}
        {originalPrice && (
          <Badge variant="secondary" className="mt-2">Save 10%</Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="text-center text-sm text-gray-600 mb-4">
        <strong>30-day free trial</strong> • No setup fees • Cancel anytime
      </div>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={onSelect}
        className={`w-full mt-6 py-3 ${isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        data-testid={`select-${period}-plan`}
      >
        {isSelected ? 'Selected' : `Choose ${title}`}
      </Button>
    </CardContent>
  </Card>
);

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      planType: "monthly"
    }
  });

  const watchPlanType = watch("planType");

  useEffect(() => {
    setSelectedPlan(watchPlanType);
  }, [watchPlanType]);

  const onSubmit = async (data: SubscriptionForm) => {
    try {
      const response = await apiRequest("POST", "/api/create-subscription", {
        email: data.email,
        name: data.name,
        planType: data.planType,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.clientSecret) {
          setClientSecret(result.clientSecret);
          setShowPayment(true);
        } else {
          toast({
            title: "Setup Complete",
            description: "Your trial has started! Check your email for next steps.",
          });
        }
      } else {
        throw new Error("Failed to create subscription");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const features = [
    "24/7 AI guest communication",
    "Personalized message templates",
    "Automated check-in/checkout flows",
    "Issue resolution system",
    "Review optimization tools",
    "Analytics & performance tracking",
    "Multi-property management",
    "Priority email support"
  ];

  if (showPayment && clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Complete Your Setup
            </h1>
            <p className="text-gray-600">
              Enter your payment details to start your 30-day free trial
            </p>
          </div>
          
          <Card className="p-6">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm planType={selectedPlan} />
            </Elements>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>🔒 Your payment information is secure and encrypted</p>
            <p>Cancel anytime during your trial with no charges</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Transform Your Airbnb Hosting
          </h1>
          <p className="text-xl text-white/90 mb-6">
            Get 5-star reviews every time with AI-powered guest communication
          </p>
          <div className="flex items-center justify-center space-x-6 text-white/90">
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 fill-current" />
              <span>4.96★ Average Rating</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span>10,000+ Happy Hosts</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              <span>500K+ Messages Sent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Pricing Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-gray-600 text-lg">
            Start with a 30-day free trial. No setup fees, cancel anytime.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <PricingCard
              title="Monthly"
              price="29.99"
              period="month"
              features={features}
              onSelect={() => setSelectedPlan("monthly")}
              isSelected={selectedPlan === "monthly"}
            />
            <PricingCard
              title="Yearly"
              price="323.89"
              period="year"
              originalPrice="359.88"
              features={[...features, "2 months free"]}
              isPopular
              onSelect={() => setSelectedPlan("yearly")}
              isSelected={selectedPlan === "yearly"}
            />
          </div>

          <input type="hidden" {...register("planType")} value={selectedPlan} />

          {/* Contact Information */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Start Your Free Trial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  data-testid="input-email"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  data-testid="input-name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-red-500 text-white hover:bg-red-600 py-6 text-lg font-semibold"
                data-testid="start-trial"
              >
                Start Your 30-Day Free Trial
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p>✓ No credit card required for trial</p>
                <p>✓ Cancel anytime with one click</p>
                <p>✓ Full access to all features</p>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Features Showcase */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Everything You Need for 5-Star Reviews
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <MessageSquare className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Smart Communication</h4>
              <p className="text-gray-600 text-sm">
                AI generates personalized messages for every guest interaction
              </p>
            </Card>
            <Card className="text-center p-6">
              <Clock className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">24/7 Automation</h4>
              <p className="text-gray-600 text-sm">
                Never miss a guest message with instant, intelligent responses
              </p>
            </Card>
            <Card className="text-center p-6">
              <Star className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Review Optimization</h4>
              <p className="text-gray-600 text-sm">
                Proven to increase 5-star reviews by 40% and response rates
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}