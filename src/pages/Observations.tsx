import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, User, FileText } from "lucide-react";

const observations = [
  {
    id: 1,
    type: "Senior School Learning Observation",
    observer: "Martina Oparaocha",
    date: "15 Aug 2025",
    status: "Completed",
    subject: "IB Mathematics"
  },
  {
    id: 2,
    type: "Senior School Peer Observation",
    observer: "Sam Bishop",
    date: "10 Aug 2025",
    status: "In Progress",
    subject: "IGCSE Mathematics"
  },
  {
    id: 3,
    type: "Senior School Learning Walk",
    observer: "Dr. Louise Simpson",
    date: "5 Aug 2025", 
    status: "Draft",
    subject: "KS3 Mathematics"
  }
];

export default function Observations() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">Observations</h1>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Observation
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">12</div>
                    <div className="text-muted-foreground">Total Observations</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">3</div>
                    <div className="text-muted-foreground">This Month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <User className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">5</div>
                    <div className="text-muted-foreground">Different Observers</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Observations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {observations.map((obs) => (
                      <div key={obs.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{obs.type}</h3>
                          <p className="text-sm text-muted-foreground">Observer: {obs.observer}</p>
                          <p className="text-sm text-muted-foreground">Subject: {obs.subject}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{obs.date}</div>
                          <Badge 
                            variant={
                              obs.status === "Completed" ? "default" :
                              obs.status === "In Progress" ? "secondary" : "outline"
                            }
                          >
                            {obs.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}