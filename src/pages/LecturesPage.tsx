import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllLectures,
  ytThumb,
  ytWatchUrl,
  ytEmbedUrl,
  type LectureVideo,
} from "@/data/lectures";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  Clock,
  Video,
  AlertTriangle,
} from "lucide-react";

export default function LecturesPage() {
  const navigate = useNavigate();
  const allLectures = getAllLectures();
  const [activeSubject, setActiveSubject] = useState(
    allLectures[0]?.subjectId || ""
  );
  const [activeVideo, setActiveVideo] = useState<LectureVideo | null>(null);
  const [thumbErr, setThumbErr] = useState<Record<string, boolean>>({});
  const [embedErr, setEmbedErr] = useState(false);

  const openVideo = (lec: LectureVideo) => {
    setEmbedErr(false);
    setActiveVideo(lec);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="shrink-0 transition-transform hover:-translate-x-0.5"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Lecture Videos
          </h1>
          <p className="text-sm text-muted-foreground">
            Curated CSE lectures from Gate Smashers, Apna College, Telusko & more
          </p>
        </div>
      </div>

      {allLectures.length > 0 ? (
        <Tabs value={activeSubject} onValueChange={setActiveSubject}>
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {allLectures.map((sub) => (
              <TabsTrigger
                key={sub.subjectId}
                value={sub.subjectId}
                className="text-xs px-3 py-1.5 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {sub.subjectName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
                <span className="hidden md:inline ml-1">
                  - {sub.subjectName.split(" ").slice(0, 2).join(" ")}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {allLectures.map((sub) => (
            <TabsContent
              key={sub.subjectId}
              value={sub.subjectId}
              className="mt-4"
            >
              <div className="mb-3 animate-fade-in">
                <h2 className="text-lg font-semibold">{sub.subjectName}</h2>
                <p className="text-xs text-muted-foreground">
                  {sub.lectures.length} verified video lectures
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {sub.lectures.map((lecture, i) => (
                  <Card
                    key={lecture.id}
                    className="shadow-sm border-0 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer group animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={() => openVideo(lecture)}
                  >
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {!thumbErr[lecture.id] ? (
                        <img
                          src={ytThumb(lecture.videoId)}
                          alt={lecture.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={() =>
                            setThumbErr((p) => ({ ...p, [lecture.id]: true }))
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground bg-muted">
                          <AlertTriangle className="h-6 w-6" />
                          <p className="text-[10px]">Preview unavailable</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-primary/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                          <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      <Badge className="absolute bottom-2 right-2 bg-foreground/80 text-background text-[10px] px-1.5 py-0.5 border-0">
                        <Clock className="h-2.5 w-2.5 mr-1" />
                        {lecture.duration}
                      </Badge>
                      {lecture.topic && (
                        <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0.5 border-0">
                          {lecture.topic}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {lecture.title}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {lecture.channel}
                        </p>
                        <Play className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card className="shadow-sm border-0">
          <CardContent className="p-8 text-center text-muted-foreground">
            No lecture videos available for this semester.
          </CardContent>
        </Card>
      )}

      {/* Embedded video player with fallback */}
      <Dialog
        open={!!activeVideo}
        onOpenChange={(o) => {
          if (!o) {
            setActiveVideo(null);
            setEmbedErr(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-base pr-6">
              {activeVideo?.title}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {activeVideo?.channel} • {activeVideo?.duration}
            </p>
          </DialogHeader>
          <div className="relative aspect-video bg-black">
            {activeVideo && !embedErr ? (
              <iframe
                key={activeVideo.id}
                src={ytEmbedUrl(activeVideo.videoId)}
                title={activeVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={() => setEmbedErr(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white bg-foreground">
                <AlertTriangle className="h-10 w-10 text-amber-400" />
                <p className="text-sm font-medium">Video not available</p>
                <p className="text-xs text-white/70">
                  This video can't be embedded. You can still watch it on YouTube.
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 p-3 border-t bg-card">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeVideo) window.open(ytWatchUrl(activeVideo.videoId), "_blank");
              }}
              className="transition-all hover:translate-x-0.5"
            >
              Watch on YouTube <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
