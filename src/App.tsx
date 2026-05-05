import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgressProvider } from "@/context/ProgressContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import SubjectPage from "@/pages/SubjectPage";
import LabPage from "@/pages/LabPage";
import RevisionPage from "@/pages/RevisionPage";
import ProfilePage from "@/pages/ProfilePage";
import LecturesPage from "@/pages/LecturesPage";
import PlannerPage from "@/pages/PlannerPage";
import PomodoroPage from "@/pages/PomodoroPage";
import PYQPage from "@/pages/PYQPage";
import SyllabusPage from "@/pages/SyllabusPage";
import NoticesPage from "@/pages/NoticesPage";
import ChatbotPage from "@/pages/ChatbotPage";
import QuizPage from "@/pages/QuizPage";
import NotesPage from "@/pages/NotesPage";
import ImportantQuestionsPage from "@/pages/ImportantQuestionsPage";
import BacklogPlannerPage from "@/pages/BacklogPlannerPage";
import DoubtHubPage from "@/pages/DoubtHubPage";
import TestSeriesPage from "@/pages/TestSeriesPage";
import AuthPage from "@/pages/AuthPage";
import OnboardingPage from "@/pages/OnboardingPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setProfileLoaded(true); return; }
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { setProfile(data); setProfileLoaded(true); });
  }, [user]);

  if (loading || (user && !profileLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (!profile?.onboarding_completed) {
    return <OnboardingPage initial={profile} onComplete={() => {
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => setProfile(data));
    }} />;
  }

  return (
    <ProgressProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subject/:id" element={<SubjectPage />} />
          <Route path="/lab/:id" element={<LabPage />} />
          <Route path="/revision" element={<RevisionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/lectures" element={<LecturesPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
          <Route path="/pyq" element={<PYQPage />} />
          <Route path="/syllabus" element={<SyllabusPage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/important-questions" element={<ImportantQuestionsPage />} />
          <Route path="/backlog-planner" element={<BacklogPlannerPage />} />
          <Route path="/doubt-hub" element={<DoubtHubPage />} />
          <Route path="/test-series" element={<TestSeriesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </ProgressProvider>
  );
}
function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthGuard />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
