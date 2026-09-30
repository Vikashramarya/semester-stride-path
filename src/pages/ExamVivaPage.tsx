import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { getSemester, type Subject } from "@/data/syllabus";
import { BookOpenCheck, Check, ChevronLeft, ChevronRight, Clock3, RotateCcw, Sparkles, Star, Volume2 } from "lucide-react";

type VivaStatus = "confident" | "practice";
interface VivaPrompt {
  id: string;
  subjectId: string;
  subjectName: string;
  unitName: string;
  topicId: string;
  topicName: string;
  question: string;
  referencePoints: string[];
  repeated: number;
}

function buildVivaPrompts(subjects: Subject[]): VivaPrompt[] {
  return subjects.flatMap((subject) => subject.units.flatMap((unit) => unit.topics.flatMap((topic, topicIndex) => {
    const relatedPyqs = unit.pyqs.filter((pyq) =>
      pyq.question.toLowerCase().includes(topic.name.toLowerCase().split(" ")[0] || "") || topic.important,
    );
    const base = {
      subjectId: subject.id,
      subjectName: subject.name,
      unitName: unit.name,
      topicId: topic.id,
      topicName: topic.name,
      referencePoints: [topic.name, ...unit.notes.slice(0, 3)],
    };
    const prompts: VivaPrompt[] = [{
      ...base,
      id: `${topic.id}-concept`,
      question: topicIndex % 2 === 0
        ? `Explain ${topic.name}. What is its purpose, and where would you use it?`
        : `How does ${topic.name} work? Describe its key steps or properties.`,
      repeated: 0,
    }];
    relatedPyqs.slice(0, 1).forEach((pyq, pyqIndex) => prompts.push({
      ...base,
      id: `${topic.id}-pyq-${pyqIndex}`,
      question: `Viva follow-up: ${pyq.question}`,
      repeated: pyq.repeated,
    }));
    return prompts;
  })));
}

export default function ExamVivaPage() {
  const { user } = useAuth();
  const { semester, completedTopics, toggleTopic } = useProgress();
  const subjects = getSemester(semester)?.subjects.filter((subject) => !subject.isLab) ?? [];
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [activeTab, setActiveTab] = useState("revision");
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showReference, setShowReference] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, VivaStatus>>({});

  const storageKey = `sankalp-viva-status-${user?.id ?? "student"}`;
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setStatuses(stored ? JSON.parse(stored) as Record<string, VivaStatus> : {});
    } catch {
      setStatuses({});
    }
  }, [storageKey]);

  const selectedSubjects = selectedSubject === "all"
    ? subjects
    : subjects.filter((subject) => subject.id === selectedSubject);
  const selectedSubjectData = subjects.find((subject) => subject.id === selectedSubject);
  const visibleUnits = selectedSubjectData?.units ?? [];

  const revisionTopics = useMemo(() => selectedSubjects.flatMap((subject) =>
    subject.units.filter((unit) => selectedUnit === "all" || unit.id === selectedUnit)
      .flatMap((unit) => unit.topics
        .filter((topic) => topic.important || unit.pyqs.some((pyq) => pyq.repeated >= 2))
        .map((topic) => ({
          ...topic,
          subjectId: subject.id,
          subjectName: subject.name,
          unitId: unit.id,
          unitName: unit.name,
          weightage: unit.weightage,
          repeated: Math.max(0, ...unit.pyqs.map((pyq) => pyq.repeated)),
          relatedPyq: unit.pyqs.find((pyq) => pyq.repeated >= 2)?.question,
        })),
  ).sort((a, b) => Number(completedTopics[a.id]) - Number(completedTopics[b.id]) || b.repeated - a.repeated || b.weightage - a.weightage), [selectedSubjects, selectedUnit, completedTopics]);

  const vivaPrompts = useMemo(() => buildVivaPrompts(selectedSubjects)
    .filter((prompt) => selectedUnit === "all" || selectedSubjects.some((subject) =>
      subject.units.some((unit) => unit.id === selectedUnit && unit.name === prompt.unitName),
    )), [selectedSubjects, selectedUnit]);
  const activePrompt = vivaPrompts[currentPrompt];
  const confidentCount = vivaPrompts.filter((prompt) => statuses[prompt.id] === "confident").length;
  const practiceCount = vivaPrompts.filter((prompt) => statuses[prompt.id] === "practice").length;
  const completedRevisionCount = revisionTopics.filter((topic) => completedTopics[topic.id]).length;
  const revisionPercent = revisionTopics.length ? Math.round((completedRevisionCount / revisionTopics.length) * 100) : 0;
  const dayBlocks = Array.from({ length: 6 }, (_, index) => ({
    number: index + 1,
    topics: revisionTopics.filter((_, topicIndex) => topicIndex % 6 === index),
  })).filter((block) => block.topics.length > 0);

  const saveStatus = (promptId: string, status: VivaStatus) => {
    const next = { ...statuses, [promptId]: status };
    setStatuses(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    if (status === "confident" && activePrompt) toggleTopic(activePrompt.topicId);
    setAnswer("");
    setShowReference(false);
    setCurrentPrompt((index) => Math.min(index + 1, vivaPrompts.length - 1));
  };

  const changePrompt = (direction: number) => {
    setCurrentPrompt((index) => Math.max(0, Math.min(vivaPrompts.length - 1, index + direction)));
    setAnswer("");
    setShowReference(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Exam preparation</span>
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">Viva & one-day revision</h1>
          <p className="mt-1 text-sm text-muted-foreground">Semester {semester} · Focus on the topics that matter most in your syllabus.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-72">
          <Select value={selectedSubject} onValueChange={(value) => { setSelectedSubject(value); setSelectedUnit("all"); setCurrentPrompt(0); }}>
            <SelectTrigger aria-label="Filter by subject"><SelectValue placeholder="All subjects" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((subject) => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedUnit} onValueChange={(value) => { setSelectedUnit(value); setCurrentPrompt(0); }}>
            <SelectTrigger aria-label="Filter by unit"><SelectValue placeholder="All units" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All units</SelectItem>
              {visibleUnits.map((unit) => <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid h-auto w-full max-w-md grid-cols-2">
          <TabsTrigger value="revision" className="gap-2"><Clock3 className="h-4 w-4" />One-day revision</TabsTrigger>
          <TabsTrigger value="viva" className="gap-2"><Volume2 className="h-4 w-4" />Viva practice</TabsTrigger>
        </TabsList>

        <TabsContent value="revision" className="space-y-5">
          <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Important topics for a focused day</h2>
                  <p className="text-sm text-muted-foreground">Syllabus priority, repeated PYQs and your completion progress.</p>
                </div>
                <Badge variant="secondary">{completedRevisionCount}/{revisionTopics.length} done</Badge>
              </div>
              <Progress value={revisionPercent} aria-label={`${revisionPercent}% revision completed`} />
            </div>
            <Badge variant="outline" className="w-fit gap-1.5"><Clock3 className="h-3.5 w-3.5" />6 focused blocks · 50 min each</Badge>
          </section>

          {dayBlocks.length ? <div className="grid gap-4 lg:grid-cols-2">
            {dayBlocks.map((block) => (
              <Card key={block.number} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs text-primary">{block.number}</span>Study block {block.number}</span>
                    <Badge variant="outline">50 min + break</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {block.topics.map((topic) => (
                    <div key={topic.id} className="flex items-start gap-3 border-t pt-3 first:border-0 first:pt-0">
                      <Checkbox
                        checked={Boolean(completedTopics[topic.id])}
                        onCheckedChange={() => toggleTopic(topic.id)}
                        aria-label={`Mark ${topic.name} as ${completedTopics[topic.id] ? "not completed" : "completed"}`}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${completedTopics[topic.id] ? "text-muted-foreground line-through" : ""}`}>{topic.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{topic.subjectName} · {topic.unitName}</p>
                        {topic.relatedPyq && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">PYQ focus: {topic.relatedPyq}</p>}
                      </div>
                      {topic.important && <Badge className="shrink-0 gap-1"><Star className="h-3 w-3" />Priority</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div> : <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No syllabus topics match these filters.</CardContent></Card>}
          <p className="text-xs text-muted-foreground">Priority is a revision aid based on the available syllabus and PYQ data, not a prediction of exam questions.</p>
        </TabsContent>

        <TabsContent value="viva" className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card><CardContent className="flex items-center gap-3 p-4"><BookOpenCheck className="h-5 w-5 text-primary" /><div><p className="text-xl font-semibold">{vivaPrompts.length}</p><p className="text-xs text-muted-foreground">Practice prompts</p></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4"><Check className="h-5 w-5 text-primary" /><div><p className="text-xl font-semibold">{confidentCount}</p><p className="text-xs text-muted-foreground">Confident</p></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4"><RotateCcw className="h-5 w-5 text-muted-foreground" /><div><p className="text-xl font-semibold">{practiceCount}</p><p className="text-xs text-muted-foreground">Practice again</p></div></CardContent></Card>
          </div>

          {activePrompt ? <Card>
            <CardHeader className="gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge variant="outline">{activePrompt.subjectName} · {activePrompt.unitName}</Badge>
                <CardTitle className="mt-3 text-base">Question {currentPrompt + 1} of {vivaPrompts.length}</CardTitle>
              </div>
              {activePrompt.repeated > 1 && <Badge variant="secondary">PYQ · repeated {activePrompt.repeated}×</Badge>}
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <p className="text-lg font-medium leading-relaxed">{activePrompt.question}</p>
              <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Speak your answer aloud or write a few key points…" aria-label="Your viva answer" className="min-h-28 resize-y" />
              {showReference && <div className="rounded-md bg-muted/60 p-4">
                <p className="mb-2 text-sm font-semibold">Reference points</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {activePrompt.referencePoints.map((point, index) => <li key={`${point}-${index}`}>{point}</li>)}
                </ul>
              </div>}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => changePrompt(-1)} disabled={currentPrompt === 0} aria-label="Previous viva prompt"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" onClick={() => changePrompt(1)} disabled={currentPrompt >= vivaPrompts.length - 1} aria-label="Next viva prompt"><ChevronRight className="h-4 w-4" /></Button>
                  <Button variant="ghost" onClick={() => setShowReference((show) => !show)}>{showReference ? "Hide reference" : "Reveal reference"}</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => activePrompt && saveStatus(activePrompt.id, "practice")}><RotateCcw className="mr-2 h-4 w-4" />Practice again</Button>
                  <Button onClick={() => activePrompt && saveStatus(activePrompt.id, "confident")}><Check className="mr-2 h-4 w-4" />I know this</Button>
                </div>
              </div>
            </CardContent>
          </Card> : <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No viva prompts match these filters.</CardContent></Card>}
          <p className="text-xs text-muted-foreground">Prompts are built from the current semester’s syllabus and PYQs. Reference points summarize available unit notes; use them to self-check, not as automatic grading.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}