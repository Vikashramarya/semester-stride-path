import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, CheckCircle2, XCircle, Loader2, RotateCcw, Trophy } from "lucide-react";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function QuizPage() {
  const { semester } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter((s) => !s.isLab) || [];

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const subject = subjects.find((s) => s.id === selectedSubject);
  const units = subject?.units || [];

  const generateQuiz = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setFinished(false);
    setSelected(null);
    setAnswered(false);

    const subName = subject?.name || selectedSubject;
    const unitName = units.find((u) => u.id === selectedUnit)?.name || "";
    const topicContext = unitName ? `Unit: ${unitName}` : "all units";

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          mode: "quiz",
          messages: [
            {
              role: "user",
              content: `Generate a quiz for subject: ${subName}, ${topicContext}. Make questions relevant to B.Tech CSE semester exams.`,
            },
          ],
        },
      });

      if (error) throw error;

      const content = data?.content || "";
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid quiz format");

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.questions || parsed.questions.length === 0) throw new Error("No questions generated");

      setQuestions(parsed.questions);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate quiz. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === questions[currentQ].correct) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setFinished(false);
    setSelected(null);
    setAnswered(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Quiz Mode</h1>
          <p className="text-xs text-muted-foreground">AI-generated quizzes to test your knowledge</p>
        </div>
      </div>

      {/* Subject / Unit selector */}
      {questions.length === 0 && !loading && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
                <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); setSelectedUnit(""); }}>
                  <SelectTrigger><SelectValue placeholder="Pick a subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Unit (optional)</label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={!selectedSubject}>
                  <SelectTrigger><SelectValue placeholder="All units" /></SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={generateQuiz} disabled={!selectedSubject} className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              Generate Quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating quiz questions...</p>
          </CardContent>
        </Card>
      )}

      {/* Quiz in progress */}
      {questions.length > 0 && !finished && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              Question {currentQ + 1} / {questions.length}
            </Badge>
            <Badge variant="outline">Score: {score}</Badge>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base leading-relaxed">
                {questions[currentQ].question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {questions[currentQ].options.map((opt, idx) => {
                const isCorrect = idx === questions[currentQ].correct;
                const isSelected = idx === selected;
                let optClass = "border bg-card hover:bg-muted/50 cursor-pointer";
                if (answered) {
                  if (isCorrect) optClass = "border-2 border-primary bg-primary/5";
                  else if (isSelected && !isCorrect) optClass = "border-2 border-destructive bg-destructive/5";
                  else optClass = "border bg-card opacity-50";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={answered}
                    className={`w-full text-left p-3 rounded-lg text-sm flex items-center gap-3 transition-all ${optClass}`}
                  >
                    <span className="h-6 w-6 rounded-full border flex items-center justify-center text-xs font-medium shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt.replace(/^[A-D]\)\s*/, "")}</span>
                    {answered && isCorrect && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                    {answered && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                  </button>
                );
              })}

              {answered && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
                  <p className="font-medium text-xs text-muted-foreground mb-1">Explanation</p>
                  <p>{questions[currentQ].explanation}</p>
                </div>
              )}

              {answered && (
                <Button onClick={nextQuestion} className="w-full mt-2">
                  {currentQ + 1 >= questions.length ? "View Results" : "Next Question"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {finished && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Quiz Complete!</h2>
            <p className="text-3xl font-bold text-primary">
              {score} / {questions.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {score === questions.length
                ? "Perfect score! 🎉"
                : score >= questions.length * 0.6
                ? "Good job! Keep practicing 💪"
                : "Keep studying, you'll improve! 📚"}
            </p>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={resetQuiz}>
                <RotateCcw className="h-4 w-4 mr-2" />
                New Quiz
              </Button>
              <Button onClick={generateQuiz}>
                <Brain className="h-4 w-4 mr-2" />
                Retry Same
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
