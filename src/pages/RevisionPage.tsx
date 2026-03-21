import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, RotateCcw, Zap } from "lucide-react";
import { useMemo } from "react";

export default function RevisionPage() {
  const { semester, completedTopics } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];

  const revisionData = useMemo(() => {
    return subjects.map(sub => {
      const importantTopics = sub.units.flatMap(u =>
        u.topics
          .filter(t => t.important && !completedTopics[t.id])
          .map(t => ({ ...t, unitName: u.name, weightage: u.weightage }))
      );
      const repeatedPyqs = sub.units.flatMap(u =>
        u.pyqs
          .filter(p => p.repeated >= 3)
          .map(p => ({ ...p, unitName: u.name }))
      );
      return { subject: sub, importantTopics, repeatedPyqs };
    }).filter(d => d.importantTopics.length > 0 || d.repeatedPyqs.length > 0);
  }, [subjects, completedTopics]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-sankalp-amber" />
          Last Minute Revision
        </h1>
        <p className="text-muted-foreground mt-1">Important topics & most repeated PYQs</p>
      </div>

      {revisionData.length === 0 ? (
        <Card className="shadow-sm animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">All important topics completed! 🎉</p>
          </CardContent>
        </Card>
      ) : (
        revisionData.map((data, i) => (
          <Card key={data.subject.id} className="shadow-sm animate-fade-in-up" style={{ animationDelay: `${80 + i * 80}ms` }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{data.subject.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.importantTopics.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Star className="h-3 w-3 text-sankalp-amber" /> Important Topics
                  </p>
                  <div className="space-y-1.5">
                    {data.importantTopics.map(t => (
                      <div key={t.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                        <span className="flex-1">{t.name}</span>
                        <Badge variant="outline" className="text-[10px]">{t.unitName.replace("Unit ", "U")}</Badge>
                        <Badge variant="outline" className="text-[10px]">{t.weightage}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.repeatedPyqs.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <RotateCcw className="h-3 w-3 text-sankalp-red" /> Most Repeated Questions
                  </p>
                  <div className="space-y-1.5">
                    {data.repeatedPyqs.map((p, pi) => (
                      <div key={pi} className="text-sm p-2 rounded bg-muted/50 space-y-1">
                        <p>{p.question}</p>
                        <div className="flex gap-1.5">
                          <Badge variant="outline" className="text-[10px]">{p.marks} marks</Badge>
                          <Badge className="text-[10px] bg-sankalp-red-light text-sankalp-red border-0">
                            {p.repeated}x repeated
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
