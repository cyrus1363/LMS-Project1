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
import Users from "@/pages/users";
import Content from "@/pages/content";
import Reports from "@/pages/reports";
import RoleplayPage from "@/pages/roleplay";
import CPETracker from "@/pages/cpe-tracker";
import MasterAdminPanel from "@/pages/master-admin";
import TutorialsPage from "@/pages/tutorials";
import TierManagementPage from "@/pages/tier-management";
import HipaaCompliancePage from "@/pages/hipaa-compliance";
import CreatorSpace from "@/pages/creator-space";
import ManageClass from "@/pages/manage-class";
import CoursePlayer from "@/pages/course-player";

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

  // System Owner gets a completely different interface
  if (user?.userType === 'system_owner') {
    return (
      <Switch>
        <Route path="/" component={SystemOwnerDashboard} />
        <Route path="/organizations" component={SystemOwnerDashboard} />
        <Route path="/system-settings" component={SystemOwnerDashboard} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Clean modern interface for all organization users
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/courses" component={ModernCourses} />
      <Route path="/courses/:id" component={CoursePlayer} />
      <Route path="/courses/:id/manage" component={ManageClass} />
      <Route path="/users" component={Users} />
      <Route path="/analytics" component={Reports} />
      <Route path="/settings" component={CreatorSpace} />
      <Route component={NotFound} />
    </Switch>
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
