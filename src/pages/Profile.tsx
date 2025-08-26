import { useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { currentUser, loading } = useAuth();

  const initials = useMemo(() => {
    const name = currentUser?.name || "";
    const parts = name.split(" ").filter(Boolean);
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : (parts[0]?.[0] || "U").toUpperCase();
  }, [currentUser]);

  const subjects = currentUser?.subjects || [];

  const getStageForSubject = (subj: string): string => {
    const s = subj.toLowerCase();
    if (s.includes("ib")) return "Key Stage 5";
    if (s.includes("igcse")) return "Key Stage 4";
    if (s.includes("ks3")) return "Key Stage 3";
    return currentUser?.key_stages?.[0] || "All Levels";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-8">Your Profile</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary-foreground text-2xl font-bold">{initials}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">{currentUser?.name || 'User'}</h2>
                      <p className="text-muted-foreground mb-4">{currentUser?.title || 'Teacher'}</p>
                      <Badge variant="secondary">{currentUser?.department || 'Department'}</Badge>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Teaching Subjects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-muted-foreground">Loading subjects…</div>
                      ) : (
                        <div className="space-y-2">
                          {subjects.length > 0 ? (
                            subjects.map((s, idx) => (
                              <div key={`${s}-${idx}`} className="flex items-center justify-between">
                                <span>{s}</span>
                                <Badge>{getStageForSubject(s)}</Badge>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center justify-between">
                              <span>{currentUser?.department ? `${currentUser.department} teaching` : 'Teaching Allocation'}</span>
                              <Badge>{currentUser?.key_stages?.[0] || 'All Levels'}</Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Professional Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-foreground">Last Login:</span>
                          <p className="text-muted-foreground">20 Aug 2025</p>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Department:</span>
                          <p className="text-muted-foreground">{currentUser?.department || '—'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Employee ID:</span>
                          <p className="text-muted-foreground">SP2025-MAT-001</p>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Years at School:</span>
                          <p className="text-muted-foreground">5 years</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Accessibility Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Toggle dyslexic friendly font</span>
                        <Badge variant="outline">Available</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Please contact your school system administrator if you wish to make any changes to your profile.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}