import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, ExternalLink, Search, RefreshCw, FileText, AlertCircle } from "lucide-react";

interface Notice {
  title: string;
  url: string;
  date: string;
  isNew: boolean;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "result" | "exam" | "other">("all");

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("fetch-notices");
      if (fnError) throw fnError;
      if (data?.success) {
        setNotices(data.notices);
      } else {
        throw new Error(data?.error || "Failed to fetch notices");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const categorize = (title: string): "result" | "exam" | "other" => {
    const lower = title.toLowerCase();
    if (lower.includes("result") || lower.includes("re-evaluation") || lower.includes("re-checking")) return "result";
    if (lower.includes("exam") || lower.includes("date sheet") || lower.includes("re-appear") || lower.includes("schedule")) return "exam";
    return "other";
  };

  const filtered = notices.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const category = categorize(n.title);
    const matchesFilter = filter === "all" || category === filter;
    return matchesSearch && matchesFilter;
  });

  const categoryColors: Record<string, string> = {
    result: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    exam: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    other: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">University Notices</h1>
          <p className="text-xs text-muted-foreground">Gurugram University — Latest notifications</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={fetchNotices} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "result", "exam", "other"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "all" ? "All" : f === "result" ? "Results" : f === "exam" ? "Exams" : "Other"}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      {error && (
        <Card className="border-destructive/50">
          <CardContent className="py-6 flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No notices found</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((notice, i) => {
              const category = categorize(notice.title);
              return (
                <a
                  key={i}
                  href={notice.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="py-3 px-4 flex items-start gap-3">
                      <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${categoryColors[category]}`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {notice.title}
                          </p>
                          {notice.isNew && (
                            <Badge variant="destructive" className="shrink-0 text-[10px] px-1.5 py-0">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {notice.date && (
                            <span className="text-[11px] text-muted-foreground">{notice.date}</span>
                          )}
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryColors[category]}`}>
                            {category === "result" ? "Result" : category === "exam" ? "Exam" : "Notice"}
                          </Badge>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </a>
              );
            })
          )}
        </div>
      )}

      <p className="text-[11px] text-center text-muted-foreground">
        Source: <a href="https://gurugramuniversity.ac.in/allNotifications/allNotice/index.php" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Gurugram University Official Website</a>
      </p>
    </div>
  );
}
