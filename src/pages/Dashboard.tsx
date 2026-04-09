import { useProgress } from "@/context/ProgressContext";
import sankalpLogo from "@/assets/sankalp-logo.png";
import { getSemester } from "@/data/syllabus";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ProgressRing";
import { Sparkline } from "@/components/Sparkline";
import { FloatingAICoach } from "@/components/FloatingAICoach";
import {
  BookOpen, Clock, ChevronRight, FlaskConical,
  TrendingUp, TrendingDown, Target, Flame, CalendarCheck, Timer, FileQuestion,
  CheckCircle2, Star, MessageCircle, FlaskRound, Brain, Zap, Trophy, Award,
  ArrowRight, Play, Sparkles, BarChart3, GraduationCap,
} from "lucide-react";
import { useMemo, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  AreaChart, Area,
} from "recharts";

const CHART_COLORS = [
  "hsl(230, 80%, 60%)", "hsl(185, 72%, 45%)", "hsl(38, 92%, 50%)",
  "hsl(152, 55%, 42%)", "hsl(270, 50%, 55%)", "hsl(0, 72%, 51%)",
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil? 🌙";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Night owl mode 🦉";
}

function getAIInsight(progress: number, streak: number, daysLeft: number, weakSubjects: string[]): string {
  if (daysLeft <= 7) return `⚠️ Only ${daysLeft} days left! Focus on high-weightage units and do rapid revision.`;
  if (streak >= 7) return `🔥 Amazing ${streak}-day streak! Your consistency is building real momentum.`;
  if (progress >= 80) return "🚀 You're almost there! Focus on weak areas for maximum impact.";
  if (progress >= 50) return "📈 Great halfway mark! Prioritize revision of completed topics while covering new ones.";
  if (weakSubjects.length > 0) return `💡 Focus on ${weakSubjects[0]} — it has the most uncovered high-weightage topics.`;
  if (streak === 0) return "🎯 Start today! Even 25 minutes of focused study builds momentum.";
  return "📚 Keep the momentum going. Consistent daily effort beats cramming.";
}

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
  const [weeklyData, setWeeklyData] = useState<{ day: string; minutes: number }[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    const { data: tasks } = await supabase
      .from("study_tasks")
      .select("id, subject, topic, is_completed, duration_minutes")
      .eq("user_id", user.id)
      .eq("task_date", today)
      .order("created_at");
    setTodayTasks((tasks as TodayTask[]) || []);

    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("duration_minutes, session_date")
      .eq("user_id", user.id)
      .gte("session_date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0])
      .order("session_date");

    const todaySessions = sessions?.filter(s => s.session_date === today) || [];
    setTodayMinutes(todaySessions.reduce((s, r) => s + r.duration_minutes, 0));

    // Weekly chart data
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekly: { day: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const mins = sessions?.filter(s => s.session_date === dateStr).reduce((a, s) => a + s.duration_minutes, 0) || 0;
      weekly.push({ day: dayNames[d.getDay()], minutes: mins });
    }
    setWeeklyData(weekly);

    // Streak
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
      if (allDates.has(dateStr)) { streakCount++; d.setDate(d.getDate() - 1); }
      else break;
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
      const nextTopic = allTopics.find(t => !completedTopics[t.id]);
      return { ...sub, progress, completed, total, highWeightageUnits, nextTopic };
    });
  }, [subjects, completedTopics]);

  const overallProgress = useMemo(() => {
    const totals = subjectStats.reduce((acc, s) => ({ c: acc.c + s.completed, t: acc.t + s.total }), { c: 0, t: 0 });
    return totals.t > 0 ? Math.round((totals.c / totals.t) * 100) : 0;
  }, [subjectStats]);

  const barData = useMemo(() => {
    return subjectStats.map((s, i) => ({
      name: s.name.split(" ").map(w => w[0]).join("").slice(0, 4),
      progress: s.progress,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [subjectStats]);

  const weakSubjects = useMemo(() =>
    subjectStats.filter(s => s.progress < 30).sort((a, b) => a.progress - b.progress).map(s => s.name),
  [subjectStats]);

  const urgencyColor = daysLeft <= 7 ? "text-destructive" : daysLeft <= 14 ? "text-sankalp-amber" : "text-primary";
  const todayCompleted = todayTasks.filter(t => t.is_completed).length;
  const xpPoints = subjectStats.reduce((a, s) => a + s.completed * 10, 0);
  const level = Math.floor(xpPoints / 100) + 1;
  const greeting = useMemo(() => getGreeting(), []);
  const aiInsight = useMemo(
    () => getAIInsight(overallProgress, streak, daysLeft, weakSubjects),
    [overallProgress, streak, daysLeft, weakSubjects]
  );

  const sparklineData = useMemo(() => weeklyData.map(d => d.minutes), [weeklyData]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ─── Hero Section ─── */}
      <div className="relative overflow-hidden rounded-2xl sankalp-gradient-animated p-6 md:p-8 text-primary-foreground animate-fade-in-up">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/5 blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,255,255,0.12),transparent_60%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <img src={sankalpLogo} alt="Sankalp" className="h-12 w-12 rounded-xl object-contain bg-white/90 p-1 shadow-lg" />
              <div>
                <p className="text-xs opacity-70">Semester {semester} · B.Tech CSE</p>
                <h1 className="text-2xl md:text-3xl font-bold font-display leading-tight">
                  {greeting}, {userName} 👋
                </h1>
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 max-w-lg border border-white/10">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-200 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed opacity-90">{aiInsight}</p>
              </div>
            </div>

            {/* Today's Focus */}
            {todayTasks.filter(t => !t.is_completed).length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider opacity-60 font-medium">Today's Focus:</span>
                {todayTasks.filter(t => !t.is_completed).slice(0, 3).map(task => (
                  <span key={task.id} className="text-xs bg-white/15 backdrop-blur-sm rounded-lg px-2.5 py-1 font-medium">
                    {task.topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-5">
            <ProgressRing progress={overallProgress} size={110} strokeWidth={8} />
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/10">
                <Flame className="h-5 w-5 text-amber-300" />
                <div>
                  <p className="text-lg font-bold tabular-nums leading-none">{streak}</p>
                  <p className="text-[10px] opacity-70">day streak</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/10`}>
                <Clock className={`h-5 w-5 ${daysLeft <= 7 ? 'text-red-300' : 'text-cyan-200'}`} />
                <div>
                  <p className="text-lg font-bold tabular-nums leading-none">{daysLeft}</p>
                  <p className="text-[10px] opacity-70">days left</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/10">
                <Trophy className="h-5 w-5 text-yellow-300" />
                <div>
                  <p className="text-lg font-bold tabular-nums leading-none">Lv.{level}</p>
                  <p className="text-[10px] opacity-70">{xpPoints} XP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats Cards with Sparklines ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        {[
          {
            icon: BookOpen, label: "Subjects", value: subjects.length, sub: `${labs.length} labs`,
            color: "text-primary", bgColor: "bg-primary/10", trend: null,
            sparkline: subjectStats.map(s => s.progress),
          },
          {
            icon: Target, label: "Topics Done", value: subjectStats.reduce((a, s) => a + s.completed, 0),
            sub: `of ${subjectStats.reduce((a, s) => a + s.total, 0)}`,
            color: "text-sankalp-green", bgColor: "bg-sankalp-green/10",
            trend: overallProgress > 50 ? "+12% this week" : null,
            sparkline: [20, 35, 45, 50, 55, 65, overallProgress],
          },
          {
            icon: Trophy, label: "XP Earned", value: xpPoints, sub: `Level ${level}`,
            color: "text-sankalp-amber", bgColor: "bg-sankalp-amber/10",
            trend: xpPoints > 100 ? "Rising" : null,
            sparkline: [10, 25, 40, 55, 70, 85, xpPoints % 100 || 50],
          },
          {
            icon: Timer, label: "Study Today", value: `${todayMinutes}m`, sub: "focus time",
            color: "text-sankalp-cyan", bgColor: "bg-sankalp-cyan/10",
            trend: todayMinutes >= 60 ? "Great session!" : null,
            sparkline: sparklineData,
          },
        ].map((stat, i) => (
          <Card key={i} className="glass border-0 card-hover group overflow-hidden relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${stat.bgColor} ${stat.color} transition-transform duration-200 group-hover:scale-110`}>
                    <stat.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{stat.label}</span>
                </div>
                {stat.sparkline.length > 0 && (
                  <Sparkline data={stat.sparkline} height={20} />
                )}
              </div>
              <p className="text-2xl font-bold font-display tabular-nums">{stat.value}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-[11px] text-muted-foreground">{stat.sub}</p>
                {stat.trend && (
                  <span className="text-[10px] font-medium text-sankalp-green flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> {stat.trend}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Gamification Bar ─── */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-4 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl sankalp-gradient flex items-center justify-center animate-pulse-glow shadow-lg">
            <Award className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold font-display">Level {level}</p>
            <p className="text-[10px] text-muted-foreground">{xpPoints % 100}/100 XP to next level</p>
          </div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Progress value={xpPoints % 100} className="h-2.5" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {streak >= 3 && (
            <Badge className="bg-sankalp-amber/15 text-sankalp-amber border-0 text-[10px] animate-scale-bounce">
              🔥 On Fire
            </Badge>
          )}
          {streak >= 7 && (
            <Badge className="bg-sankalp-red/15 text-sankalp-red border-0 text-[10px] animate-scale-bounce" style={{ animationDelay: "100ms" }}>
              🏆 Week Warrior
            </Badge>
          )}
          {overallProgress >= 50 && (
            <Badge className="bg-sankalp-green/15 text-sankalp-green border-0 text-[10px] animate-scale-bounce" style={{ animationDelay: "200ms" }}>
              ⭐ Halfway Hero
            </Badge>
          )}
          {overallProgress >= 80 && (
            <Badge className="bg-primary/15 text-primary border-0 text-[10px] animate-scale-bounce" style={{ animationDelay: "300ms" }}>
              💎 Almost There
            </Badge>
          )}
          {todayMinutes >= 60 && (
            <Badge className="bg-sankalp-cyan/15 text-sankalp-cyan border-0 text-[10px] animate-scale-bounce" style={{ animationDelay: "400ms" }}>
              🎯 Dedicated
            </Badge>
          )}
        </div>
      </div>

      {/* ─── Today's Tasks + Weekly Chart ─── */}
      <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        <Card className="glass border-0 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between font-display">
              <span className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary" />
                Today's Tasks
              </span>
              <Badge variant="secondary" className="text-[10px] tabular-nums">
                {todayCompleted}/{todayTasks.length} done
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
                  <CalendarCheck className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No tasks planned for today</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Create a study plan to stay on track</p>
                </div>
                <button
                  onClick={() => navigate("/planner")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <Play className="h-3 w-3" /> Create Study Plan
                </button>
              </div>
            ) : (
              <>
                {todayTasks.slice(0, 5).map((task, idx) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 group/task animate-fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <CheckCircle2 className={`h-5 w-5 shrink-0 transition-colors ${task.is_completed ? "text-sankalp-green" : "text-muted-foreground/30"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.topic}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{task.subject} · {task.duration_minutes}m</p>
                    </div>
                    {!task.is_completed && (
                      <button
                        onClick={() => navigate("/planner")}
                        className="opacity-0 group-hover/task:opacity-100 text-[10px] font-semibold text-primary bg-primary/10 rounded-lg px-2.5 py-1 transition-all hover:bg-primary/20"
                      >
                        Start
                      </button>
                    )}
                  </div>
                ))}
                {todayTasks.length > 5 && (
                  <button onClick={() => navigate("/planner")} className="text-xs text-primary hover:underline w-full text-center pt-1 flex items-center justify-center gap-1">
                    View all {todayTasks.length} tasks <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Weekly Study Chart */}
        <Card className="glass border-0 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 font-display">
              <BarChart3 className="h-4 w-4 text-primary" />
              Weekly Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 8px 32px -8px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value: number) => [`${value} min`, "Study Time"]}
                  />
                  <Area type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#studyGradient)" dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                Start studying to see your weekly trends
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <h2 className="text-sm font-bold font-display mb-3 flex items-center gap-2 text-muted-foreground">
          <Zap className="h-4 w-4 text-primary" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Study Planner", icon: CalendarCheck, path: "/planner", desc: "Plan daily tasks", gradient: "from-primary/10 to-accent/5" },
            { label: "Pomodoro Timer", icon: Timer, path: "/pomodoro", desc: "Focus sessions", gradient: "from-sankalp-blue/10 to-sankalp-cyan/5" },
            { label: "Important Q's", icon: Star, path: "/important-questions", desc: "High probability", gradient: "from-sankalp-amber/10 to-sankalp-red/5" },
            { label: "Test Series", icon: FlaskRound, path: "/test-series", desc: "Mock tests", gradient: "from-sankalp-red/10 to-sankalp-amber/5" },
            { label: "Backlog Mode", icon: Flame, path: "/backlog-planner", desc: "Crash study plan", gradient: "from-destructive/10 to-sankalp-amber/5" },
            { label: "Doubt Hub", icon: MessageCircle, path: "/doubt-hub", desc: "Ask & answer", gradient: "from-sankalp-blue/10 to-primary/5" },
            { label: "AI Chatbot", icon: Brain, path: "/chatbot", desc: "Study assistant", gradient: "from-primary/10 to-sankalp-cyan/5" },
            { label: "Quick Revision", icon: Zap, path: "/revision", desc: "Flash review", gradient: "from-sankalp-green/10 to-sankalp-cyan/5" },
          ].map((item, idx) => (
            <Card
              key={item.path}
              className="glass border-0 cursor-pointer card-hover active:scale-[0.97] group animate-fade-in-up"
              style={{ animationDelay: `${200 + idx * 40}ms` }}
              onClick={() => navigate(item.path)}
            >
              <CardContent className={`p-4 flex items-center gap-3 bg-gradient-to-br ${item.gradient} rounded-lg`}>
                <div className="h-10 w-10 rounded-xl glass-strong flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold font-display group-hover:text-primary transition-colors">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Subject Progress + Performance ─── */}
      <div className="grid md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: "280ms" }}>
        {/* Subject Cards - 2 cols */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-display flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4 text-primary" /> Subjects
            </h2>
            <Badge variant="secondary" className="text-[10px]">{subjects.length} subjects</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {subjectStats.map((sub, i) => (
              <Card
                key={sub.id}
                className="glass cursor-pointer card-hover active:scale-[0.98] border-0 group overflow-hidden"
                onClick={() => navigate(`/subject/${sub.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Mini progress ring */}
                    <div className="relative shrink-0">
                      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
                        <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <circle
                          cx="22" cy="22" r="18" fill="none"
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${(sub.progress / 100) * 113} 113`}
                          className="transition-all duration-700"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{sub.progress}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors font-display">{sub.name}</p>
                      <p className="text-[11px] text-muted-foreground">{sub.completed}/{sub.total} topics · {sub.code}</p>
                      {sub.nextTopic && (
                        <p className="text-[10px] text-primary/70 mt-1 flex items-center gap-1 truncate">
                          <ArrowRight className="h-3 w-3 shrink-0" /> {sub.nextTopic.name}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 shrink-0" />
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${sub.progress}%`,
                        background: sub.progress === 100
                          ? "hsl(var(--sankalp-green))"
                          : `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`,
                      }}
                    />
                  </div>

                  {/* XP + High weightage */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-sankalp-amber font-medium">+{sub.completed * 10} XP</span>
                    {sub.highWeightageUnits.length > 0 && (
                      <div className="flex gap-1">
                        {sub.highWeightageUnits.slice(0, 2).map(u => (
                          <Badge key={u.id} variant="outline" className="text-[9px] bg-sankalp-amber/10 text-sankalp-amber border-0 px-1.5 py-0">
                            ⚡ U{u.id.slice(-1)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Panel */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold font-display flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" /> Performance
          </h2>

          {/* Subject progress bars */}
          <Card className="glass border-0">
            <CardContent className="p-4 space-y-3">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} barCategoryGap="18%">
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "10px",
                        fontSize: "11px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Progress"]}
                    />
                    <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                  No subjects in this semester
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="glass border-0">
            <CardContent className="p-4 space-y-2.5">
              <p className="text-xs font-semibold font-display flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sankalp-amber" /> AI Insights
              </p>
              {weakSubjects.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">Weak areas:</span> {weakSubjects.slice(0, 3).join(", ")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">Best study time:</span> Morning (based on your streak pattern)
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Great progress across all subjects! Keep revising completed topics.
                </p>
              )}
              <button
                onClick={() => navigate("/chatbot")}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
              >
                Ask AI for study advice <ArrowRight className="h-3 w-3" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Labs ─── */}
      {labs.length > 0 && (
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "360ms" }}>
          <h2 className="text-sm font-bold font-display flex items-center gap-2 text-muted-foreground">
            <FlaskConical className="h-4 w-4 text-primary" />
            Lab Practicals
          </h2>
          <div className="grid gap-2 md:grid-cols-3">
            {labs.map((lab, idx) => (
              <Card
                key={lab.id}
                className="glass cursor-pointer card-hover active:scale-[0.98] border-0 group animate-fade-in-up"
                style={{ animationDelay: `${360 + idx * 40}ms` }}
                onClick={() => navigate(`/lab/${lab.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    <FlaskConical className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate font-display group-hover:text-primary transition-colors">{lab.name}</p>
                    <p className="text-[11px] text-muted-foreground">{lab.labPrograms?.length || 0} programs</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── Floating AI Coach ─── */}
      <FloatingAICoach
        suggestion={aiInsight}
        onNavigate={(path) => navigate(path)}
      />
    </div>
  );
}
