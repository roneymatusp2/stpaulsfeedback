import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CreateObservationCard } from "@/components/dashboard/CreateObservationCard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  Target, 
  LayoutDashboard, 
  TrendingUp,
  Award,
  Calendar,
  Bell
} from "lucide-react";
import MrBishopFab from "@/components/teacher/MrBishopFab";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <DashboardHeader />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading dashboard data...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-8 space-y-8 relative overflow-hidden">
            {/* Modern background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
              {/* Modern Header */}
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Welcome back, {currentUser?.name?.split(' ')[0] || 'Teacher'}
                    </h1>
                    <p className="text-slate-600 text-lg">Ready to make an impact on teaching excellence?</p>
                  </div>
                </div>
              </div>
              
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CreateObservationCard />
                <DashboardStats />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Recent Observations</h3>
                        <p className="text-sm text-slate-600">View your latest feedback</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Learning Resources</h3>
                        <p className="text-sm text-slate-600">Access teaching materials</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Development Goals</h3>
                        <p className="text-sm text-slate-600">Track your progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Recent Activity */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">Observation completed</p>
                          <p className="text-xs text-slate-600">Mathematics • Key Stage 5 • Today</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">Self-assessment submitted</p>
                          <p className="text-xs text-slate-600">Teaching Standards • Yesterday</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">Learning walk scheduled</p>
                          <p className="text-xs text-slate-600">Quality of instruction • Tomorrow</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      Your Performance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Teaching Quality</span>
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Student Engagement</span>
                        <Badge className="bg-blue-100 text-blue-800">Very Good</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Assessment Methods</span>
                        <Badge className="bg-purple-100 text-purple-800">Good</Badge>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-slate-700">Latest Achievement</span>
                        </div>
                        <p className="text-xs text-slate-600 bg-amber-50 p-2 rounded">
                          Outstanding feedback for innovative use of technology in Mathematics lessons
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Events */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-600" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Peer Observation</span>
                      </div>
                      <p className="text-xs text-orange-800">Tomorrow, 10:00 AM</p>
                      <p className="text-xs text-orange-700 mt-1">Observer: Dr. Louise Simpson</p>
                    </div>
                    
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Development Meeting</span>
                      </div>
                      <p className="text-xs text-blue-800">Friday, 2:00 PM</p>
                      <p className="text-xs text-blue-700 mt-1">Focus: Assessment strategies</p>
                    </div>
                    
                    <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Training Workshop</span>
                      </div>
                      <p className="text-xs text-purple-800">Next Monday, 3:30 PM</p>
                      <p className="text-xs text-purple-700 mt-1">Digital learning tools</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <MrBishopFab />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}