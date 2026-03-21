import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, AlertTriangle, Zap, ChevronRight, FlaskConical, TrendingUp, Video, Target } from "lucide-react";
import { useMemo } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(152, 55%, 42%)",
  "hsl(217, 71%, 53%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(270, 50%, 55%)",
  "hsl(180, 50%, 42%)",
];

export default function Dashboard() {
  const { semester, completedTopics, examDate, userName } = useProgress();
  const navigate = useNavigate();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];
  const labs = semData?.subjects.filter(s => s.isLab) || [];

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
      const pendingUnits = sub.units.filter(u => u.topics.some(t => !completedTopics[t.id]));
      const highWeightageUnits = sub.units.filter(u => u.weightage >= 25 && u.topics.some(t => !completedTopics[t.id]));
      return { ...sub, progress, completed, total, pendingUnits, highWeightageUnits };
    });
  }, [subjects, completedTopics]);

  const overallProgress = useMemo(() => {
    const totals = subjectStats.reduce((acc, s) => ({ c: acc.c + s.completed, t: acc.t + s.total }), { c: 0, t: 0 });
    return totals.t > 0 ? Math.round((totals.c / totals.t) * 100) : 0;
  }, [subjectStats]);

  const radarData = useMemo(() => {
    return subjectStats.map(s => ({
      subject: s.name.split(" ").map(w => w[0]).join("").slice(0, 4),
      fullName: s.name,
      progress: s.progress,
    }));
  }, [subjectStats]);

  const unitWeightageData = useMemo(() => {
    return subjectStats.flatMap((s, si) =>
      s.units.map(u => ({
        name: `${s.name.split(" ")[0]} U${u.id.slice(-1)}`,
        weightage: u.weightage,
        done: u.topics.filter(t => completedTopics[t.id]).length,
        total: u.topics.length,
        color: CHART_COLORS[si % CHART_COLORS.length],
      }))
    );
  }, [subjectStats, completedTopics]);

  const weakUnits = useMemo(() => {
    return subjectStats.flatMap(s =>
      s.units.map(u => {
        const done = u.topics.filter(t => completedTopics[t.id]).length;
        const pct = u.topics.length > 0 ? Math.round((done / u.topics.length) * 100) : 0;
        return { subjectName: s.name, unitName: u.name, progress: pct, weightage: u.weightage };
      })
    ).filter(u => u.progress < 50).sort((a, b) => b.weightage - a.weightage).slice(0, 5);
  }, [subjectStats, completedTopics]);

  const urgencyColor = daysLeft <= 7 ? "text-destructive" : daysLeft <= 14 ? "text-sankalp-amber" : "text-primary";

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl sankalp-gradient p-6 md:p-8 text-primary-foreground animate-fade-in-up">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm opacity-80 mb-1">Semester {semester} · B.Tech CSE</p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-sm opacity-80 mt-2">
              {overallProgress >= 75 ? "Great progress! Keep it up!" :
               overallProgress >= 40 ? "You're making steady progress. Focus on weak units!" :
               "Let's get started! Complete topics to track progress."}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold tabular-nums">{overallProgress}%</p>
              <p className="text-xs opacity-70">completed</p>
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
          { icon: AlertTriangle, label: "Weak Units", value: weakUnits.length, sub: "need focus", color: "text-sankalp-amber" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow border-0 bg-card">
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

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        {/* Radar chart */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Subject Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Radar
                    dataKey="progress"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
                No subjects in this semester
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unit weightage bar chart */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-sankalp-amber" />
              Unit Weightage & Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unitWeightageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={unitWeightageData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={0} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name === "weightage" ? "Weightage" : name,
                    ]}
                  />
                  <Bar dataKey="weightage" radius={[4, 4, 0, 0]} maxBarSize={24}>
                    {unitWeightageData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
                No unit data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subject cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Subjects</h2>
          <Badge variant="secondary" className="text-xs">{subjects.length} subjects</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {subjectStats.map((sub, i) => (
            <Card
              key={sub.id}
              className="shadow-sm cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] border-0 animate-fade-in-up group"
              style={{ animationDelay: `${240 + i * 60}ms` }}
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
                        background: sub.progress === 100
                          ? "hsl(var(--sankalp-green))"
                          : sub.progress > 50
                          ? `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`
                          : CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>

                {sub.highWeightageUnits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {sub.highWeightageUnits.slice(0, 2).map(u => (
                      <Badge key={u.id} variant="outline" className="text-[10px] bg-sankalp-amber-light text-sankalp-amber border-0 font-medium">
                        ⚡ {u.name.replace(/Unit \d+: /, "U" + u.id.slice(-1) + " ")} ({u.weightage}%)
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lecture Videos Quick Link */}
      <Card
        className="shadow-sm border-0 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] animate-fade-in-up"
        style={{ animationDelay: "400ms" }}
        onClick={() => navigate("/lectures")}
      >
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sankalp-blue-light flex items-center justify-center">
              <Video className="h-5 w-5 text-sankalp-blue" />
            </div>
            <div>
              <p className="font-semibold">Lecture Videos</p>
              <p className="text-xs text-muted-foreground">Watch curated lectures for each subject & unit</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>

      {/* Weak units */}
      {weakUnits.length > 0 && (
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "480ms" }}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-sankalp-amber" />
            Focus Areas
          </h2>
          <div className="grid gap-2 md:grid-cols-2">
            {weakUnits.map((u, i) => (
              <Card key={i} className="shadow-sm border-0">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-sankalp-amber-light flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-sankalp-amber">{u.weightage}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.unitName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{u.subjectName}</p>
                  </div>
                  <div className="w-20 space-y-1">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-sankalp-amber" style={{ width: `${u.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-right text-muted-foreground">{u.progress}%</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Labs quick access */}
      {labs.length > 0 && (
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "560ms" }}>
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
