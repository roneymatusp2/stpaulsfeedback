import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Shield,
  Camera,
  Lightbulb,
  Target
} from "lucide-react";
// Removed dashboard preview import

const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "Peer-to-Peer Observation",
      description: "Structured observation protocols enable teachers to learn from each other through guided feedback sessions.",
      color: "text-primary"
    },
    {
      icon: MessageSquare,
      title: "Constructive Feedback System",
      description: "Evidence-based feedback tools that focus on growth and professional development rather than evaluation.",
      color: "text-secondary-foreground"
    },
    {
      icon: BookOpen,
      title: "Best Practices Gallery",
      description: "Curated repository of teaching strategies and successful practices shared across your institution.",
      color: "text-accent"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track observation trends, engagement metrics, and professional development progress with detailed reporting.",
      color: "text-primary"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated scheduling system that makes it easy to arrange observation sessions and follow-up meetings.",
      color: "text-secondary-foreground"
    },
    {
      icon: Shield,
      title: "Privacy & Compliance",
      description: "Secure platform with role-based access controls and compliance with educational data protection standards.",
      color: "text-accent"
    },
    {
      icon: Camera,
      title: "Video Integration",
      description: "Optional video capture for asynchronous observation and reflective analysis with privacy controls.",
      color: "text-primary"
    },
    {
      icon: Lightbulb,
      title: "AI-Powered Insights",
      description: "Intelligent suggestions for improvement areas and trending teaching practices across your network.",
      color: "text-secondary-foreground"
    },
    {
      icon: Target,
      title: "Goal Setting & Tracking",
      description: "Set professional development goals and track progress through structured observation cycles.",
      color: "text-accent"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Supporting Our Educators with
            <span className="block text-primary">Comprehensive Development Tools</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Our internal platform provides St. Paul's School faculty with modern tools for peer observation, 
            structured feedback, and collaborative professional growth.
          </p>
        </div>

        {/* Removed fake dashboard preview image */}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border/50"
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-current/10 flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to explore our internal development platform?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Badge variant="outline" className="text-primary border-primary">
              ✨ Dedicated to St. Paul's Faculty
            </Badge>
            <Badge variant="outline" className="text-primary border-primary">
              📚 Comprehensive training support
            </Badge>
            <Badge variant="outline" className="text-primary border-primary">
              🔒 Secure internal platform
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;