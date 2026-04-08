import { useProgress } from "@/context/ProgressContext";
import sankalpLogo from "@/assets/sankalp-logo.png";
import { getSemester } from "@/data/syllabus";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ProgressRing";
import {
  BookOpen, Clock, ChevronRight, FlaskConical,
  TrendingUp, Target, Flame, CalendarCheck, Timer, FileQuestion, CheckCircle2,
  Star, MessageCircle, FlaskRound, Brain, Zap, Trophy, Award,
} from "lucide-react";
import { useMemo, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(230, 80%, 60%)", "hsl(185, 72%, 45%)", "hsl(38, 92%, 50%)",
  "hsl(152, 55%, 42%)", "hsl(270, 50%, 55%)", "hsl(0, 72%, 51%)",
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

    const { data: tasks } = await supabase
      .from("study_tasks")
      .select("id, subject, topic, is_completed, duration_minutes")
      .eq("user_id", user.id)
      .eq("task_date", today)
      .order("created_at");
    setTodayTasks((tasks as TodayTask[]) || []);

    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("duration_minutes")
      .eq("user_id", user.id)
      .eq("session_date", today);
    setTodayMinutes(sessions?.reduce((s, r) => s + r.duration_minutes, 0) || 0);

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
      } else break;
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

  const barData = useMemo(() => {
    return subjectStats.map((s, i) => ({
      name: s.name.split(" ").map(w => w[0]).join("").slice(0, 4),
      progress: s.progress,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [subjectStats]);

  const urgencyColor = daysLeft <= 7 ? "text-destructive" : daysLeft <= 14 ? "text-sankalp-amber" : "text-primary";
  const todayCompleted = todayTasks.filter(t => t.is_completed).length;
  const xpPoints = subjectStats.reduce((a, s) => a + s.completed * 10, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl sankalp-gradient p-6 md:p-8 text-primary-foreground animate-fade-in-up">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(0,0,0,0.1),transparent_60%)]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={sankalpLogo} alt="Sankalp" className="h-14 w-14 rounded-xl object-contain bg-white/90 p-1 shadow-lg" />
            <div>
              <p className="text-sm opacity-75 mb-1">Semester {semester} · B.Tech CSE</p>
              <h1 className="text-2xl md:text-3xl font-bold font-display leading-tight">
                Welcome back, {userName} 👋
              </h1>
              <p className="text-sm opacity-80 mt-1.5 max-w-md">{motivationalMsg}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Animated Progress Ring */}
            <ProgressRing progress={overallProgress} size={100} strokeWidth={7} />
            
            <div className="flex flex-col gap-3">
              {/* Streak */}
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                <Flame className="h-5 w-5 text-amber-300" />
                <div>
                  <p className="text-lg font-bold tabular-nums leading-none">{streak}</p>
                  <p className="text-[10px] opacity-70">day streak</p>
                </div>
              </div>
              {/* Countdown */}
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                <Clock className="h-5 w-5 text-cyan-200" />
                <div>
                  <p className="text-lg font-bold tabular-nums leading-none">{daysLeft}</p>
                  <p className="text-[10px] opacity-70">days left</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row with glassmorphism */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        {[
          { icon: BookOpen, label: "Subjects", value: subjects.length, sub: `${labs.length} labs`, color: "text-primary" },
          { icon: Target, label: "Topics Done", value: subjectStats.reduce((a, s) => a + s.completed, 0), sub: `of ${subjectStats.reduce((a, s) => a + s.total, 0)}`, color: "text-sankalp-green" },
          { icon: Trophy, label: "XP Earned", value: xpPoints, sub: "points", color: "text-sankalp-amber" },
          { icon: Timer, label: "Studied Today", value: todayMinutes, sub: "minutes", color: "text-sankalp-cyan" },
        ].map((stat, i) => (
          <Card key={i} className="glass card-hover border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-muted/60 ${stat.color}`}>
                  <stat.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gamification bar */}
      <div className="glass rounded-xl p-4 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full sankalp-gradient flex items-center justify-center animate-pulse-glow">
            <Award className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold font-display">Level {Math.floor(xpPoints / 100) + 1}</p>
            <p className="text-[10px] text-muted-foreground">{xpPoints % 100}/100 XP to next</p>
          </div>
        </div>
        <div className="flex-1">
          <Progress value={xpPoints % 100} className="h-2" />
        </div>
        <div className="flex items-center gap-1.5">
          {streak >= 3 && <Badge className="bg-sankalp-amber/15 text-sankalp-amber border-0 text-[10px]">🔥 On Fire</Badge>}
          {overallProgress >= 50 && <Badge className="bg-sankalp-green/15 text-sankalp-green border-0 text-[10px]">⭐ Halfway</Badge>}
          {todayMinutes >= 60 && <Badge className="bg-primary/15 text-primary border-0 text-[10px]">🎯 Dedicated</Badge>}
        </div>
      </div>

      {/* Today's tasks + Chart */}
      <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        <Card className="glass border-0 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between font-display">
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
                <button onClick={() => navigate("/planner")} className="text-xs text-primary hover:underline mt-1">
                  Add tasks in Planner →
                </button>
              </div>
            ) : (
              todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <CheckCircle2 className={`h-4 w-4 shrink-0 ${task.is_completed ? "text-sankalp-green" : "text-muted-foreground/30"}`} />
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

        {/* Bar chart replacing radar */}
        <Card className="glass border-0 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 font-display">
              <TrendingUp className="h-4 w-4 text-primary" />
              Subject Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Progress"]}
                  />
                  <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
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
          { label: "Study Planner", icon: CalendarCheck, path: "/planner", desc: "Plan daily tasks", gradient: "from-primary/15 to-accent/10" },
          { label: "Pomodoro Timer", icon: Timer, path: "/pomodoro", desc: "Focus sessions", gradient: "from-sankalp-blue/15 to-sankalp-cyan/10" },
          { label: "Important Q's", icon: Star, path: "/important-questions", desc: "High probability", gradient: "from-sankalp-amber/15 to-sankalp-red/10" },
          { label: "Test Series", icon: FlaskRound, path: "/test-series", desc: "Mock tests", gradient: "from-sankalp-red/15 to-sankalp-amber/10" },
          { label: "Backlog Mode", icon: Flame, path: "/backlog-planner", desc: "Crash study plan", gradient: "from-destructive/15 to-sankalp-amber/10" },
          { label: "Doubt Hub", icon: MessageCircle, path: "/doubt-hub", desc: "Ask & answer", gradient: "from-sankalp-blue/15 to-primary/10" },
          { label: "AI Chatbot", icon: Brain, path: "/chatbot", desc: "Study assistant", gradient: "from-primary/15 to-sankalp-cyan/10" },
          { label: "Quick Revision", icon: Zap, path: "/revision", desc: "Flash review", gradient: "from-sankalp-green/15 to-sankalp-cyan/10" },
        ].map((item) => (
          <Card
            key={item.path}
            className="glass border-0 cursor-pointer card-hover active:scale-[0.98]"
            onClick={() => navigate(item.path)}
          >
            <CardContent className={`p-4 flex items-center gap-3 bg-gradient-to-br ${item.gradient} rounded-lg`}>
              <div className="h-10 w-10 rounded-xl glass-strong flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold font-display">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subject cards */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "320ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display">Subjects</h2>
          <Badge variant="secondary" className="text-xs">{subjects.length} subjects</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {subjectStats.map((sub, i) => (
            <Card
              key={sub.id}
              className="glass cursor-pointer card-hover active:scale-[0.98] border-0 group"
              onClick={() => navigate(`/subject/${sub.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] + "18", color: CHART_COLORS[i % CHART_COLORS.length] }}>
                        {sub.code.slice(-2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors font-display">{sub.name}</p>
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
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sub.progress}%`,
                        background: sub.progress === 100
                          ? "hsl(var(--sankalp-green))"
                          : `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`,
                      }}
                    />
                  </div>
                </div>
                {sub.highWeightageUnits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {sub.highWeightageUnits.slice(0, 2).map(u => (
                      <Badge key={u.id} variant="outline" className="text-[10px] bg-sankalp-amber/10 text-sankalp-amber border-0 font-medium">
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
          <h2 className="text-lg font-bold font-display flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            Lab Practicals
          </h2>
          <div className="grid gap-2 md:grid-cols-3">
            {labs.map(lab => (
              <Card
                key={lab.id}
                className="glass cursor-pointer card-hover active:scale-[0.98] border-0"
                onClick={() => navigate(`/lab/${lab.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FlaskConical className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate font-display">{lab.name}</p>
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
