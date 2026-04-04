import { useProgress } from "@/context/ProgressContext";
import sankalpLogo from "@/assets/sankalp-logo.png";
import { getSemester } from "@/data/syllabus";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Clock, AlertTriangle, ChevronRight, FlaskConical,
  TrendingUp, Video, Target, Flame, CalendarCheck, Timer, FileQuestion, CheckCircle2,
  Star, MessageCircle, FlaskRound, Brain,
} from "lucide-react";
import { useMemo, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";

const CHART_COLORS = [
  "hsl(152, 55%, 42%)", "hsl(217, 71%, 53%)", "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)", "hsl(270, 50%, 55%)", "hsl(180, 50%, 42%)",
];

const MOTIVATIONAL_MESSAGES = [
  "Consistency beats intensity. Keep going! 💪",
  "Every topic you finish is a step closer to success 🎯",
  "Small daily progress adds up to big results 🚀",
  "You're building a stronger future, one topic at a time 📚",
  "Focus on progress, not perfection ✨",
];

interface TodayTask {
  id: string;
  subject: string;
  topic: string;
  is_completed: boolean;
  duration_minutes: number;
}

export default function Dashboard() {
  const { semester, completedTopics, examDate, userName } = useProgress();
  const { user } = useAuth();
  const navigate = useNavigate();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];
  const labs = semData?.subjects.filter(s => s.isLab) || [];

  const [streak, setStreak] = useState(0);
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
  const [todayMinutes, setTodayMinutes] = useState(0);

  const motivationalMsg = useMemo(
    () => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)],
    []
  );

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    // Fetch today's tasks
    const { data: tasks } = await supabase
      .from("study_tasks")
      .select("id, subject, topic, is_completed, duration_minutes")
      .eq("user_id", user.id)
      .eq("task_date", today)
      .order("created_at");
    setTodayTasks((tasks as TodayTask[]) || []);

    // Fetch today's study minutes
    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("duration_minutes")
      .eq("user_id", user.id)
      .eq("session_date", today);
    setTodayMinutes(sessions?.reduce((s, r) => s + r.duration_minutes, 0) || 0);

    // Calculate streak - count consecutive days with completed tasks or sessions
    const { data: taskDates } = await supabase
      .from("study_tasks")
      .select("task_date")
      .eq("user_id", user.id)
      .eq("is_completed", true)
      .order("task_date", { ascending: false });

    const { data: sessionDates } = await supabase
      .from("study_sessions")
      .select("session_date")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false });

    const allDates = new Set([
      ...(taskDates?.map(t => t.task_date) || []),
      ...(sessionDates?.map(s => s.session_date) || []),
    ]);

    let streakCount = 0;
    const d = new Date();
    while (true) {
      const dateStr = d.toISOString().split("T")[0];
      if (allDates.has(dateStr)) {
        streakCount++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(streakCount);
  }, [user]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const daysLeft = useMemo(() => {
    const diff = new Date(examDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [examDate]);

  const subjectStats = useMemo(() => {
    return subjects.map(sub => {
      const allTopics = sub.units.flatMap(u => u.topics);
      const completed = allTopics.filter(t => completedTopics[t.id]).length;
      const total = allTopics.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const highWeightageUnits = sub.units.filter(u => u.weightage >= 25 && u.topics.some(t => !completedTopics[t.id]));
      return { ...sub, progress, completed, total, highWeightageUnits };
    });
  }, [subjects, completedTopics]);

  const overallProgress = useMemo(() => {
    const totals = subjectStats.reduce((acc, s) => ({ c: acc.c + s.completed, t: acc.t + s.total }), { c: 0, t: 0 });
    return totals.t > 0 ? Math.round((totals.c / totals.t) * 100) : 0;
  }, [subjectStats]);

  const radarData = useMemo(() => {
    return subjectStats.map(s => ({
      subject: s.name.split(" ").map(w => w[0]).join("").slice(0, 4),
      progress: s.progress,
    }));
  }, [subjectStats]);

  const urgencyColor = daysLeft <= 7 ? "text-destructive" : daysLeft <= 14 ? "text-sankalp-amber" : "text-primary";
  const todayCompleted = todayTasks.filter(t => t.is_completed).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl sankalp-gradient p-6 md:p-8 text-primary-foreground animate-fade-in-up">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={sankalpLogo} alt="Sankalp" className="h-14 w-14 rounded-xl object-contain bg-white/90 p-1 shadow-sm" />
            <div>
            <p className="text-sm opacity-80 mb-1">Semester {semester} · B.Tech CSE</p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-sm opacity-80 mt-2">{motivationalMsg}</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold tabular-nums">{overallProgress}%</p>
              <p className="text-xs opacity-70">syllabus</p>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20" />
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Flame className="h-5 w-5 text-amber-300" />
                <p className="text-3xl md:text-4xl font-bold tabular-nums">{streak}</p>
              </div>
              <p className="text-xs opacity-70">day streak</p>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold tabular-nums">{daysLeft}</p>
              <p className="text-xs opacity-70">days left</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        {[
          { icon: BookOpen, label: "Subjects", value: subjects.length, sub: `${labs.length} labs`, color: "text-primary" },
          { icon: Target, label: "Topics Done", value: subjectStats.reduce((a, s) => a + s.completed, 0), sub: `of ${subjectStats.reduce((a, s) => a + s.total, 0)}`, color: "text-sankalp-green" },
          { icon: Clock, label: "Exam In", value: daysLeft, sub: daysLeft === 1 ? "day" : "days", color: urgencyColor },
          { icon: Timer, label: "Studied Today", value: todayMinutes, sub: "minutes", color: "text-sankalp-blue" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's tasks + Radar */}
      <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        {/* Today's tasks */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary" />
                Today's Tasks
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {todayCompleted}/{todayTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTasks.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No tasks for today</p>
                <button
                  onClick={() => navigate("/planner")}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Add tasks in Planner →
                </button>
              </div>
            ) : (
              todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <CheckCircle2 className={`h-4 w-4 shrink-0 ${task.is_completed ? "text-primary" : "text-muted-foreground/30"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.topic}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{task.subject}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{task.duration_minutes}m</span>
                </div>
              ))
            )}
            {todayTasks.length > 5 && (
              <button onClick={() => navigate("/planner")} className="text-xs text-primary hover:underline w-full text-center">
                View all {todayTasks.length} tasks →
              </button>
            )}
          </CardContent>
        </Card>

        {/* Radar chart */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Subject Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Radar dataKey="progress" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
                No subjects in this semester
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "240ms" }}>
        {[
          { label: "Study Planner", icon: CalendarCheck, path: "/planner", desc: "Plan daily tasks", bg: "bg-primary/10", color: "text-primary" },
          { label: "Pomodoro Timer", icon: Timer, path: "/pomodoro", desc: "Focus sessions", bg: "bg-sankalp-blue-light", color: "text-sankalp-blue" },
          { label: "Important Q's", icon: Star, path: "/important-questions", desc: "High probability", bg: "bg-sankalp-amber-light", color: "text-sankalp-amber" },
          { label: "Test Series", icon: FlaskRound, path: "/test-series", desc: "Mock tests", bg: "bg-sankalp-red-light", color: "text-sankalp-red" },
          { label: "Backlog Mode", icon: Flame, path: "/backlog-planner", desc: "Crash study plan", bg: "bg-destructive/10", color: "text-destructive" },
          { label: "Doubt Hub", icon: MessageCircle, path: "/doubt-hub", desc: "Ask & answer", bg: "bg-sankalp-blue-light", color: "text-sankalp-blue" },
          { label: "AI Chatbot", icon: Brain, path: "/chatbot", desc: "Study assistant", bg: "bg-primary/10", color: "text-primary" },
          { label: "PYQ Papers", icon: FileQuestion, path: "/pyq", desc: "Past papers", bg: "bg-sankalp-amber-light", color: "text-sankalp-amber" },
        ].map((item, i) => (
          <Card
            key={item.path}
            className="shadow-sm border-0 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subject cards */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "320ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Subjects</h2>
          <Badge variant="secondary" className="text-xs">{subjects.length} subjects</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {subjectStats.map((sub, i) => (
            <Card
              key={sub.id}
              className="shadow-sm cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] border-0 group"
              onClick={() => navigate(`/subject/${sub.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] + "20", color: CHART_COLORS[i % CHART_COLORS.length] }}>
                        {sub.code.slice(-2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{sub.name}</p>
                        <p className="text-[11px] text-muted-foreground">{sub.code}</p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{sub.completed}/{sub.total} topics</span>
                    <span className="font-semibold">{sub.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${sub.progress}%`,
                        background: sub.progress === 100 ? "hsl(var(--sankalp-green))" : CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
                {sub.highWeightageUnits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {sub.highWeightageUnits.slice(0, 2).map(u => (
                      <Badge key={u.id} variant="outline" className="text-[10px] bg-sankalp-amber-light text-sankalp-amber border-0 font-medium">
                        ⚡ U{u.id.slice(-1)} ({u.weightage}%)
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Labs */}
      {labs.length > 0 && (
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            Lab Practicals
          </h2>
          <div className="grid gap-2 md:grid-cols-3">
            {labs.map(lab => (
              <Card
                key={lab.id}
                className="shadow-sm cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98] border-0"
                onClick={() => navigate(`/lab/${lab.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FlaskConical className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lab.name}</p>
                    <p className="text-[11px] text-muted-foreground">{lab.labPrograms?.length || 0} programs</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
