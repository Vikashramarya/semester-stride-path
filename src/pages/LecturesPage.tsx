import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllLectures,
  ytThumb,
  ytWatchUrl,
  ytEmbedUrl,
  type LecturePlaylist,
} from "@/data/lectures";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ExternalLink,
  Play,
  Video,
  AlertTriangle,
  Search,
  CheckCircle2,
  Circle,
  ListVideo,
} from "lucide-react";

const WATCHED_KEY = "sankalp:watched-lectures";

const loadWatched = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(WATCHED_KEY) || "{}");
  } catch {
    return {};
  }
};

interface ActivePlaylist extends LecturePlaylist {
  subjectName: string;
}

export default function LecturesPage() {
  const navigate = useNavigate();
  const allLectures = getAllLectures();

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [active, setActive] = useState<ActivePlaylist | null>(null);
  const [embedErr, setEmbedErr] = useState(false);
  const [thumbErr, setThumbErr] = useState<Record<string, boolean>>({});
  const [watched, setWatched] = useState<Record<string, boolean>>(loadWatched);

  const toggleWatched = (id: string) => {
    setWatched((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(WATCHED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allLectures
      .filter((s) => subjectFilter === "all" || s.subjectId === subjectFilter)
      .map((s) => ({
        ...s,
        units: s.units.filter((u) => {
          if (unitFilter !== "all" && String(u.unitNumber) !== unitFilter) return false;
          if (!q) return true;
          return (
            u.title.toLowerCase().includes(q) ||
            s.subjectName.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((s) => s.units.length > 0);
  }, [allLectures, search, subjectFilter, unitFilter]);

  const totalUnits = allLectures.reduce((n, s) => n + s.units.length, 0);
  const watchedCount = Object.values(watched).filter(Boolean).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="shrink-0 transition-transform hover:-translate-x-0.5"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Lecture Videos
          </h1>
          <p className="text-sm text-muted-foreground">
            University-aligned playlists, unit-wise • {watchedCount}/{totalUnits} watched
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto] animate-fade-in">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subject or unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="md:w-[200px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {allLectures.map((s) => (
              <SelectItem key={s.subjectId} value={s.subjectId}>
                {s.subjectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="md:w-[140px]">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All units</SelectItem>
            {[1, 2, 3, 4].map((u) => (
              <SelectItem key={u} value={String(u)}>
                Unit {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="shadow-sm border-0">
          <CardContent className="p-8 text-center text-muted-foreground">
            No lectures match your filters.
          </CardContent>
        </Card>
      ) : (
        filtered.map((sub) => (
          <section key={sub.subjectId} className="space-y-3 animate-fade-in">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">{sub.subjectName}</h2>
              <span className="text-xs text-muted-foreground">
                {sub.units.length} unit{sub.units.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sub.units.map((u, i) => {
                const isWatched = !!watched[u.id];
                return (
                  <Card
                    key={u.id}
                    className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div
                      className="relative aspect-video bg-muted overflow-hidden cursor-pointer"
                      onClick={() => {
                        setEmbedErr(false);
                        setActive({ ...u, subjectName: sub.subjectName });
                      }}
                    >
                      {!thumbErr[u.id] ? (
                        <img
                          src={ytThumb(u.videoId)}
                          alt={u.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={() =>
                            setThumbErr((p) => ({ ...p, [u.id]: true }))
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                          <AlertTriangle className="h-6 w-6" />
                          <p className="text-[10px]">Preview unavailable</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-primary/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                          <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0.5 border-0">
                        Unit {u.unitNumber}
                      </Badge>
                      {u.playlistId && (
                        <Badge className="absolute bottom-2 right-2 bg-foreground/80 text-background text-[10px] px-1.5 py-0.5 border-0">
                          <ListVideo className="h-2.5 w-2.5 mr-1" />
                          Playlist
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {u.title}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="premium"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            window.open(ytWatchUrl(u.videoId, u.playlistId), "_blank")
                          }
                        >
                          <ListVideo className="h-3.5 w-3.5" />
                          Watch Playlist
                        </Button>
                        <Button
                          variant={isWatched ? "default" : "outline"}
                          size="icon"
                          onClick={() => toggleWatched(u.id)}
                          title={isWatched ? "Mark as unwatched" : "Mark as watched"}
                          className="shrink-0"
                        >
                          {isWatched ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))
      )}

      {/* Embedded player */}
      <Dialog
        open={!!active}
        onOpenChange={(o) => {
          if (!o) {
            setActive(null);
            setEmbedErr(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-base pr-6">{active?.title}</DialogTitle>
            <p className="text-xs text-muted-foreground">{active?.subjectName}</p>
          </DialogHeader>
          <div className="relative aspect-video bg-black">
            {active && !embedErr ? (
              <iframe
                key={active.id}
                src={ytEmbedUrl(active.videoId, active.playlistId)}
                title={active.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={() => setEmbedErr(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white">
                <AlertTriangle className="h-10 w-10 text-amber-400" />
                <p className="text-sm font-medium">Video not available</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 p-3 border-t bg-card">
            <Button
              variant={active && watched[active.id] ? "default" : "outline"}
              size="sm"
              onClick={() => active && toggleWatched(active.id)}
            >
              {active && watched[active.id] ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Watched
                </>
              ) : (
                <>
                  <Circle className="h-3.5 w-3.5" /> Mark as Watched
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                active && window.open(ytWatchUrl(active.videoId, active.playlistId), "_blank")
              }
            >
              Open on YouTube <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
