import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, AlertTriangle, Zap, ChevronRight, FlaskConical } from "lucide-react";
import { useMemo } from "react";

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
      const pendingUnits = sub.units.filter(u =>
        u.topics.some(t => !completedTopics[t.id])
      );
      const highWeightageUnits = sub.units
        .filter(u => u.weightage >= 25 && u.topics.some(t => !completedTopics[t.id]));
      return { ...sub, progress, completed, total, pendingUnits, highWeightageUnits };
    });
  }, [subjects, completedTopics]);

  const overallProgress = useMemo(() => {
    const totals = subjectStats.reduce((acc, s) => ({ c: acc.c + s.completed, t: acc.t + s.total }), { c: 0, t: 0 });
    return totals.t > 0 ? Math.round((totals.c / totals.t) * 100) : 0;
  }, [subjectStats]);

  const weakUnits = useMemo(() => {
    return subjectStats.flatMap(s =>
      s.units.map(u => {
        const done = u.topics.filter(t => completedTopics[t.id]).length;
        const pct = u.topics.length > 0 ? Math.round((done / u.topics.length) * 100) : 0;
        return { subjectName: s.name, unitName: u.name, progress: pct, weightage: u.weightage };
      })
    ).filter(u => u.progress < 50).sort((a, b) => b.weightage - a.weightage).slice(0, 5);
  }, [subjectStats, completedTopics]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-1 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          Welcome back, {userName} 👋
        </h1>
        <p className="text-muted-foreground">Semester {semester} · B.Tech CSE</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-medium">Overall</span>
            </div>
            <p className="text-2xl font-bold">{overallProgress}%</p>
            <Progress value={overallProgress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Exam In</span>
            </div>
            <p className="text-2xl font-bold">{daysLeft}</p>
            <p className="text-xs text-muted-foreground mt-1">days remaining</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-medium">Subjects</span>
            </div>
            <p className="text-2xl font-bold">{subjects.length}</p>
            <p className="text-xs text-muted-foreground mt-1">+ {labs.length} labs</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">Weak Units</span>
            </div>
            <p className="text-2xl font-bold">{weakUnits.length}</p>
            <p className="text-xs text-muted-foreground mt-1">need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Subjects</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {subjectStats.map((sub, i) => (
            <Card
              key={sub.id}
              className="shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] animate-fade-in-up"
              style={{ animationDelay: `${160 + i * 60}ms` }}
              onClick={() => navigate(`/subject/${sub.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{sub.name}</p>
                    <p className="text-xs text-muted-foreground">{sub.code} · {sub.completed}/{sub.total} topics</p>
                  </div>
                  <Badge variant={sub.progress === 100 ? "default" : sub.progress > 50 ? "secondary" : "outline"}
                    className="shrink-0 ml-2">
                    {sub.progress}%
                  </Badge>
                </div>
                <Progress value={sub.progress} className="h-1.5 mb-3" />
                {sub.highWeightageUnits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sub.highWeightageUnits.slice(0, 2).map(u => (
                      <Badge key={u.id} variant="outline" className="text-[10px] bg-sankalp-amber-light text-sankalp-amber border-0">
                        ⚡ {u.name.replace("Unit ", "U")} ({u.weightage}%)
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Weak units */}
      {weakUnits.length > 0 && (
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-sankalp-amber" />
            Focus Areas
          </h2>
          <div className="space-y-2">
            {weakUnits.map((u, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.unitName}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.subjectName}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{u.weightage}%</Badge>
                  <div className="w-16">
                    <Progress value={u.progress} className="h-1.5" />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{u.progress}%</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Labs quick access */}
      {labs.length > 0 && (
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "480ms" }}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Lab Practicals
          </h2>
          <div className="grid gap-2 md:grid-cols-3">
            {labs.map(lab => (
              <Card
                key={lab.id}
                className="shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                onClick={() => navigate(`/lab/${lab.id}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{lab.name}</p>
                    <p className="text-xs text-muted-foreground">{lab.labPrograms?.length || 0} programs</p>
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
