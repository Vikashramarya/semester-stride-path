import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, GraduationCap, Calendar, BookOpen } from "lucide-react";
import { useMemo } from "react";

export default function ProfilePage() {
  const { semester, setSemester, userName, setUserName, course, setCourse, examDate, setExamDate, completedTopics } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];

  const stats = useMemo(() => {
    let totalTopics = 0;
    let completedCount = 0;
    subjects.forEach(s => {
      s.units.forEach(u => {
        totalTopics += u.topics.length;
        completedCount += u.topics.filter(t => completedTopics[t.id]).length;
      });
    });
    return { totalTopics, completedCount, progress: totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0 };
  }, [subjects, completedTopics]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Your details & progress overview</p>
      </div>

      <Card className="shadow-sm animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={userName} onChange={e => setUserName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Input id="course" value={course} onChange={e => setCourse(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Semester</Label>
            <Select value={String(semester)} onValueChange={v => setSemester(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 8 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>Semester {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam">Exam Date</Label>
            <Input id="exam" type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Completion</span>
              <span className="font-medium">{stats.progress}%</span>
            </div>
            <Progress value={stats.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{stats.completedCount} of {stats.totalTopics} topics completed</p>
          </div>

          <div className="space-y-2">
            {subjects.map(sub => {
              const allIds = sub.units.flatMap(u => u.topics.map(t => t.id));
              const done = allIds.filter(id => completedTopics[id]).length;
              const pct = allIds.length > 0 ? Math.round((done / allIds.length) * 100) : 0;
              return (
                <div key={sub.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate">{sub.name}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
