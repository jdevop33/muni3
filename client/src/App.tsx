import { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Meetings from "@/pages/meetings";
import Topics from "@/pages/topics";
import Decisions from "@/pages/decisions";
import DataIngestion from "@/pages/data-ingestion";
import Analytics from "@/pages/analytics";
import Neighborhoods from "@/pages/neighborhoods";
import HousingProject from "@/pages/projects/housing";
import TransportationProject from "@/pages/projects/transportation";
import ParksProject from "@/pages/projects/parks";
import PlanningProject from "@/pages/projects/planning";
import Alerts from "@/pages/alerts";
import Saved from "@/pages/saved";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/auth">
          <AuthPage />
        </Route>
        
        <Route>
          {/* All other routes have the standard layout with header and sidebar */}
          <Header onToggleSidebar={handleToggleSidebar} />
          <div className="flex min-h-[calc(100vh-64px)]">
            <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
            <main className="flex-1 overflow-auto">
              <Switch>
                <ProtectedRoute path="/" component={() => <Dashboard />} />
                <ProtectedRoute path="/meetings" component={() => <Meetings />} />
                <ProtectedRoute path="/topics" component={() => <Topics />} />
                <ProtectedRoute path="/decisions" component={() => <Decisions />} />
                <ProtectedRoute path="/analytics" component={() => <Analytics />} />
                <ProtectedRoute path="/neighborhoods" component={() => <Neighborhoods />} />
                <ProtectedRoute path="/projects/housing" component={() => <HousingProject />} />
                <ProtectedRoute path="/projects/transportation" component={() => <TransportationProject />} />
                <ProtectedRoute path="/projects/parks" component={() => <ParksProject />} />
                <ProtectedRoute path="/projects/planning" component={() => <PlanningProject />} />
                <ProtectedRoute 
                  path="/data-ingestion" 
                  component={() => <DataIngestion />} 
                  requiredRoles={["admin", "staff"]} 
                />
                <ProtectedRoute path="/alerts" component={() => <Alerts />} />
                <ProtectedRoute path="/saved" component={() => <Saved />} />
                <ProtectedRoute path="/settings" component={() => <Settings />} />
                {/* Fallback to 404 */}
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
