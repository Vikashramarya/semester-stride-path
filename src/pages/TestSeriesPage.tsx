import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FlaskConical, Clock, Loader2, Trophy, ArrowRight, RotateCcw, FileText, AlertTriangle,
  CheckCircle2, GraduationCap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import OnboardingPage from "./OnboardingPage";

interface ShortQ { q: string; marks: number; unit: number; }
interface LongQ { q: string; marks: number; }
interface SectionLong { unit: number; choices: LongQ[]; }
interface Paper {
  sectionA: ShortQ[];
  sectionB: SectionLong;
  sectionC: SectionLong;
  sectionD: SectionLong;
  sectionE: SectionLong;
}
interface GradeResult {
  marks_awarded: number;
  max_marks: number;
  feedback: string;
  model_answer: string;
}

type Stage = "setup" | "cover" | "running" | "grading" | "results";

const TOTAL_TIME = 3 * 60 * 60; // 3 hours
const TOTAL_MARKS = 70;

export default function TestSeriesPage() {
  const { user } = useAuth();
  const { semester } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];

  const [stage, setStage] = useState<Stage>("setup");
  const [profile, setProfile] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const [pastResults, setPastResults] = useState<any[]>([]);

  // Answers: keyed by section+index. For sections B-E also track choice index (0 or 1).
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [longChoice, setLongChoice] = useState<Record<"B" | "C" | "D" | "E", 0 | 1>>({ B: 0, C: 0, D: 0, E: 0 });
  const [grades, setGrades] = useState<Record<string, GradeResult>>({});
  const [scoredMarks, setScoredMarks] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
    supabase.from("mock_test_results").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => setPastResults(data || []));
  }, [user, stage]);

  const generatePaper = async () => {
    if (!selectedSubject) return;
    const sub = subjects.find(s => s.id === selectedSubject);
    if (!sub || sub.units.length < 4) {
      toast({ title: "Need 4 units", description: "This subject doesn't have 4 units defined.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const unitsInfo = sub.units.slice(0, 4).map((u, i) =>
      `Unit ${i + 1} - ${u.name}: ${u.topics.map(t => t.name).join(", ")}`
    ).join("\n");

    const prompt = `Generate a 3-hour, 70-mark B.Tech end-semester question paper for "${sub.name}".
Units:
${unitsInfo}

Follow the strict JSON schema. Section A = 7 short questions (2 marks each, mixed across units 1-4). Sections B/C/D/E = one 14-mark long question each from units 1/2/3/4 respectively, each with 2 OR-choice alternatives.`;

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: prompt, mode: "mock_paper" },
      });
      if (error) throw error;
      const raw = String(data?.content ?? data?.response ?? "");
      const cleaned = raw.replace(/```json|```/gi, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("Invalid paper format");
      const parsed: Paper = JSON.parse(cleaned.slice(start, end + 1));
      if (!parsed.sectionA || !parsed.sectionB || !parsed.sectionC || !parsed.sectionD || !parsed.sectionE) {
        throw new Error("Paper is missing sections");
      }
      setPaper(parsed);
      setAnswers({});
      setGrades({});
      setLongChoice({ B: 0, C: 0, D: 0, E: 0 });
      setTimeLeft(TOTAL_TIME);
      setStage("cover");
    } catch (e: any) {
      console.error(e);
      toast({ title: "Could not generate paper", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  // Timer
  useEffect(() => {
    if (stage !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); submitPaper(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const updateAnswer = (key: string, value: string) =>
    setAnswers(prev => ({ ...prev, [key]: value }));

  const answeredCount = useMemo(() => {
    if (!paper) return 0;
    let n = 0;
    paper.sectionA.forEach((_, i) => { if ((answers[`A-${i}`] || "").trim()) n++; });
    (["B", "C", "D", "E"] as const).forEach(sec => {
      const ci = longChoice[sec];
      if ((answers[`${sec}-${ci}`] || "").trim()) n++;
    });
    return n;
  }, [paper, answers, longChoice]);

  const totalQuestions = 7 + 4;

  const submitPaper = useCallback(async () => {
    if (!paper || !user) return;
    clearInterval(timerRef.current);
    setStage("grading");

    const items: { key: string; q: string; marks: number; ans: string }[] = [];
    paper.sectionA.forEach((q, i) => items.push({ key: `A-${i}`, q: q.q, marks: q.marks, ans: answers[`A-${i}`] || "" }));
    (["B", "C", "D", "E"] as const).forEach(sec => {
      const ci = longChoice[sec];
      const sectionData = paper[`section${sec}` as "sectionB"];
      const q = sectionData.choices[ci];
      items.push({ key: `${sec}-${ci}`, q: q.q, marks: q.marks, ans: answers[`${sec}-${ci}`] || "" });
    });

    const newGrades: Record<string, GradeResult> = {};
    let total = 0;

    // Sequential to avoid rate limits
    for (const it of items) {
      try {
        const prompt = `Question (${it.marks} marks): ${it.q}\n\nStudent answer: ${it.ans || "(no answer provided)"}`;
        const { data, error } = await supabase.functions.invoke("chat", {
          body: { message: prompt, mode: "grade" },
        });
        if (error) throw error;
        const raw = String(data?.content ?? data?.response ?? "");
        const cleaned = raw.replace(/```json|```/gi, "").trim();
        const s = cleaned.indexOf("{"); const e = cleaned.lastIndexOf("}");
        const g: GradeResult = JSON.parse(cleaned.slice(s, e + 1));
        const awarded = Math.max(0, Math.min(it.marks, Number(g.marks_awarded) || 0));
        newGrades[it.key] = { ...g, marks_awarded: awarded, max_marks: it.marks };
        total += awarded;
        setGrades({ ...newGrades });
        setScoredMarks(total);
      } catch (err) {
        console.error("grade error", err);
        newGrades[it.key] = { marks_awarded: 0, max_marks: it.marks, feedback: "Could not grade automatically.", model_answer: "" };
      }
    }

    const sub = subjects.find(s => s.id === selectedSubject);
    await supabase.from("mock_test_results").insert({
      user_id: user.id,
      subject: sub?.name || selectedSubject,
      sections: paper as any,
      answers: { ...answers, _longChoice: longChoice } as any,
      grading: newGrades as any,
      total_marks: TOTAL_MARKS,
      scored_marks: total,
      time_taken_seconds: TOTAL_TIME - timeLeft,
    });

    setStage("results");
  }, [paper, user, answers, longChoice, selectedSubject, subjects, timeLeft]);

  // ============== SETUP ==============
  if (stage === "setup") {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <FlaskConical className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Full Mock Test</h1>
            <p className="text-sm text-muted-foreground">3 hours · 70 marks · University format</p>
          </div>
        </div>

        <Card className="border-0 shadow-md glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Paper Pattern
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span><b>Section A</b> · Compulsory · 7 questions × 2 marks</span><span className="font-mono">14 M</span></div>
            <div className="flex justify-between"><span><b>Section B</b> · Unit 1 · with internal OR choice</span><span className="font-mono">14 M</span></div>
            <div className="flex justify-between"><span><b>Section C</b> · Unit 2 · with internal OR choice</span><span className="font-mono">14 M</span></div>
            <div className="flex justify-between"><span><b>Section D</b> · Unit 3 · with internal OR choice</span><span className="font-mono">14 M</span></div>
            <div className="flex justify-between"><span><b>Section E</b> · Unit 4 · with internal OR choice</span><span className="font-mono">14 M</span></div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold"><span>Total</span><span className="font-mono">70 Marks · 3 Hours</span></div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Select Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Choose a subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generatePaper} disabled={!selectedSubject || loading} className="w-full h-11 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
              Generate Paper
            </Button>
          </CardContent>
        </Card>

        {pastResults.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Recent Mock Tests</h2>
            {pastResults.map(r => (
              <Card key={r.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.subject}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</p>
                  </div>
                  <Badge variant="secondary">{Number(r.scored_marks ?? 0).toFixed(1)} / {r.total_marks}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============== COVER SHEET ==============
  if (stage === "cover") {
    return (
      <OnboardingPage
        initial={profile}
        isCoverSheet
        onComplete={() => {
          supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle()
            .then(({ data }) => setProfile(data));
          setStage("running");
        }}
      />
    );
  }

  // ============== RUNNING ==============
  if (stage === "running" && paper) {
    const sub = subjects.find(s => s.id === selectedSubject);
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-4 animate-fade-in-up">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-3 bg-background/80 backdrop-blur-md border-b">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <GraduationCap className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{sub?.name}</p>
                <p className="text-[10px] text-muted-foreground">{profile?.college_name} · {profile?.display_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">{answeredCount}/{totalQuestions} answered</Badge>
              <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timeLeft < 600 ? "text-destructive animate-pulse" : ""}`}>
                <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          <Progress value={(answeredCount / totalQuestions) * 100} className="h-1 mt-2" />
        </div>

        {/* Paper meta */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center space-y-1">
            <p className="font-bold uppercase tracking-wide">{sub?.name} — End Semester Examination</p>
            <p className="text-xs text-muted-foreground">Time: 3 Hours · Maximum Marks: 70</p>
            <p className="text-[11px] text-muted-foreground italic">All sections are compulsory. Section A has no choice. Sections B–E have internal choices.</p>
          </CardContent>
        </Card>

        {/* Section A */}
        <SectionBlock title="Section A" subtitle="Compulsory · Answer all 7 questions · 2 marks each (Mixed Units)">
          {paper.sectionA.map((q, i) => (
            <QuestionItem
              key={`A-${i}`}
              label={`Q${i + 1}.`}
              question={q.q}
              marks={q.marks}
              meta={`Unit ${q.unit}`}
              value={answers[`A-${i}`] || ""}
              onChange={v => updateAnswer(`A-${i}`, v)}
              rows={2}
            />
          ))}
        </SectionBlock>

        {/* Sections B-E */}
        {(["B", "C", "D", "E"] as const).map((sec, idx) => {
          const data = paper[`section${sec}` as "sectionB"];
          const ci = longChoice[sec];
          return (
            <SectionBlock
              key={sec}
              title={`Section ${sec}`}
              subtitle={`Unit ${data.unit} · Attempt any ONE · 14 marks`}
            >
              <div className="flex gap-2 mb-3">
                {data.choices.map((_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={ci === i ? "default" : "outline"}
                    onClick={() => setLongChoice(prev => ({ ...prev, [sec]: i as 0 | 1 }))}
                  >
                    {i === 0 ? "Question (a)" : "OR — Question (b)"}
                  </Button>
                ))}
              </div>
              <QuestionItem
                label={`Q${8 + idx}.`}
                question={data.choices[ci]?.q || ""}
                marks={14}
                value={answers[`${sec}-${ci}`] || ""}
                onChange={v => updateAnswer(`${sec}-${ci}`, v)}
                rows={8}
              />
            </SectionBlock>
          );
        })}

        <div className="flex justify-end gap-2 sticky bottom-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-xl"
            onClick={() => {
              if (answeredCount < totalQuestions && !confirm(`You've answered ${answeredCount}/${totalQuestions}. Submit anyway?`)) return;
              submitPaper();
            }}
          >
            Submit Paper <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // ============== GRADING ==============
  if (stage === "grading") {
    const graded = Object.keys(grades).length;
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4 animate-fade-in-up">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center animate-pulse-glow">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-bold">Evaluating your paper</h2>
        <p className="text-sm text-muted-foreground">AI examiner is grading each answer with feedback…</p>
        <Progress value={(graded / totalQuestions) * 100} className="h-2" />
        <p className="text-xs text-muted-foreground">{graded} of {totalQuestions} graded · Running total: {scoredMarks.toFixed(1)} / {TOTAL_MARKS}</p>
      </div>
    );
  }

  // ============== RESULTS ==============
  if (stage === "results" && paper) {
    const percent = (scoredMarks / TOTAL_MARKS) * 100;
    const grade = percent >= 75 ? "A" : percent >= 60 ? "B" : percent >= 45 ? "C" : percent >= 33 ? "D" : "F";
    const items: { key: string; label: string; q: string; ans: string; g?: GradeResult }[] = [];
    paper.sectionA.forEach((q, i) => items.push({ key: `A-${i}`, label: `Section A · Q${i + 1}`, q: q.q, ans: answers[`A-${i}`] || "", g: grades[`A-${i}`] }));
    (["B", "C", "D", "E"] as const).forEach((sec, idx) => {
      const ci = longChoice[sec];
      const data = paper[`section${sec}` as "sectionB"];
      items.push({ key: `${sec}-${ci}`, label: `Section ${sec} · Q${8 + idx}`, q: data.choices[ci]?.q || "", ans: answers[`${sec}-${ci}`] || "", g: grades[`${sec}-${ci}`] });
    });

    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <Card className="border-0 shadow-xl glass-strong">
          <CardContent className="p-6 text-center space-y-3">
            <Trophy className={`h-14 w-14 mx-auto ${percent >= 60 ? "text-amber-500" : "text-muted-foreground"}`} />
            <div>
              <p className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                {scoredMarks.toFixed(1)} / {TOTAL_MARKS}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{percent.toFixed(1)}% · Grade {grade}</p>
            </div>
            <div className="flex justify-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">Time: {formatTime(TOTAL_TIME - timeLeft)}</Badge>
              <Badge variant="secondary">{totalQuestions} questions</Badge>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-lg font-semibold">Detailed Evaluation</h2>
        {items.map(item => (
          <Card key={item.key} className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{item.label}</Badge>
                {item.g && (
                  <Badge className={item.g.marks_awarded === item.g.max_marks ? "bg-emerald-500" : item.g.marks_awarded > 0 ? "bg-amber-500" : "bg-destructive"}>
                    {item.g.marks_awarded} / {item.g.max_marks}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium">{item.q}</p>
              <div className="text-xs space-y-1.5 pl-3 border-l-2 border-muted">
                <div>
                  <span className="font-semibold text-muted-foreground">Your answer: </span>
                  <span className="whitespace-pre-wrap">{item.ans || <em className="text-destructive">Not attempted</em>}</span>
                </div>
                {item.g?.model_answer && (
                  <div>
                    <span className="font-semibold text-primary">Model answer: </span>
                    <span className="whitespace-pre-wrap">{item.g.model_answer}</span>
                  </div>
                )}
                {item.g?.feedback && (
                  <div className="flex gap-1.5 pt-1">
                    {item.g.marks_awarded === item.g.max_marks
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />}
                    <span className="italic text-muted-foreground">{item.g.feedback}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button onClick={() => { setStage("setup"); setPaper(null); }} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" /> Take Another Mock Test
        </Button>
      </div>
    );
  }

  return null;
}

function SectionBlock({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <span>{title}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function QuestionItem({
  label, question, marks, meta, value, onChange, rows = 3,
}: {
  label: string; question: string; marks: number; meta?: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-relaxed">
          <span className="font-semibold mr-1">{label}</span>{question}
        </p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant="secondary" className="text-[10px]">{marks} M</Badge>
          {meta && <Badge variant="outline" className="text-[9px]">{meta}</Badge>}
        </div>
      </div>
      <Textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Write your answer here…"
        className="resize-y text-sm"
      />
    </div>
  );
}
