import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CalendarDays, BookOpen, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  is_completed: boolean;
  task_date: string;
}

export default function PlannerPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("30");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("study_tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_date", selectedDate)
      .order("created_at", { ascending: true });
    setTasks((data as StudyTask[]) || []);
    setLoading(false);
  }, [user, selectedDate]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    if (!user || !subject.trim() || !topic.trim()) {
      toast.error("Please fill in subject and topic");
      return;
    }
    const { error } = await supabase.from("study_tasks").insert({
      user_id: user.id,
      subject: subject.trim(),
      topic: topic.trim(),
      duration_minutes: parseInt(duration) || 30,
      task_date: selectedDate,
    });
    if (error) { toast.error("Failed to add task"); return; }
    setSubject("");
    setTopic("");
    setDuration("30");
    fetchTasks();
    toast.success("Task added!");
  };

  const toggleTask = async (task: StudyTask) => {
    await supabase
      .from("study_tasks")
      .update({
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date().toISOString() : null,
      })
      .eq("id", task.id);
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await supabase.from("study_tasks").delete().eq("id", id);
    fetchTasks();
    toast("Task removed");
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalMinutes = tasks.reduce((s, t) => s + t.duration_minutes, 0);
  const completedMinutes = tasks.filter(t => t.is_completed).reduce((s, t) => s + t.duration_minutes, 0);

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Study Planner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plan your daily study schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-auto h-9 text-sm"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{completedCount}/{tasks.length}</p>
            <p className="text-[10px] text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{completedMinutes}</p>
            <p className="text-[10px] text-muted-foreground">Min Studied</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{totalMinutes}</p>
            <p className="text-[10px] text-muted-foreground">Min Planned</p>
          </CardContent>
        </Card>
      </div>

      {/* Add task form */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Task
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="h-9 text-sm"
            />
            <Input
              placeholder="Topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="h-9 text-sm"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="h-9 text-sm w-20"
                min="5"
              />
              <Button onClick={addTask} size="sm" className="h-9 flex-1">
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task list */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>
        ) : tasks.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {isToday ? "No tasks for today. Add one above!" : "No tasks for this date."}
              </p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task, i) => (
            <Card
              key={task.id}
              className={`border-0 shadow-sm transition-all animate-fade-in-up ${
                task.is_completed ? "opacity-60" : ""
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Checkbox
                  checked={task.is_completed}
                  onCheckedChange={() => toggleTask(task)}
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.topic}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{task.subject}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  {task.duration_minutes}m
                </Badge>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-muted-foreground/50 hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
