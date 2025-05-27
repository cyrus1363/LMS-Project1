import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
// import LanguageSwitcher from "@/components/ui/language-switcher";
import { GraduationCap, Bell, ChevronDown, User, Settings, LogOut, BookOpen, Shield } from "lucide-react";

export default function Navbar() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user } = useAuth();

  const notifications = [
    { id: 1, message: "New assignment available in Data Science", time: "2 hours ago", unread: true },
    { id: 2, message: "Your quiz submission was graded", time: "4 hours ago", unread: true },
    { id: 3, message: "Welcome to the platform!", time: "1 day ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "trainer":
        return "default";
      default:
        return "secondary";
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <GraduationCap className="h-8 w-8 text-primary mr-3" />
              <span className="text-xl font-bold text-gray-900">EduEase</span>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher - Temporarily disabled */}
            {/* <LanguageSwitcher /> */}
            
            {/* Notifications */}
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Notifications</h4>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border ${notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                      >
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    View All Notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt="Profile" />
                    <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <Badge variant={getRoleColor(user?.role || "")} className="text-xs">
                      {user?.role}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {/* Tutorial System - Available to all users with role-based content */}
                <DropdownMenuItem asChild>
                  <Link href="/tutorials" className="w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Learning Hub
                  </Link>
                </DropdownMenuItem>
                
                {/* Master Admin Control Panel - Only for admin and master_admin */}
                {(user?.role === 'admin' || user?.role === 'master_admin') && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin-control-panel" className="w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      Master Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
