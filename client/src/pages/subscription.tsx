import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, Crown, Star, Zap } from "lucide-react";
import PaymentForm from "@/components/payments/payment-form";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");

  // Fetch subscription plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['/api/subscription/plans'],
  });

  // Fetch user's current subscription
  const { data: currentSubscription } = useQuery({
    queryKey: ['/api/subscription/current'],
    enabled: !!user,
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiRequest("POST", "/api/subscription/create", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      toast({
        title: "Subscription Created",
        description: "Please complete your payment to activate your subscription.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId);
    createSubscriptionMutation.mutate(planId);
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] });
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    setClientSecret("");
    setSelectedPlan(null);
    toast({
      title: "Payment Successful!",
      description: "Your subscription has been activated. Welcome to EduEase Premium!",
    });
  };

  if (plansLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (clientSecret) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                Finish your payment to activate your EduEase subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm onSuccess={handlePaymentSuccess} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your EduEase Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock advanced AI features, unlimited content, and premium support to accelerate your learning journey
        </p>
      </div>

      {currentSubscription && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Current Subscription</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-800">{currentSubscription.planName}</p>
                <p className="text-sm text-green-600">
                  Status: <Badge variant="outline" className="text-green-700 border-green-300">
                    {currentSubscription.status}
                  </Badge>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-800">
                  ${(currentSubscription.price / 100).toFixed(2)}
                </p>
                <p className="text-sm text-green-600">per {currentSubscription.interval}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan: any, index: number) => {
          const isPopular = index === 1;
          const features = plan.features || [];
          
          return (
            <Card key={plan.id} className={`relative ${isPopular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {index === 0 && <Zap className="h-12 w-12 text-gray-600" />}
                  {index === 1 && <Crown className="h-12 w-12 text-blue-600" />}
                  {index === 2 && <Star className="h-12 w-12 text-purple-600" />}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${(plan.price / 100).toFixed(2)}</span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <Separator className="mb-6" />
                <ul className="space-y-3 mb-6">
                  {features.map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={isPopular ? "default" : "outline"}
                  disabled={createSubscriptionMutation.isPending || 
                           (currentSubscription && currentSubscription.planId === plan.id)}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {createSubscriptionMutation.isPending && selectedPlan === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </div>
                  ) : currentSubscription && currentSubscription.planId === plan.id ? (
                    "Current Plan"
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          All plans include our 30-day money-back guarantee
        </p>
        <p className="text-sm text-gray-500">
          Need help choosing? <a href="mailto:support@eduease.com" className="text-blue-600 hover:underline">Contact our team</a>
        </p>
      </div>
    </div>
  );
}