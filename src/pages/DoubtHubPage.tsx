import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle, Send, ArrowBigUp, ArrowBigDown, ChevronDown, ChevronUp, Trash2, Loader2,
  MessageSquare, Clock, Filter, TrendingUp, Sparkles,
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getAvatarColor(name: string) {
  const colors = [
    "from-primary to-accent",
    "from-sankalp-amber to-sankalp-red",
    "from-sankalp-green to-sankalp-cyan",
    "from-sankalp-blue to-primary",
    "from-sankalp-red to-sankalp-amber",
  ];
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
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
  const [sortBy, setSortBy] = useState<"new" | "hot">("new");

  const fetchDoubts = useCallback(async () => {
    const { data } = await supabase.from("doubts").select("*").order("created_at", { ascending: false });
    setDoubts((data as Doubt[]) || []);
    setLoading(false);
  }, []);

  const fetchAnswers = useCallback(async (doubtId: string) => {
    const { data } = await supabase.from("doubt_answers").select("*").eq("doubt_id", doubtId).order("upvotes", { ascending: false });
    setAnswers(prev => ({ ...prev, [doubtId]: (data as Answer[]) || [] }));

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
    else { setNewQuestion(""); toast({ title: "Doubt posted! 🎉" }); }
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

  const filteredDoubts = (filterSubject === "all" ? doubts : doubts.filter(d => d.subject === filterSubject));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl sankalp-gradient flex items-center justify-center shadow-lg animate-pulse-glow">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">Doubt Hub</h1>
            <p className="text-xs text-muted-foreground">Ask questions, share knowledge, grow together</p>
          </div>
        </div>
        <Badge className="glass text-xs border-0">{doubts.length} posts</Badge>
      </div>

      {/* Create Post — Reddit style */}
      <Card className="glass border-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarColor(userName)} flex items-center justify-center shrink-0`}>
              <span className="text-xs font-bold text-primary-foreground">{userName[0]?.toUpperCase()}</span>
            </div>
            <span className="text-sm font-medium">{userName}</span>
            <Sparkles className="h-3 w-3 text-sankalp-amber" />
          </div>
          <Textarea
            placeholder="What's your doubt? Be specific for better answers..."
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            className="min-h-[80px] text-sm resize-none bg-muted/30 border-0 focus:bg-muted/50 transition-colors rounded-xl"
          />
          <div className="flex items-center justify-between">
            <Select value={newSubject} onValueChange={setNewSubject}>
              <SelectTrigger className="w-[180px] h-8 text-xs glass border-0">
                <SelectValue placeholder="Choose subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={postDoubt}
              disabled={posting || !newQuestion.trim() || !newSubject}
              size="sm"
              className="h-8 rounded-xl sankalp-gradient border-0 text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Send className="h-3.5 w-3.5 mr-1.5" /> Post</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sort / Filter bar */}
      <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <Button
          variant={sortBy === "hot" ? "default" : "ghost"}
          size="sm"
          className={`h-8 text-xs rounded-xl ${sortBy === "hot" ? "sankalp-gradient text-primary-foreground border-0" : ""}`}
          onClick={() => setSortBy("hot")}
        >
          <TrendingUp className="h-3 w-3 mr-1" /> Hot
        </Button>
        <Button
          variant={sortBy === "new" ? "default" : "ghost"}
          size="sm"
          className={`h-8 text-xs rounded-xl ${sortBy === "new" ? "sankalp-gradient text-primary-foreground border-0" : ""}`}
          onClick={() => setSortBy("new")}
        >
          <Clock className="h-3 w-3 mr-1" /> New
        </Button>
        <div className="flex-1" />
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[140px] h-8 text-xs glass border-0">
            <Filter className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Doubts Feed */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filteredDoubts.length === 0 ? (
        <Card className="glass border-0 animate-fade-in-up">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-2xl glass mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No doubts yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Be the first to start a discussion!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDoubts.map((doubt, idx) => {
            const isExpanded = expandedDoubt === doubt.id;
            const doubtAnswers = answers[doubt.id] || [];
            const isOwn = doubt.user_id === user?.id;
            const avatarGradient = getAvatarColor(doubt.user_name);

            return (
              <Card
                key={doubt.id}
                className="glass border-0 overflow-hidden group animate-fade-in-up card-hover"
                style={{ animationDelay: `${(idx + 3) * 40}ms` }}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Reddit-style vote sidebar — for the whole post */}
                    <div className="flex flex-col items-center py-3 px-2 bg-muted/20 gap-0.5">
                      <button className="p-1 rounded hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary">
                        <ArrowBigUp className="h-5 w-5" />
                      </button>
                      <span className="text-xs font-bold tabular-nums text-muted-foreground">{doubtAnswers.length}</span>
                      <button className="p-1 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <ArrowBigDown className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Post body */}
                    <div className="flex-1 p-4 min-w-0">
                      {/* Meta line */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center shrink-0`}>
                          <span className="text-[10px] font-bold text-primary-foreground">{doubt.user_name[0]?.toUpperCase()}</span>
                        </div>
                        <span className="text-xs font-semibold">{doubt.user_name}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <Badge variant="secondary" className="text-[10px] h-5 rounded-md bg-primary/10 text-primary border-0">{doubt.subject}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> {timeAgo(doubt.created_at)}
                        </span>
                      </div>

                      {/* Question */}
                      <p className="text-sm leading-relaxed">{doubt.question}</p>

                      {/* Action bar */}
                      <div className="flex items-center gap-1 mt-3 -ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all"
                          onClick={() => toggleExpand(doubt.id)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          {doubtAnswers.length > 0 ? `${doubtAnswers.length} Answers` : "Answer"}
                          {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                        </Button>
                        {isOwn && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8"
                            onClick={() => deleteDoubt(doubt.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        )}
                      </div>

                      {/* Expanded answers — threaded */}
                      {isExpanded && (
                        <div className="mt-4 space-y-3 animate-fade-in">
                          {/* Answer input */}
                          <div className="flex gap-2 items-start">
                            <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${getAvatarColor(userName)} flex items-center justify-center shrink-0 mt-1`}>
                              <span className="text-[9px] font-bold text-primary-foreground">{userName[0]?.toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                              <Input
                                placeholder="Write your answer..."
                                value={answerText[doubt.id] || ""}
                                onChange={e => setAnswerText(prev => ({ ...prev, [doubt.id]: e.target.value }))}
                                className="h-9 text-sm bg-muted/30 border-0 rounded-xl focus:bg-muted/50 transition-colors"
                                onKeyDown={e => { if (e.key === "Enter") postAnswer(doubt.id); }}
                              />
                            </div>
                            <Button
                              size="sm"
                              className="h-9 rounded-xl sankalp-gradient border-0 text-primary-foreground"
                              onClick={() => postAnswer(doubt.id)}
                              disabled={!answerText[doubt.id]?.trim()}
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {/* Answer threads */}
                          {doubtAnswers.length > 0 && (
                            <div className="border-l-2 border-primary/20 ml-3 pl-4 space-y-3">
                              {doubtAnswers.map((ans, ansIdx) => {
                                const ansGradient = getAvatarColor(ans.user_name);
                                const isUpvoted = userUpvotes.has(ans.id);
                                return (
                                  <div
                                    key={ans.id}
                                    className="group/ans animate-fade-in-up"
                                    style={{ animationDelay: `${ansIdx * 50}ms` }}
                                  >
                                    <div className="flex items-start gap-2">
                                      {/* Vote controls inline */}
                                      <div className="flex flex-col items-center gap-0 shrink-0">
                                        <button
                                          className={`p-0.5 rounded transition-all duration-200 ${isUpvoted ? "text-primary scale-110" : "text-muted-foreground/50 hover:text-primary"}`}
                                          onClick={() => toggleUpvote(ans.id, doubt.id)}
                                        >
                                          <ArrowBigUp className="h-4 w-4" fill={isUpvoted ? "currentColor" : "none"} />
                                        </button>
                                        <span className={`text-[10px] font-bold tabular-nums ${isUpvoted ? "text-primary" : "text-muted-foreground"}`}>
                                          {ans.upvotes}
                                        </span>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${ansGradient} flex items-center justify-center`}>
                                            <span className="text-[8px] font-bold text-primary-foreground">{ans.user_name[0]?.toUpperCase()}</span>
                                          </div>
                                          <span className="text-[11px] font-semibold">{ans.user_name}</span>
                                          <span className="text-[10px] text-muted-foreground">· {timeAgo(ans.created_at)}</span>
                                          {ans.upvotes >= 3 && (
                                            <Badge className="text-[8px] h-4 bg-sankalp-amber/15 text-sankalp-amber border-0">Top Answer</Badge>
                                          )}
                                        </div>
                                        <p className="text-[13px] text-muted-foreground leading-relaxed">{ans.answer}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
