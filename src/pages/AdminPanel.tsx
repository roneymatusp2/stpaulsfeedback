import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Shield, Users, FileText, Settings, BarChart3, Database, Lock, Target, ArrowLeft, Bot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import SelfAssessmentManagement from '@/components/admin/SelfAssessmentManagement';
import Analytics from '@/pages/Analytics';
import FeedbackAI from '@/components/FeedbackAI';
import AdminAIFab from '@/components/admin/AdminAIFab';

const AdminPanel = () => {
  const { isAdmin, currentUser, loading } = useAuth();
  const [activeView, setActiveView] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sps-ruby"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const adminFeatures = [
    {
      title: "Feedback AI Assistant",
      description: "AI-powered analysis of observation data with intelligent insights and report generation",
      icon: Bot,
      color: "bg-cyan-500",
      comingSoon: false,
      action: () => setActiveView('feedback-ai')
    },
    {
      title: "User Management",
      description: "Manage teacher accounts, roles, and permissions",
      icon: Users,
      color: "bg-blue-500",
      comingSoon: false
    },
    {
      title: "Advanced Analytics",
      description: "Comprehensive observation analytics with detailed insights and trends",
      icon: BarChart3,
      color: "bg-green-500",
      comingSoon: false,
      action: () => setActiveView('analytics')
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings and preferences",
      icon: Settings,
      color: "bg-purple-500",
      comingSoon: false
    },
    {
      title: "Template Management",
      description: "Create and manage observation templates",
      icon: FileText,
      color: "bg-orange-500",
      comingSoon: false
    },
    {
      title: "Self-Assessment Management",
      description: "Manage observation types, key stages, and subjects",
      icon: Target,
      color: "bg-indigo-500",
      comingSoon: false,
      action: () => setActiveView('self-assessment')
    },
    {
      title: "Database Management",
      description: "Direct database access and maintenance tools",
      icon: Database,
      color: "bg-red-500",
      comingSoon: true
    },
    {
      title: "Security Audit",
      description: "Review system access logs and security events",
      icon: Lock,
      color: "bg-gray-500",
      comingSoon: true
    }
  ];

  // Render specific management view
  if (activeView === 'self-assessment') {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <DashboardHeader />
            <div className="flex-1 p-6 space-y-6">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setActiveView(null)}
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Admin Panel
                  </Button>
                </div>
                <SelfAssessmentManagement />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Render Analytics view
  if (activeView === 'analytics') {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <DashboardHeader />
            <div className="flex-1 p-6 space-y-6">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setActiveView(null)}
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Admin Panel
                  </Button>
                </div>
                <Analytics />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Render Feedback AI view
  if (activeView === 'feedback-ai') {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <DashboardHeader />
            <div className="flex-1 p-6 space-y-6">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setActiveView(null)}
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Admin Panel
                  </Button>
                  <div className="flex items-center gap-3 mb-4">
                    <Bot className="h-6 w-6 text-cyan-600" />
                    <h2 className="text-2xl font-bold text-foreground">Educational Feedback AI Assistant</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Analyse observation data, generate comprehensive reports, and receive intelligent insights about teaching performance.
                  </p>
                </div>
                <div className="h-[calc(100vh-300px)]">
                  <FeedbackAI className="h-full" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6 space-y-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Shield className="h-8 w-8 text-sps-ruby" />
                    Admin Panel
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Welcome, {currentUser?.name}. You have administrative access to the system.
                  </p>
                </div>
                <Badge variant="outline" className="bg-sps-ruby/10 border-sps-ruby text-sps-ruby">
                  Administrator
                </Badge>
              </div>

              {/* Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Teachers</p>
                        <p className="text-2xl font-bold">76</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Admins</p>
                        <p className="text-2xl font-bold">7</p>
                      </div>
                      <Shield className="h-8 w-8 text-sps-ruby" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Observations</p>
                        <p className="text-2xl font-bold">0</p>
                      </div>
                      <FileText className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">System Status</p>
                        <p className="text-lg font-semibold text-green-600">Active</p>
                      </div>
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Admin Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminFeatures.map((feature, index) => (
                  <Card 
                    key={index} 
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                      feature.comingSoon ? 'opacity-70' : 'hover:scale-105 cursor-pointer'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${feature.color} bg-opacity-10`}>
                          <feature.icon className={`h-6 w-6`} style={{ color: feature.color.replace('bg-', '').replace('-500', '') }} />
                        </div>
                        {feature.comingSoon && (
                          <Badge variant="secondary" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {feature.description}
                      </p>
                      <Button 
                        variant={feature.comingSoon ? "ghost" : "default"}
                        size="sm"
                        disabled={feature.comingSoon}
                        className="w-full"
                        onClick={feature.action}
                      >
                        {feature.comingSoon ? 'Coming Soon' : 'Access'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* System Information */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-sps-ruby" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Database Status</h4>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Connected to Supabase</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">All migrations applied</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Access Control</h4>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">RLS policies active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Admin authentication enabled</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <AdminAIFab />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;