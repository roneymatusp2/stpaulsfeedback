import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User } from "lucide-react";
import React from "react";
import PreferencesDialog from "@/components/PreferencesDialog";
import { useNavigate } from "react-router-dom";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileSettings = () => {
    navigate('/dashboard/profile');
  };

  const [showPreferences, setShowPreferences] = React.useState(false);
  const handlePreferences = () => setShowPreferences(true);

  return (
    <header className="h-24 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 shadow-sm relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50"></div>
      
      <div className="flex items-center gap-6 relative z-10">
        <SidebarTrigger className="hover:bg-blue-50 rounded-xl p-3 transition-all duration-300 hover:shadow-md" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <div className="h-6 w-px bg-slate-200"></div>
          </div>
          <div className="text-sm">
            <span className="font-semibold text-slate-800">St. Paul's School</span>
            <span className="mx-3 text-slate-400">•</span>
            <span className="text-slate-600">Teacher Development Platform</span>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-slate-700 px-4 py-2 rounded-full border border-blue-200/50 text-xs font-medium">
              Academic Year: 2025
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 relative z-10">
        <NotificationDropdown />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-4 px-4 py-3 h-auto hover:bg-blue-50 rounded-xl transition-all duration-300 hover:shadow-md">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                {isAdmin && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-slate-800">
                  {currentUser?.name || 'Guest User'}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{currentUser?.title || currentUser?.department || 'St. Paul\'s School'}</span>
                  {isAdmin && (
                    <Badge variant="outline" className="text-xs border-red-200 text-red-600 bg-red-50">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm border border-border/50 shadow-elegant">
            <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer hover:bg-accent/50" onClick={handleProfileSettings}>
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-accent/50" onClick={handlePreferences}>
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <PreferencesDialog open={showPreferences} onOpenChange={setShowPreferences} />
      </div>
    </header>
  );
}