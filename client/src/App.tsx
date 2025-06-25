import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useStateRecovery } from "@/hooks/useStateRecovery";
import ImpersonationToolbar from "@/components/impersonation-toolbar";
import StateRecoveryModal from "@/components/state-recovery-modal";
import ErrorBoundary from "@/components/error-boundary";
import { PageErrorFallback } from "@/components/error-fallbacks";
import { errorReporter } from "@/utils/errorReporting";
import { useState, useEffect } from "react";
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
import CreateUser from "@/pages/create-user";
import UserProfile from "@/pages/user-profile";
import Reports from "@/pages/reports";
import CreatorSpace from "@/pages/creator-space";
import ManageClass from "@/pages/manage-class";
import CoursePlayer from "@/pages/course-player";
import CourseView from "@/pages/course-view";
import ModernNavbar from "@/components/layout/modern-navbar";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { recoverState, clearState, hasRecoverableState } = useStateRecovery();
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<any>(null);

  // Check for recoverable state when user is authenticated
  useEffect(() => {
    if (isAuthenticated && hasRecoverableState && !isLoading) {
      const state = JSON.parse(localStorage.getItem('eduease_app_state') || '{}');
      if (state.timestamp) {
        setRecoveryData(state);
        setShowRecoveryModal(true);
      }
    }
  }, [isAuthenticated, hasRecoverableState, isLoading]);

  const handleRecoverState = async () => {
    const recovered = await recoverState();
    if (recovered) {
      console.log('State recovered successfully');
    }
    setShowRecoveryModal(false);
  };

  const handleDismissRecovery = () => {
    clearState();
    setShowRecoveryModal(false);
  };

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
          {user?.userType === 'system_owner' || user?.id === '43132359' ? (
            <>
              <Route path="/" component={SystemOwnerDashboard} />
              <Route path="/organizations" component={OrganizationsList} />
              <Route path="/organizations/create" component={CreateOrganization} />
              <Route path="/organizations/:id" component={OrganizationManagement} />
              <Route path="/users" component={Users} />
              <Route path="/users/create" component={CreateUser} />
              <Route path="/users/:id" component={UserProfile} />
              <Route path="/system-settings" component={SystemSettings} />
              <Route path="/courses/:id" component={CourseView} />
            </>
          ) : (
            <>
              {/* Organization User Routes */}
              <Route path="/" component={Dashboard} />
              <Route path="/courses" component={ModernCourses} />
              <Route path="/courses/:id" component={CoursePlayer} />
              <Route path="/courses/:id/manage" component={ManageClass} />
              <Route path="/analytics" component={Reports} />
              <Route path="/settings" component={CreatorSpace} />
              <Route path="/courses/:id" component={CourseView} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
        
        {/* State Recovery Modal */}
        <StateRecoveryModal
          isOpen={showRecoveryModal}
          stateData={recoveryData}
          onRecover={handleRecoverState}
          onDismiss={handleDismissRecovery}
        />
      </div>
    </div>
  );
}

function App() {
  // Setup global error handlers
  useEffect(() => {
    errorReporter.setupGlobalHandlers();
  }, []);

  return (
    <ErrorBoundary 
      level="critical" 
      fallback={PageErrorFallback}
      onError={(error, errorInfo) => {
        const report = errorReporter.createErrorReport(
          error,
          'critical',
          { appLevel: true },
          errorInfo.componentStack
        );
        errorReporter.reportError(report);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            <ErrorBoundary level="page" fallback={PageErrorFallback}>
              <Router />
            </ErrorBoundary>
            <ImpersonationToolbar />
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
