import React, { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
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
      <Header />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        <main className="flex-1 overflow-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/meetings" component={Meetings} />
            <Route path="/topics" component={Topics} />
            <Route path="/decisions" component={Decisions} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/neighborhoods" component={Neighborhoods} />
            <Route path="/projects/housing" component={HousingProject} />
            <Route path="/projects/transportation" component={TransportationProject} />
            <Route path="/projects/parks" component={ParksProject} />
            <Route path="/projects/planning" component={PlanningProject} />
            <Route path="/data-ingestion" component={DataIngestion} />
            <Route path="/alerts" component={Alerts} />
            <Route path="/saved" component={Saved} />
            <Route path="/settings" component={Settings} />
            {/* Fallback to 404 */}
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
