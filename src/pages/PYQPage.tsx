import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye } from "lucide-react";
import { useState } from "react";

const pyqData = [
  { semester: 2, label: "Semester 2", file: "/pyqs/2nd_sem_pyqs.pdf" },
  { semester: 3, label: "Semester 3", file: "/pyqs/PYQ_sem_3.pdf" },
  { semester: 4, label: "Semester 4", file: "/pyqs/PYQs_Semester_4th.pdf" },
  { semester: 5, label: "Semester 5", file: "/pyqs/PYQs_Semester_5th.pdf" },
];

const COLORS = [
  "hsl(var(--sankalp-blue))",
  "hsl(var(--sankalp-green))",
  "hsl(var(--sankalp-amber))",
  "hsl(var(--sankalp-red))",
];

export default function PYQPage() {
  const [viewing, setViewing] = useState<string | null>(null);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Previous Year Questions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Practice with past exam papers to boost your preparation
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {pyqData.map((pyq, i) => (
          <Card
            key={pyq.semester}
            className="shadow-sm border-0 hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: COLORS[i % COLORS.length] + "18", color: COLORS[i % COLORS.length] }}
                >
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{pyq.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Previous year question papers
                  </p>
                  <div className="flex gap-2 mt-3">
                    <a
                      href={pyq.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View PDF
                    </a>
                    <a
                      href={pyq.file}
                      download={`PYQ_${pyq.label.replace(/\s+/g, "_")}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </div>
              {viewing === pyq.file && (
                <div className="mt-4 rounded-lg overflow-hidden border bg-muted/30 animate-fade-in-up">
                  <iframe
                    src={pyq.file}
                    className="w-full h-[500px]"
                    title={`PYQ ${pyq.label}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
