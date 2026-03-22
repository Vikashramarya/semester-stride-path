import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

export default function PomodoroPage() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = isBreak ? BREAK_DURATION : FOCUS_DURATION;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const fetchTodayStats = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("study_sessions")
      .select("duration_minutes")
      .eq("user_id", user.id)
      .eq("session_date", today);
    if (data) {
      setSessionsToday(data.length);
      setTotalMinutesToday(data.reduce((sum, s) => sum + s.duration_minutes, 0));
    }
  }, [user]);

  useEffect(() => { fetchTodayStats(); }, [fetchTodayStats]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (!isBreak) {
              saveSession();
              toast.success("Focus session complete! Take a break 🎉");
            } else {
              toast("Break over! Ready for another round? 💪");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isBreak]);

  const saveSession = async () => {
    if (!user) return;
    await supabase.from("study_sessions").insert({
      user_id: user.id,
      duration_minutes: 25,
      session_date: new Date().toISOString().split("T")[0],
    });
    fetchTodayStats();
  };

  const toggle = () => setIsRunning(r => !r);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_DURATION : FOCUS_DURATION);
  };

  const switchMode = () => {
    setIsRunning(false);
    const nextBreak = !isBreak;
    setIsBreak(nextBreak);
    setTimeLeft(nextBreak ? BREAK_DURATION : FOCUS_DURATION);
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Timer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Stay focused with the Pomodoro technique
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 flex flex-col items-center">
          <Badge
            variant={isBreak ? "secondary" : "default"}
            className="mb-6 text-xs"
          >
            {isBreak ? (
              <><Coffee className="h-3 w-3 mr-1" /> Break Time</>
            ) : (
              <><Brain className="h-3 w-3 mr-1" /> Focus Mode</>
            )}
          </Badge>

          {/* Circular timer */}
          <div className="relative w-64 h-64 mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
              <circle
                cx="130" cy="130" r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="130" cy="130" r={radius}
                fill="none"
                stroke={isBreak ? "hsl(var(--sankalp-blue))" : "hsl(var(--primary))"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tabular-nums">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {isBreak ? "break" : "focus"}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              className="h-10 w-10 rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={toggle}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg active:scale-95 transition-transform"
            >
              {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={switchMode}
              className="rounded-full text-xs"
            >
              {isBreak ? "Focus" : "Break"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold tabular-nums text-primary">{sessionsToday}</p>
            <p className="text-xs text-muted-foreground mt-1">Sessions Today</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold tabular-nums text-primary">{totalMinutesToday}</p>
            <p className="text-xs text-muted-foreground mt-1">Minutes Studied</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
