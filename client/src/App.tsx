import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ModernCourses from "@/pages/modern-courses";
import SystemOwnerDashboard from "@/pages/system-owner-dashboard";
import OrganizationsList from "@/pages/organizations-list";
import OrganizationManagement from "@/pages/organization-management";
import SystemSettings from "@/pages/system-settings";
import CreateOrganization from "@/pages/create-organization";
import Users from "@/pages/users";
import Reports from "@/pages/reports";
import CreatorSpace from "@/pages/creator-space";
import ManageClass from "@/pages/manage-class";
import CoursePlayer from "@/pages/course-player";
import ModernNavbar from "@/components/layout/modern-navbar";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Modern LMS interface with clean navigation
  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />
      <div className="pt-16">
        <Switch>
          {/* System Owner Routes */}
          {user?.userType === 'system_owner' ? (
            <>
              <Route path="/" component={SystemOwnerDashboard} />
              <Route path="/organizations" component={OrganizationsList} />
              <Route path="/organizations/:id" component={OrganizationManagement} />
              <Route path="/organizations/create" component={CreateOrganization} />
              <Route path="/system-settings" component={SystemSettings} />
            </>
          ) : (
            <>
              {/* Organization User Routes */}
              <Route path="/" component={Dashboard} />
              <Route path="/courses" component={ModernCourses} />
              <Route path="/courses/:id" component={CoursePlayer} />
              <Route path="/courses/:id/manage" component={ManageClass} />
              <Route path="/users" component={Users} />
              <Route path="/analytics" component={Reports} />
              <Route path="/settings" component={CreatorSpace} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
