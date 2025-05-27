import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Classes from "@/pages/classes";
import Users from "@/pages/users";
import Content from "@/pages/content";
import Reports from "@/pages/reports";
import RoleplayPage from "@/pages/roleplay";
import CPETracker from "@/pages/cpe-tracker";
import MasterAdminPanel from "@/pages/master-admin";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex h-screen pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/classes" component={Classes} />
            <Route path="/users" component={Users} />
            <Route path="/content" component={Content} />
            <Route path="/reports" component={Reports} />
            <Route path="/roleplay" component={RoleplayPage} />
            <Route path="/cpe-tracker" component={CPETracker} />
            <Route path="/admin-control-panel" component={MasterAdminPanel} />
            <Route component={NotFound} />
          </Switch>
        </main>
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
