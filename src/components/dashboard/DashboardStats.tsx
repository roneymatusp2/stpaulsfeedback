import { Card, CardContent } from "@/components/ui/card";
import { Plus, Eye, Users } from "lucide-react";

export function DashboardStats() {
  const stats = [
    {
      title: "Observations made about you",
      count: "1 new",
      icon: Eye,
      color: "bg-sps-green" /* St. Paul's British Green */
    },
    {
      title: "Observations created by you",
      count: "10 unpublished", 
      icon: Users,
      color: "bg-sps-indigo" /* St. Paul's Indigo Blue */
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardContent className="p-0">
            <div className={`h-24 ${stat.color} relative flex items-center justify-center`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <div className="relative z-10 p-6 text-center">
                <stat.icon className="h-10 w-10 text-white mx-auto drop-shadow-sm" />
              </div>
            </div>
            <div className="p-6 bg-gradient-to-b from-background to-background/80">
              <h3 className="font-semibold text-foreground text-lg mb-2">{stat.title}</h3>
              {stat.count && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.count}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}