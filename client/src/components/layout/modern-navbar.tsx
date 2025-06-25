import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  BookOpen,
  Users,
  BarChart3,
  Building2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";

export default function ModernNavbar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const getNavItems = () => {
    if (user?.userType === 'system_owner') {
      return [
        { path: "/", label: "Dashboard", icon: BarChart3 },
        { path: "/organizations", label: "Organizations", icon: Building2 },
        { path: "/users", label: "Users", icon: Users },
        { path: "/system-settings", label: "Settings", icon: Settings },
      ];
    }

    return [
      { path: "/", label: "Dashboard", icon: BarChart3 },
      { path: "/courses", label: "Courses", icon: BookOpen },
      { path: "/users", label: "People", icon: Users },
      { path: "/analytics", label: "Analytics", icon: BarChart3 },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                {user?.userType === 'system_owner' ? 'EduEase Admin' : 'EduEase LMS'}
              </h1>
            </div>
            
            {/* Navigation Items */}
            <div className="hidden md:block ml-10">
              <div className="flex space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <Link key={item.path} href={item.path}>
                      <button
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift ${
                          isActive
                            ? 'text-blue-600 bg-blue-50 shadow-sm'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'animate-pulse-custom' : ''}`} />
                        {item.label}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search & User Menu */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 w-64"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover-scale transition-all duration-200">
              <Bell className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 animate-bounce-custom">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover-scale transition-all duration-200">
                  <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-blue-200 transition-all duration-200">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} className="transition-all duration-200" />
                    <AvatarFallback className="transition-all duration-200 hover:bg-blue-50">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge variant="outline" className="w-fit text-xs capitalize">
                      {user?.userType?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}