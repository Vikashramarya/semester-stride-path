import { useState, useMemo } from "react";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Flame, CalendarClock, Clock, Target, Rocket, Trophy, CheckCircle2, BookOpen,
} from "lucide-react";

const STORAGE_KEY = "sankalp-backlog-plan";

interface BacklogPlan {
  examDate: string;
  hoursPerDay: number;
  selectedSubjects: string[];
  completedDays: Record<string, boolean>;
}

function loadPlan(): BacklogPlan | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export default function BacklogPlannerPage() {
  const { semester, completedTopics } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];

  const [plan, setPlan] = useState<BacklogPlan | null>(loadPlan);
  const [examDate, setExamDate] = useState(plan?.examDate || "");
  const [hoursPerDay, setHoursPerDay] = useState(plan?.hoursPerDay || 6);
  const [selectedSubs, setSelectedSubs] = useState<string[]>(plan?.selectedSubjects || []);

  const savePlan = (p: BacklogPlan) => {
    setPlan(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  };

  const toggleSubject = (id: string) => {
    setSelectedSubs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const generatePlan = () => {
    if (!examDate || selectedSubs.length === 0) return;
    savePlan({ examDate, hoursPerDay, selectedSubjects: selectedSubs, completedDays: {} });
  };

  const daysLeft = useMemo(() => {
    if (!plan?.examDate) return 0;
    return Math.max(0, Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [plan?.examDate]);

  const crashSchedule = useMemo(() => {
    if (!plan) return [];
    const subs = subjects.filter(s => plan.selectedSubjects.includes(s.id));
    const pendingTopics: { subject: string; unit: string; topic: string; topicId: string }[] = [];

    subs.forEach(sub => {
      sub.units.forEach(unit => {
        // Sort by weightage - high weightage first
        unit.topics.forEach(t => {
          if (!completedTopics[t.id]) {
            pendingTopics.push({ subject: sub.name, unit: unit.name, topic: t.name, topicId: t.id });
          }
        });
      });
    });

    if (daysLeft === 0) return [];
    const topicsPerDay = Math.max(1, Math.ceil(pendingTopics.length / daysLeft));
    const days: { day: number; date: string; topics: typeof pendingTopics; id: string }[] = [];

    for (let i = 0; i < daysLeft && pendingTopics.length > 0; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayTopics = pendingTopics.splice(0, topicsPerDay);
      days.push({
        day: i + 1,
        date: d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }),
        topics: dayTopics,
        id: `day-${i}`,
      });
    }
    return days;
  }, [plan, subjects, completedTopics, daysLeft]);

  const totalTopics = crashSchedule.reduce((a, d) => a + d.topics.length, 0);
  const completedDayCount = plan ? Object.values(plan.completedDays).filter(Boolean).length : 0;
  const progressPercent = crashSchedule.length > 0 ? Math.round((completedDayCount / crashSchedule.length) * 100) : 0;

  const toggleDay = (dayId: string) => {
    if (!plan) return;
    const next = { ...plan, completedDays: { ...plan.completedDays, [dayId]: !plan.completedDays[dayId] } };
    savePlan(next);
  };

  const resetPlan = () => {
    setPlan(null);
    localStorage.removeItem(STORAGE_KEY);
    setSelectedSubs([]);
    setExamDate("");
  };

  if (!plan) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/15 flex items-center justify-center">
            <Flame className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Backlog Recovery Mode</h1>
            <p className="text-sm text-muted-foreground">Generate a crash study plan to catch up</p>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Setup Your Recovery Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Exam Date</label>
                <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="h-10" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Study Hours/Day</label>
                <Input type="number" min={1} max={16} value={hoursPerDay} onChange={e => setHoursPerDay(Number(e.target.value))} className="h-10" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Pending Subjects</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {subjects.map(sub => {
                  const allTopics = sub.units.flatMap(u => u.topics);
                  const pending = allTopics.filter(t => !completedTopics[t.id]).length;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                        selectedSubs.includes(sub.id) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Checkbox checked={selectedSubs.includes(sub.id)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sub.name}</p>
                        <p className="text-[10px] text-muted-foreground">{pending} topics pending</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button onClick={generatePlan} disabled={!examDate || selectedSubs.length === 0} className="w-full">
              <Rocket className="h-4 w-4 mr-2" /> Generate Crash Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/15 flex items-center justify-center">
            <Flame className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Recovery Mode Active</h1>
            <p className="text-sm text-muted-foreground">Stay consistent, you've got this! 💪</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={resetPlan}>Reset Plan</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: CalendarClock, label: "Days Left", value: daysLeft, color: "text-destructive", bg: "bg-destructive/10" },
          { icon: Target, label: "Total Topics", value: totalTopics, color: "text-sankalp-blue", bg: "bg-sankalp-blue-light" },
          { icon: Clock, label: "Hours/Day", value: plan.hoursPerDay, color: "text-sankalp-amber", bg: "bg-sankalp-amber-light" },
          { icon: Trophy, label: "Progress", value: `${progressPercent}%`, color: "text-primary", bg: "bg-primary/10" },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`p-1.5 rounded-lg ${s.bg} ${s.color} w-fit mb-2`}>
                <s.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="font-bold text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-xs text-muted-foreground">{completedDayCount} of {crashSchedule.length} days completed</p>
        </CardContent>
      </Card>

      {/* Daily schedule */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" /> Daily Targets
        </h2>
        {crashSchedule.map(day => {
          const isDone = plan.completedDays[day.id];
          return (
            <Card key={day.id} className={`border-0 shadow-sm transition-all ${isDone ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleDay(day.id)} className="mt-0.5">
                    <CheckCircle2 className={`h-5 w-5 ${isDone ? "text-primary" : "text-muted-foreground/30"}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-semibold ${isDone ? "line-through text-muted-foreground" : ""}`}>
                        Day {day.day}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">{day.date}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{day.topics.length} topics</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {day.topics.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] font-normal">
                          {t.topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
