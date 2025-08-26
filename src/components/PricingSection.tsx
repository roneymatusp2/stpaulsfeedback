import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Users, Building, Zap } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      icon: Users,
      price: "£150",
      period: "per user/year",
      description: "Perfect for small departments or pilot programmes",
      features: [
        "Up to 20 teachers",
        "Basic observation tools",
        "Feedback system",
        "Best practices gallery",
        "Email support",
        "Basic reporting"
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      icon: Building,
      price: "£2,500",
      period: "per school/year",
      description: "Ideal for full school implementation",
      features: [
        "Up to 100 teachers",
        "Advanced analytics",
        "Video integration",
        "AI-powered insights",
        "Priority support",
        "Custom training",
        "SSO integration",
        "Advanced reporting"
      ],
      popular: true,
      cta: "Most Popular"
    },
    {
      name: "Enterprise",
      icon: Zap,
      price: "Custom",
      period: "contact us",
      description: "For multi-school trusts and large institutions",
      features: [
        "Unlimited users",
        "White-label options",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support",
        "GDPR/FERPA compliance",
        "Multi-tenant architecture"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-secondary/10 text-secondary-foreground border-secondary/20">
            Transparent Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose the Perfect Plan
            <span className="block text-secondary-foreground">for Your Institution</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Competitive pricing based on extensive market research. No hidden fees, 
            free training included, and 30-day money-back guarantee.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative ${
                plan.popular 
                  ? 'border-primary shadow-glow scale-105' 
                  : 'border-border hover:border-primary/50'
              } transition-all duration-300 hover:shadow-elegant`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-6">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <plan.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period !== "contact us" && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                  {plan.period === "contact us" && (
                    <div className="text-muted-foreground mt-1">{plan.period}</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className={`h-5 w-5 mr-3 ${
                        plan.popular ? 'text-primary' : 'text-accent'
                      }`} />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "hero" : "professional"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-subtle rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We work with multi-academy trusts, international schools, and large educational organisations 
              to create bespoke solutions that fit your specific requirements and budget.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="professional" size="lg">
                Schedule Consultation
              </Button>
              <Button variant="ghost" size="lg">
                Download Comparison Guide
              </Button>
            </div>
          </div>
        </div>

        {/* Price Comparison Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            * Prices shown are indicative. Market research shows competitor pricing ranges from £40-£300 per user annually. 
            Our pricing reflects premium features while remaining competitive with enterprise solutions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;