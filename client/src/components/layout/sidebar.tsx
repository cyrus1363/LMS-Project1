import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Plus,
  UserPlus,
  MessageCircle,
  GraduationCap
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "master_admin":
        return "destructive";
      case "admin":
        return "destructive";
      case "facilitator":
        return "default";
      case "student":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "master_admin":
        return "Master Admin";
      case "admin":
        return "Admin";
      case "facilitator":
        return "Facilitator";
      case "student":
        return "Student";
      default:
        return "User";
    }
  };

  const navigationItems = [
    {
      href: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["master_admin", "admin", "facilitator", "student"]
    },
    {
      href: "/classes",
      icon: BookOpen,
      label: "Classes",
      roles: ["master_admin", "admin", "facilitator", "student"]
    },
    {
      href: "/users",
      icon: Users,
      label: "User Management",
      roles: ["master_admin", "admin"]
    },
    {
      href: "/content",
      icon: FileText,
      label: "Content Library",
      roles: ["admin", "trainer"]
    },
    {
      href: "/reports",
      icon: BarChart3,
      label: "Analytics & Reports",
      roles: ["admin", "trainer"]
    },
    {
      href: "/roleplay",
      icon: MessageCircle,
      label: "AI Roleplay Coach",
      roles: ["admin", "trainer", "student"]
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
      roles: ["admin", "trainer", "student"]
    }
  ];

  const quickActions = [
    {
      icon: Plus,
      label: "Create New Class",
      roles: ["admin", "trainer"],
      onClick: () => {
        // This would trigger class creation modal
        console.log("Create class");
      }
    },
    {
      icon: UserPlus,
      label: "Add User",
      roles: ["admin"],
      onClick: () => {
        // This would trigger user creation modal
        console.log("Add user");
      }
    }
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  const hasAccess = (roles: string[]) => {
    return roles.includes(user?.role || "student");
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 fixed h-full overflow-y-auto">
      <div className="p-4">
        {/* Role Badge */}
        <div className="mb-6">
          <Badge variant={getRoleColor(user?.role || "")} className="w-full justify-center py-2">
            <Users className="w-4 h-4 mr-2" />
{getRoleDisplayName(user?.role || "")}
          </Badge>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navigationItems
            .filter(item => hasAccess(item.roles))
            .map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActiveRoute(item.href)
                      ? "text-gray-900 bg-primary/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActiveRoute(item.href) ? "text-primary" : ""
                  }`} />
                  {item.label}
                </Link>
            ))}
        </nav>

        {/* Quick Actions */}
        {quickActions.some(action => hasAccess(action.roles)) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions
                .filter(action => hasAccess(action.roles))
                .map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={action.onClick}
                  >
                    <action.icon className="mr-3 h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <img
              src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
