import React from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import Dashboard from "@/pages/dashboard";
import Meetings from "@/pages/meetings";
import Topics from "@/pages/topics";
import Decisions from "@/pages/decisions";
import DataIngestion from "@/pages/data-ingestion";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/meetings" component={Meetings} />
          <Route path="/topics" component={Topics} />
          <Route path="/decisions" component={Decisions} />
          <Route path="/data-ingestion" component={DataIngestion} />
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
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
