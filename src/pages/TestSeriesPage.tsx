import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FlaskConical, Clock, Target, CheckCircle2, XCircle, Loader2, BarChart3, Trophy, Zap,
  ArrowRight, RotateCcw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
} from "recharts";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
}

type TestLevel = "basic" | "advanced";
type TestState = "setup" | "running" | "results";

const CHART_COLORS = ["hsl(152, 55%, 42%)", "hsl(0, 72%, 51%)"];

export default function TestSeriesPage() {
  const { user } = useAuth();
  const { semester } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];

  const [testState, setTestState] = useState<TestState>("setup");
  const [testLevel, setTestLevel] = useState<TestLevel>("basic");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const [pastResults, setPastResults] = useState<any[]>([]);

  const currentSubject = subjects.find(s => s.id === selectedSubject);
  const units = currentSubject?.units || [];

  // Fetch past results
  useEffect(() => {
    if (!user) return;
    supabase.from("test_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => setPastResults(data || []));
  }, [user, testState]);

  const generateQuestions = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    const sub = subjects.find(s => s.id === selectedSubject);
    if (!sub) return;

    const unitInfo = selectedUnit === "all"
      ? sub.units.map(u => `${u.name}: ${u.topics.map(t => t.name).join(", ")}`).join("\n")
      : (() => { const u = sub.units.find(x => x.id === selectedUnit); return u ? `${u.name}: ${u.topics.map(t => t.name).join(", ")}` : ""; })();

    const numQ = testLevel === "basic" ? 10 : 20;
    const difficulty = testLevel === "basic" ? "easy to medium" : "medium to hard, include tricky options";
    const timePerQ = testLevel === "basic" ? 60 : 90; // seconds

    const prompt = `Generate exactly ${numQ} MCQ questions for a B.Tech CSE exam on "${sub.name}" (${selectedUnit === "all" ? "full syllabus" : "specific unit"}).
Topics: ${unitInfo}
Difficulty: ${difficulty}
Return ONLY a JSON array of objects with: question, options (array of 4 strings), correct (0-3 index), explanation (short), topic (which topic it tests).
No markdown, no extra text.`;

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: prompt, mode: "quiz" },
      });
      if (error) throw error;
      const parsed: Question[] = JSON.parse(data.response || "[]");
      if (parsed.length === 0) throw new Error("No questions generated");
      setQuestions(parsed);
      setAnswers(new Array(parsed.length).fill(null));
      setCurrentQ(0);
      const time = parsed.length * timePerQ;
      setTimeLeft(time);
      setTotalTime(time);
      setTestState("running");
    } catch (e: any) {
      toast({ title: "Error generating test", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  // Timer
  useEffect(() => {
    if (testState !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); finishTest(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [testState]);

  const selectAnswer = (optionIndex: number) => {
    setAnswers(prev => { const n = [...prev]; n[currentQ] = optionIndex; return n; });
  };

  const finishTest = useCallback(async () => {
    clearInterval(timerRef.current);
    setTestState("results");
    if (!user) return;
    const correct = questions.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0);
    const weakTopics = [...new Set(questions.filter((q, i) => answers[i] !== q.correct).map(q => q.topic))];
    const sub = subjects.find(s => s.id === selectedSubject);

    await supabase.from("test_results").insert({
      user_id: user.id,
      test_type: testLevel,
      subject: sub?.name || selectedSubject,
      unit_name: selectedUnit === "all" ? null : units.find(u => u.id === selectedUnit)?.name,
      total_questions: questions.length,
      correct_answers: correct,
      time_taken_seconds: totalTime - timeLeft,
      weak_topics: weakTopics,
    });
  }, [questions, answers, user, selectedSubject, testLevel, selectedUnit, totalTime, timeLeft, subjects, units]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const results = useMemo(() => {
    const correct = questions.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0);
    const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const weakTopics = [...new Set(questions.filter((q, i) => answers[i] !== q.correct).map(q => q.topic))];
    const topicStats = questions.reduce((acc: Record<string, { correct: number; total: number }>, q, i) => {
      if (!acc[q.topic]) acc[q.topic] = { correct: 0, total: 0 };
      acc[q.topic].total++;
      if (answers[i] === q.correct) acc[q.topic].correct++;
      return acc;
    }, {});
    return { correct, accuracy, weakTopics, topicStats };
  }, [questions, answers]);

  // SETUP
  if (testState === "setup") {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Test Series</h1>
            <p className="text-sm text-muted-foreground">AI-generated tests to assess your preparation</p>
          </div>
        </div>

        {/* Level selection */}
        <div className="grid sm:grid-cols-2 gap-3">
          {([
            { level: "basic" as TestLevel, title: "Basic Test", desc: "Unit-wise · Easy to Medium · 10 Questions", icon: Target, color: "text-primary", bg: "bg-primary/10" },
            { level: "advanced" as TestLevel, title: "Advanced Test", desc: "Full syllabus · Hard · 20 Questions · Timed", icon: Zap, color: "text-sankalp-amber", bg: "bg-sankalp-amber-light" },
          ]).map(t => (
            <Card
              key={t.level}
              className={`border-2 cursor-pointer transition-all hover:shadow-md ${testLevel === t.level ? "border-primary" : "border-transparent"}`}
              onClick={() => setTestLevel(t.level)}
            >
              <CardContent className="p-5">
                <div className={`p-2 rounded-lg ${t.bg} ${t.color} w-fit mb-3`}>
                  <t.icon className="h-5 w-5" />
                </div>
                <p className="font-semibold">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subject & unit selection */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Subject</label>
                <Select value={selectedSubject} onValueChange={v => { setSelectedSubject(v); setSelectedUnit("all"); }}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Choose subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {testLevel === "basic" && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Unit (optional)</label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="All units" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button onClick={generateQuestions} disabled={!selectedSubject || loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
              Generate Test
            </Button>
          </CardContent>
        </Card>

        {/* Past results */}
        {pastResults.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Recent Results
            </h2>
            <div className="grid gap-2">
              {pastResults.map(r => (
                <Card key={r.id} className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${r.test_type === "advanced" ? "bg-sankalp-amber-light text-sankalp-amber" : "bg-primary/10 text-primary"}`}>
                      {r.test_type === "advanced" ? <Zap className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.subject}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {r.correct_answers}/{r.total_questions} · {Math.round((r.correct_answers / r.total_questions) * 100)}%
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // RUNNING
  if (testState === "running") {
    const q = questions[currentQ];
    const isLast = currentQ === questions.length - 1;
    const answered = answers.filter(a => a !== null).length;

    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-4">
        {/* Timer bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Q {currentQ + 1}/{questions.length}</Badge>
            <Badge variant="secondary" className="text-xs">{answered} answered</Badge>
          </div>
          <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timeLeft < 60 ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
            <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
          </div>
        </div>
        <Progress value={(answered / questions.length) * 100} className="h-1.5" />

        {/* Question */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <p className="font-medium text-base leading-relaxed">{q?.question}</p>
            <div className="space-y-2">
              {q?.options.map((opt, i) => {
                const selected = answers[currentQ] === i;
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                      selected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}>
            Previous
          </Button>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`h-7 w-7 rounded-md text-[10px] font-bold transition-colors ${
                  i === currentQ ? "bg-primary text-primary-foreground" :
                  answers[i] !== null ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {isLast ? (
            <Button size="sm" onClick={finishTest}>Submit Test</Button>
          ) : (
            <Button size="sm" onClick={() => setCurrentQ(p => p + 1)}>
              Next <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // RESULTS
  const chartData = Object.entries(results.topicStats).map(([topic, s]) => ({
    topic: topic.length > 20 ? topic.slice(0, 18) + "…" : topic,
    correct: s.correct,
    wrong: s.total - s.correct,
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Score header */}
      <div className="text-center space-y-2">
        <Trophy className={`h-12 w-12 mx-auto ${results.accuracy >= 70 ? "text-sankalp-amber" : "text-muted-foreground"}`} />
        <h1 className="text-3xl font-bold">{results.accuracy}%</h1>
        <p className="text-sm text-muted-foreground">
          {results.correct}/{questions.length} correct · {formatTime(totalTime - timeLeft)} taken
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Score", value: `${results.correct}/${questions.length}`, icon: Target, color: "text-primary" },
          { label: "Accuracy", value: `${results.accuracy}%`, icon: CheckCircle2, color: results.accuracy >= 70 ? "text-primary" : "text-destructive" },
          { label: "Weak Topics", value: results.weakTopics.length, icon: XCircle, color: "text-destructive" },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Topic chart */}
      {chartData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance by Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="topic" type="category" width={100} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip />
                <Bar dataKey="correct" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="wrong" stackId="a" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Weak topics */}
      {results.weakTopics.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Weak Topics — Focus Here
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {results.weakTopics.map(t => (
                <Badge key={t} variant="outline" className="text-xs bg-destructive/10 text-destructive border-0">{t}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review answers */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Answer Review</h2>
        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.correct;
          return (
            <Card key={i} className={`border-0 shadow-sm ${isCorrect ? "" : "border-l-2 border-l-destructive"}`}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-2">
                  {isCorrect ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium">{q.question}</p>
                </div>
                <div className="ml-6 space-y-1">
                  {answers[i] !== null && answers[i] !== q.correct && (
                    <p className="text-xs text-destructive">Your answer: {q.options[answers[i]!]}</p>
                  )}
                  <p className="text-xs text-primary">Correct: {q.options[q.correct]}</p>
                  <p className="text-[10px] text-muted-foreground italic">{q.explanation}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button onClick={() => setTestState("setup")} className="w-full">
        <RotateCcw className="h-4 w-4 mr-2" /> Take Another Test
      </Button>
    </div>
  );
}
