import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Users } from "lucide-react";

export default function BestPractices() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">Best Practices</h1>
                <Button disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Share Practice
                </Button>
              </div>

              {/* Empty State */}
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Best Practices Coming Soon
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      We're building a comprehensive library of teaching best practices. 
                      Soon you'll be able to discover, share, and implement proven strategies 
                      from our St. Paul's community.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Community Driven</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Research Based</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Future Features Preview */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="opacity-60">
                  <CardHeader>
                    <CardTitle className="text-sm">Coming Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium mb-2">Teaching Strategies</h4>
                    <p className="text-sm text-muted-foreground">
                      Proven classroom techniques and methodologies
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="opacity-60">
                  <CardHeader>
                    <CardTitle className="text-sm">Coming Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium mb-2">Assessment Methods</h4>
                    <p className="text-sm text-muted-foreground">
                      Innovative approaches to student evaluation
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="opacity-60">
                  <CardHeader>
                    <CardTitle className="text-sm">Coming Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium mb-2">Technology Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Digital tools and educational technology tips
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}