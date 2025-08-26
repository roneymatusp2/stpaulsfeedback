import { LayoutDashboard, User, ImageIcon, BookOpen, FileText, Calendar } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import stPaulsLogo from "@/assets/st-pauls-logo.png";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Your Profile", url: "/dashboard/profile", icon: User },
  { title: "Your Gallery", url: "/dashboard/gallery", icon: ImageIcon },
  { title: "Best Practices", url: "/dashboard/best-practices", icon: BookOpen },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-primary text-white shadow-glow border-0 hover:shadow-glow" 
      : "hover:bg-accent/50 hover:text-accent-foreground text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className="w-72 min-w-72" variant="sidebar">
      <SidebarContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 text-white">
        <div className="p-6 border-b border-slate-700/50">
          <div 
            className="flex items-center gap-4 cursor-pointer hover:bg-white/10 rounded-xl p-3 -m-3 transition-all duration-300 group"
            onClick={() => navigate('/dashboard')}
            title="Go to Dashboard"
          >
            <div className="relative">
              <img src={stPaulsLogo} alt="St. Paul's School" className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-white text-lg truncate group-hover:text-blue-200 transition-colors">St. Paul's</h2>
              <p className="text-xs text-slate-400 font-medium truncate">Teacher Portal</p>
            </div>
          </div>
        </div>

        <SidebarGroup className="px-4 py-6">
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
               {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full rounded-xl transition-all duration-300 hover:shadow-lg">
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        isActive 
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg flex items-center gap-4 py-4 px-4 w-full text-left rounded-xl"
                          : "hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-4 py-4 px-4 w-full text-left rounded-xl transition-all duration-300"
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isActive 
                              ? "bg-white/20 shadow-lg" 
                              : "bg-slate-700/50 group-hover:bg-slate-600/50"
                          }`}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-sm">{item.title}</span>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}