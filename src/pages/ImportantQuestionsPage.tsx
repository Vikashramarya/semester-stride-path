import { useState, useMemo, useCallback } from "react";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Star, Search, BookmarkCheck, CheckCircle2, Filter, Sparkles, Repeat, CalendarClock, TrendingUp,
} from "lucide-react";

interface BookmarkState {
  bookmarked: Record<string, boolean>;
  completed: Record<string, boolean>;
}

const STORAGE_KEY = "sankalp-imp-questions";

function loadState(): BookmarkState {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : { bookmarked: {}, completed: {} };
  } catch { return { bookmarked: {}, completed: {} }; }
}

function getTag(repeated: number, year: number) {
  const currentYear = new Date().getFullYear();
  const tags: { label: string; color: string; icon: typeof Repeat }[] = [];
  if (repeated >= 3) tags.push({ label: "Most Repeated", color: "bg-destructive/15 text-destructive", icon: Repeat });
  else if (repeated >= 2) tags.push({ label: "High Probability", color: "bg-sankalp-amber-light text-sankalp-amber", icon: TrendingUp });
  if (year >= currentYear - 1) tags.push({ label: "Last Year Asked", color: "bg-sankalp-blue-light text-sankalp-blue", icon: CalendarClock });
  return tags;
}

export default function ImportantQuestionsPage() {
  const { semester } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];

  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [state, setState] = useState<BookmarkState>(loadState);

  const save = useCallback((next: BookmarkState) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggleBookmark = (id: string) => {
    save({ ...state, bookmarked: { ...state.bookmarked, [id]: !state.bookmarked[id] } });
  };
  const toggleCompleted = (id: string) => {
    save({ ...state, completed: { ...state.completed, [id]: !state.completed[id] } });
  };

  const allQuestions = useMemo(() => {
    const qs: { id: string; question: string; year: number; marks: number; repeated: number; subject: string; unit: string; unitId: string }[] = [];
    const filteredSubs = selectedSubject === "all" ? subjects : subjects.filter(s => s.id === selectedSubject);
    filteredSubs.forEach(sub => {
      sub.units.forEach(unit => {
        if (selectedUnit !== "all" && unit.id !== selectedUnit) return;
        unit.pyqs.forEach((pyq, idx) => {
          qs.push({
            id: `${unit.id}-pyq-${idx}`,
            question: pyq.question,
            year: pyq.year,
            marks: pyq.marks,
            repeated: pyq.repeated,
            subject: sub.name,
            unit: unit.name,
            unitId: unit.id,
          });
        });
      });
    });
    return qs;
  }, [subjects, selectedSubject, selectedUnit]);

  const filteredQuestions = useMemo(() => {
    let qs = allQuestions;
    if (search) {
      const q = search.toLowerCase();
      qs = qs.filter(x => x.question.toLowerCase().includes(q) || x.subject.toLowerCase().includes(q));
    }
    if (filterTag === "most-repeated") qs = qs.filter(x => x.repeated >= 3);
    else if (filterTag === "high-probability") qs = qs.filter(x => x.repeated >= 2);
    else if (filterTag === "last-year") qs = qs.filter(x => x.year >= new Date().getFullYear() - 1);
    else if (filterTag === "bookmarked") qs = qs.filter(x => state.bookmarked[x.id]);
    // Sort: most repeated first
    return qs.sort((a, b) => b.repeated - a.repeated || b.year - a.year);
  }, [allQuestions, search, filterTag, state.bookmarked]);

  const currentSubject = subjects.find(s => s.id === selectedSubject);
  const units = currentSubject?.units || [];
  const completedCount = filteredQuestions.filter(q => state.completed[q.id]).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sankalp-amber-light flex items-center justify-center">
            <Star className="h-5 w-5 text-sankalp-amber" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Important Questions</h1>
            <p className="text-sm text-muted-foreground">PYQ-based high-probability questions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <Badge variant="secondary">{filteredQuestions.length} questions</Badge>
          <Badge className="bg-primary/15 text-primary border-0">{completedCount} completed</Badge>
          <Badge className="bg-sankalp-amber-light text-sankalp-amber border-0">
            {Object.values(state.bookmarked).filter(Boolean).length} bookmarked
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" /> Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={selectedSubject} onValueChange={v => { setSelectedSubject(v); setSelectedUnit("all"); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={selectedSubject === "all"}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Unit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Tag" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                <SelectItem value="most-repeated">Most Repeated</SelectItem>
                <SelectItem value="high-probability">High Probability</SelectItem>
                <SelectItem value="last-year">Last Year Asked</SelectItem>
                <SelectItem value="bookmarked">Bookmarked ⭐</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No questions found. Try changing filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((q, i) => {
            const tags = getTag(q.repeated, q.year);
            const isCompleted = state.completed[q.id];
            const isBookmarked = state.bookmarked[q.id];
            return (
              <Card key={q.id} className={`border-0 shadow-sm transition-all hover:shadow-md ${isCompleted ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <span className="text-xs font-bold text-muted-foreground w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className={`text-sm font-medium leading-relaxed ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {q.question}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-normal">{q.subject}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{q.year}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{q.marks}M</Badge>
                        {q.repeated > 1 && (
                          <Badge variant="secondary" className="text-[10px]">×{q.repeated} repeated</Badge>
                        )}
                        {tags.map(tag => (
                          <Badge key={tag.label} className={`text-[10px] border-0 ${tag.color}`}>
                            <tag.icon className="h-2.5 w-2.5 mr-1" />
                            {tag.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className={`h-8 w-8 ${isBookmarked ? "text-sankalp-amber" : "text-muted-foreground"}`}
                        onClick={() => toggleBookmark(q.id)}
                      >
                        <BookmarkCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className={`h-8 w-8 ${isCompleted ? "text-primary" : "text-muted-foreground"}`}
                        onClick={() => toggleCompleted(q.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
