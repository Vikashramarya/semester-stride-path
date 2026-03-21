import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, X, Star, RotateCcw, FileText, BookOpen, StickyNote } from "lucide-react";
import { useState } from "react";

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { semester, completedTopics, toggleTopic, isTopicCompleted, userNotes, addNote, removeNote, getSubjectProgress } = useProgress();
  const semData = getSemester(semester);
  const subject = semData?.subjects.find(s => s.id === id);
  const [newNote, setNewNote] = useState<Record<string, string>>({});

  if (!subject) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Subject not found</p>
        <Button variant="ghost" onClick={() => navigate("/")} className="mt-4">Go back</Button>
      </div>
    );
  }

  const allTopicIds = subject.units.flatMap(u => u.topics.map(t => t.id));
  const progress = getSubjectProgress(subject.id, allTopicIds);

  const handleAddNote = (unitId: string) => {
    const note = newNote[unitId]?.trim();
    if (note) {
      addNote(unitId, note);
      setNewNote(prev => ({ ...prev, [unitId]: "" }));
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold truncate">{subject.name}</h1>
          <p className="text-sm text-muted-foreground">{subject.code} · Semester {semester}</p>
        </div>
        <Badge className="ml-auto shrink-0">{progress}%</Badge>
      </div>

      <Progress value={progress} className="h-2 animate-fade-in-up" style={{ animationDelay: "60ms" }} />

      {/* Units */}
      {subject.units.map((unit, ui) => {
        const unitTopicIds = unit.topics.map(t => t.id);
        const unitDone = unitTopicIds.filter(id => completedTopics[id]).length;
        const unitProgress = unitTopicIds.length > 0 ? Math.round((unitDone / unitTopicIds.length) * 100) : 0;
        const allNotes = [...unit.notes, ...(userNotes[unit.id] || [])];

        return (
          <Card key={unit.id} className="shadow-sm animate-fade-in-up" style={{ animationDelay: `${120 + ui * 80}ms` }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{unit.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={unit.weightage >= 25 ? "default" : "secondary"} className="text-xs">
                    {unit.weightage}% weightage
                  </Badge>
                </div>
              </div>
              <Progress value={unitProgress} className="h-1.5 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{unitDone}/{unitTopicIds.length} topics completed</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="topics" className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-9">
                  <TabsTrigger value="topics" className="text-xs gap-1">
                    <BookOpen className="h-3 w-3" /> Topics
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs gap-1">
                    <StickyNote className="h-3 w-3" /> Notes
                  </TabsTrigger>
                  <TabsTrigger value="pyqs" className="text-xs gap-1">
                    <FileText className="h-3 w-3" /> PYQs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="topics" className="mt-3 space-y-2">
                  {unit.topics.map(topic => (
                    <label
                      key={topic.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={isTopicCompleted(topic.id)}
                        onCheckedChange={() => toggleTopic(topic.id)}
                      />
                      <span className={`text-sm flex-1 ${isTopicCompleted(topic.id) ? "line-through text-muted-foreground" : ""}`}>
                        {topic.name}
                      </span>
                      {topic.important && (
                        <Star className="h-3.5 w-3.5 text-sankalp-amber fill-sankalp-amber shrink-0" />
                      )}
                    </label>
                  ))}
                </TabsContent>

                <TabsContent value="notes" className="mt-3 space-y-3">
                  <ul className="space-y-1.5">
                    {allNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span className="flex-1">{note}</span>
                        {i >= unit.notes.length && (
                          <Button
                            variant="ghost" size="icon" className="h-6 w-6 shrink-0"
                            onClick={() => removeNote(unit.id, i - unit.notes.length)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a note..."
                      value={newNote[unit.id] || ""}
                      onChange={e => setNewNote(prev => ({ ...prev, [unit.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleAddNote(unit.id)}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" className="h-8 px-3" onClick={() => handleAddNote(unit.id)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="pyqs" className="mt-3 space-y-2">
                  {unit.pyqs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No PYQs available yet.</p>
                  ) : (
                    unit.pyqs.map((pyq, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-1">
                        <p className="text-sm font-medium">{pyq.question}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{pyq.year}</Badge>
                          <Badge variant="outline" className="text-[10px]">{pyq.marks} marks</Badge>
                          {pyq.repeated >= 3 && (
                            <Badge className="text-[10px] bg-sankalp-red-light text-sankalp-red border-0">
                              <RotateCcw className="h-2.5 w-2.5 mr-1" />
                              Repeated {pyq.repeated}x
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
