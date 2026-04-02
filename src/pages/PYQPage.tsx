import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, Upload, Trash2, User, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface UploadedPYQ {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  semester: number;
  uploaded_by_name: string;
  created_at: string;
}

export default function PYQPage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadedPYQ[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("3");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    const { data } = await supabase
      .from("uploaded_pyqs")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUploads(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.name.endsWith(".pdf")) {
      toast({ title: "Only PDF files allowed", variant: "destructive" });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large (max 20MB)", variant: "destructive" });
      return;
    }

    setUploading(true);
    const filePath = `${user.id}/pyqs/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("student-uploads")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const displayName = user.user_metadata?.display_name || "Anonymous";

    const { error: dbError } = await supabase.from("uploaded_pyqs").insert({
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      semester: parseInt(selectedSemester),
      uploaded_by_name: displayName,
    });

    if (dbError) {
      toast({ title: "Failed to save record", variant: "destructive" });
    } else {
      toast({ title: "PYQ uploaded successfully!" });
      fetchUploads();
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (upload: UploadedPYQ) => {
    await supabase.storage.from("student-uploads").remove([upload.file_path]);
    await supabase.from("uploaded_pyqs").delete().eq("id", upload.id);
    toast({ title: "Deleted successfully" });
    fetchUploads();
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("student-uploads").getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Previous Year Questions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Practice with past exam papers to boost your preparation
        </p>
      </div>

      {/* Official PYQs */}
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
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  PDF
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Section */}
      {user && (
        <Card className="shadow-sm border-dashed border-2 animate-fade-in-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Share Your PYQ Papers</h3>
                <p className="text-xs text-muted-foreground">Help fellow students by uploading question papers (PDF only)</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
              </div>
              {uploading && <p className="text-xs text-muted-foreground self-center">Uploading...</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Uploads */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Community Shared PYQs</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {uploads.map((upload) => (
              <Card key={upload.id} className="shadow-sm hover:shadow-md transition-all animate-fade-in-up">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.file_name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{upload.uploaded_by_name}</span>
                        <span>·</span>
                        <Badge variant="outline" className="text-[10px]">Sem {upload.semester}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(upload.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <a
                          href={getFileUrl(upload.file_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Eye className="h-3 w-3" /> View
                        </a>
                        {user?.id === upload.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDelete(upload)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
