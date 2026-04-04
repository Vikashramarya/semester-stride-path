import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle, Send, ThumbsUp, ChevronDown, ChevronUp, Trash2, Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Doubt {
  id: string;
  user_id: string;
  user_name: string;
  subject: string;
  question: string;
  created_at: string;
}

interface Answer {
  id: string;
  doubt_id: string;
  user_id: string;
  user_name: string;
  answer: string;
  upvotes: number;
  created_at: string;
}

export default function DoubtHubPage() {
  const { user } = useAuth();
  const { semester, userName } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];

  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedDoubt, setExpandedDoubt] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [filterSubject, setFilterSubject] = useState("all");

  const fetchDoubts = useCallback(async () => {
    const { data } = await supabase.from("doubts").select("*").order("created_at", { ascending: false });
    setDoubts((data as Doubt[]) || []);
    setLoading(false);
  }, []);

  const fetchAnswers = useCallback(async (doubtId: string) => {
    const { data } = await supabase.from("doubt_answers").select("*").eq("doubt_id", doubtId).order("upvotes", { ascending: false });
    setAnswers(prev => ({ ...prev, [doubtId]: (data as Answer[]) || [] }));

    // Fetch user's upvotes for these answers
    if (user && data) {
      const answerIds = data.map(a => a.id);
      if (answerIds.length > 0) {
        const { data: upvotes } = await supabase.from("doubt_upvotes").select("answer_id").eq("user_id", user.id).in("answer_id", answerIds);
        if (upvotes) {
          setUserUpvotes(prev => {
            const next = new Set(prev);
            upvotes.forEach(u => next.add(u.answer_id));
            return next;
          });
        }
      }
    }
  }, [user]);

  useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel("doubts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "doubts" }, () => fetchDoubts())
      .on("postgres_changes", { event: "*", schema: "public", table: "doubt_answers" }, (payload) => {
        if (payload.new && typeof payload.new === "object" && "doubt_id" in payload.new) {
          fetchAnswers(payload.new.doubt_id as string);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchDoubts, fetchAnswers]);

  const postDoubt = async () => {
    if (!newQuestion.trim() || !newSubject || !user) return;
    setPosting(true);
    const { error } = await supabase.from("doubts").insert({
      user_id: user.id,
      user_name: userName || "Anonymous",
      subject: newSubject,
      question: newQuestion.trim(),
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setNewQuestion(""); toast({ title: "Doubt posted!" }); }
    setPosting(false);
  };

  const postAnswer = async (doubtId: string) => {
    const text = answerText[doubtId]?.trim();
    if (!text || !user) return;
    const { error } = await supabase.from("doubt_answers").insert({
      doubt_id: doubtId,
      user_id: user.id,
      user_name: userName || "Anonymous",
      answer: text,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setAnswerText(prev => ({ ...prev, [doubtId]: "" }));
      fetchAnswers(doubtId);
    }
  };

  const toggleUpvote = async (answerId: string, doubtId: string) => {
    if (!user) return;
    const hasUpvoted = userUpvotes.has(answerId);
    if (hasUpvoted) {
      await supabase.from("doubt_upvotes").delete().eq("answer_id", answerId).eq("user_id", user.id);
      await supabase.from("doubt_answers").update({ upvotes: Math.max(0, (answers[doubtId]?.find(a => a.id === answerId)?.upvotes || 1) - 1) }).eq("id", answerId);
      setUserUpvotes(prev => { const n = new Set(prev); n.delete(answerId); return n; });
    } else {
      await supabase.from("doubt_upvotes").insert({ answer_id: answerId, user_id: user.id });
      await supabase.from("doubt_answers").update({ upvotes: (answers[doubtId]?.find(a => a.id === answerId)?.upvotes || 0) + 1 }).eq("id", answerId);
      setUserUpvotes(prev => new Set(prev).add(answerId));
    }
    fetchAnswers(doubtId);
  };

  const deleteDoubt = async (id: string) => {
    await supabase.from("doubts").delete().eq("id", id);
    fetchDoubts();
  };

  const toggleExpand = (id: string) => {
    if (expandedDoubt === id) {
      setExpandedDoubt(null);
    } else {
      setExpandedDoubt(id);
      if (!answers[id]) fetchAnswers(id);
    }
  };

  const filteredDoubts = filterSubject === "all" ? doubts : doubts.filter(d => d.subject === filterSubject);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-sankalp-blue-light flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-sankalp-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Doubt Hub</h1>
          <p className="text-sm text-muted-foreground">Ask doubts, help classmates, learn together</p>
        </div>
      </div>

      {/* Post doubt */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-3">
            <Select value={newSubject} onValueChange={setNewSubject}>
              <SelectTrigger className="w-[180px] h-9 text-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your doubt here..."
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              className="min-h-[60px] text-sm resize-none"
            />
            <Button onClick={postDoubt} disabled={posting || !newQuestion.trim() || !newSubject} className="shrink-0 self-end">
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Doubts list */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filteredDoubts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No doubts yet. Be the first to ask!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDoubts.map(doubt => {
            const isExpanded = expandedDoubt === doubt.id;
            const doubtAnswers = answers[doubt.id] || [];
            const isOwn = doubt.user_id === user?.id;
            return (
              <Card key={doubt.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                      {doubt.user_name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{doubt.user_name}</span>
                        <Badge variant="secondary" className="text-[10px]">{doubt.subject}</Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(doubt.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="text-sm">{doubt.question}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleExpand(doubt.id)}>
                          {isExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                          {doubtAnswers.length > 0 ? `${doubtAnswers.length} answers` : "Answer"}
                        </Button>
                        {isOwn && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => deleteDoubt(doubt.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Answers */}
                  {isExpanded && (
                    <div className="mt-4 ml-11 space-y-3 border-l-2 border-border pl-4">
                      {doubtAnswers.map(ans => (
                        <div key={ans.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{ans.user_name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(ans.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{ans.answer}</p>
                          <Button
                            variant="ghost" size="sm"
                            className={`h-6 text-[10px] gap-1 ${userUpvotes.has(ans.id) ? "text-primary" : "text-muted-foreground"}`}
                            onClick={() => toggleUpvote(ans.id, doubt.id)}
                          >
                            <ThumbsUp className="h-3 w-3" /> {ans.upvotes}
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Write your answer..."
                          value={answerText[doubt.id] || ""}
                          onChange={e => setAnswerText(prev => ({ ...prev, [doubt.id]: e.target.value }))}
                          className="h-8 text-sm"
                          onKeyDown={e => { if (e.key === "Enter") postAnswer(doubt.id); }}
                        />
                        <Button size="sm" className="h-8" onClick={() => postAnswer(doubt.id)}>
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
