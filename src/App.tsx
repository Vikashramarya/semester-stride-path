import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgressProvider } from "@/context/ProgressContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import SubjectPage from "@/pages/SubjectPage";
import LabPage from "@/pages/LabPage";
import RevisionPage from "@/pages/RevisionPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ProgressProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/subject/:id" element={<SubjectPage />} />
              <Route path="/lab/:id" element={<LabPage />} />
              <Route path="/revision" element={<RevisionPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ProgressProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
