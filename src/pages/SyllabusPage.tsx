import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { BookOpen, CheckCircle2, Circle, ChevronDown, ChevronRight, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

export default function SyllabusPage() {
  const { semester, completedTopics, toggleTopic, isTopicCompleted } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});

  const toggleSubject = (id: string) =>
    setOpenSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleUnit = (id: string) =>
    setOpenUnits(prev => ({ ...prev, [id]: !prev[id] }));

  const getSubjectProgress = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return 0;
    const allTopics = subject.units.flatMap(u => u.topics);
    if (allTopics.length === 0) return 0;
    const done = allTopics.filter(t => isTopicCompleted(t.id)).length;
    return Math.round((done / allTopics.length) * 100);
  };

  const getUnitProgress = (topics: { id: string }[]) => {
    if (topics.length === 0) return 0;
    const done = topics.filter(t => isTopicCompleted(t.id)).length;
    return Math.round((done / topics.length) * 100);
  };

  // Check if syllabus PDF exists for current semester
  const hasPdf = semester === 1; // We have the uploaded PDF

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Syllabus</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Semester {semester} — {subjects.length} subjects
          </p>
        </div>
        {hasPdf && (
          <a href="/syllabus/Computer_Science_and_Engineering.pdf" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <FileDown className="h-4 w-4" />
              Download Full Syllabus
            </Button>
          </a>
        )}
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No syllabus available for Semester {semester}</p>
            <p className="text-sm mt-1">Switch to Semester 3, 4, or 5 to view subjects.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {subjects.map(subject => {
            const progress = getSubjectProgress(subject.id);
            const isOpen = openSubjects[subject.id] ?? false;

            return (
              <Card key={subject.id} className="overflow-hidden">
                <Collapsible open={isOpen} onOpenChange={() => toggleSubject(subject.id)}>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <div className="text-left">
                            <CardTitle className="text-base">{subject.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">{subject.code} · {subject.units.length} units</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-primary">{progress}%</span>
                          <Progress value={progress} className="w-24 h-2" />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      {subject.units.map(unit => {
                        const unitProgress = getUnitProgress(unit.topics);
                        const unitOpen = openUnits[unit.id] ?? true;

                        return (
                          <Collapsible key={unit.id} open={unitOpen} onOpenChange={() => toggleUnit(unit.id)}>
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                                <div className="flex items-center gap-2">
                                  {unitOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                  <span className="text-sm font-medium">{unit.name}</span>
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {unit.weightage}%
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">{unitProgress}%</span>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="ml-8 mt-1 space-y-1">
                                {unit.topics.map(topic => {
                                  const isDone = isTopicCompleted(topic.id);
                                  return (
                                    <button
                                      key={topic.id}
                                      onClick={() => toggleTopic(topic.id)}
                                      className="flex items-center gap-2 w-full text-left p-1.5 rounded-md hover:bg-muted/30 transition-colors group"
                                    >
                                      {isDone ? (
                                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                      ) : (
                                        <Circle className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary/50" />
                                      )}
                                      <span className={`text-sm ${isDone ? "line-through text-muted-foreground" : ""}`}>
                                        {topic.name}
                                      </span>
                                      {topic.important && (
                                        <Badge variant="destructive" className="text-[9px] px-1 py-0 ml-auto">
                                          IMP
                                        </Badge>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
