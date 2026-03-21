import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronLeft, FlaskConical } from "lucide-react";

export default function LabPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { semester } = useProgress();
  const semData = getSemester(semester);
  const lab = semData?.subjects.find(s => s.id === id && s.isLab);

  if (!lab) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Lab not found</p>
        <Button variant="ghost" onClick={() => navigate("/")} className="mt-4">Go back</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{lab.name}</h1>
          <p className="text-sm text-muted-foreground">{lab.code} · {lab.labPrograms?.length || 0} programs</p>
        </div>
      </div>

      <div className="space-y-3">
        {lab.labPrograms?.map((prog, i) => (
          <Card key={i} className="shadow-sm animate-fade-in-up" style={{ animationDelay: `${80 + i * 60}ms` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary" />
                {prog.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{prog.description}</p>
              <Accordion type="single" collapsible>
                <AccordionItem value="viva" className="border-0">
                  <AccordionTrigger className="text-sm py-2 hover:no-underline">
                    Viva Questions ({prog.vivaQuestions.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1.5">
                      {prog.vivaQuestions.map((q, qi) => (
                        <li key={qi} className="text-sm flex gap-2">
                          <Badge variant="outline" className="h-5 w-5 shrink-0 flex items-center justify-center p-0 text-[10px]">
                            {qi + 1}
                          </Badge>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
