import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Upload, FileText, Video, Camera } from "lucide-react";

export default function Gallery() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">Your Gallery</h1>
                <Button disabled>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Item
                </Button>
              </div>

              {/* Empty State */}
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Your Gallery is Empty
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Start building your professional portfolio by uploading photos, videos, 
                      documents, and teaching resources. Share your classroom moments and 
                      educational materials with the St. Paul's community.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        <span>Photos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span>Videos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Documents</span>
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
                    <h4 className="font-medium mb-2">Photo Albums</h4>
                    <p className="text-sm text-muted-foreground">
                      Organize classroom photos and workshop images
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="opacity-60">
                  <CardHeader>
                    <CardTitle className="text-sm">Coming Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium mb-2">Video Library</h4>
                    <p className="text-sm text-muted-foreground">
                      Store and share educational videos and recordings
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="opacity-60">
                  <CardHeader>
                    <CardTitle className="text-sm">Coming Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium mb-2">Resource Center</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload and organize teaching materials and documents
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