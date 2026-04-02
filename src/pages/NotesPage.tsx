import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, StickyNote, BookOpen, Upload, FileText, Trash2, Eye, User, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UploadedNote {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  subject: string;
  unit_name: string;
  uploaded_by_name: string;
  created_at: string;
}

export default function NotesPage() {
  const { semester, userNotes, addNote, removeNote } = useProgress();
  const { user } = useAuth();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];

  const [newNote, setNewNote] = useState<Record<string, string>>({});
  const [uploads, setUploads] = useState<UploadedNote[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].name);
    }
  }, [subjects]);

  const fetchUploads = async () => {
    const { data } = await supabase
      .from("uploaded_notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUploads(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      toast({ title: "Allowed: PDF, JPG, PNG, DOC, DOCX", variant: "destructive" });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large (max 20MB)", variant: "destructive" });
      return;
    }

    setUploading(true);
    const filePath = `${user.id}/notes/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("student-uploads")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const displayName = user.user_metadata?.display_name || "Anonymous";

    const { error: dbError } = await supabase.from("uploaded_notes").insert({
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      subject: selectedSubject,
      uploaded_by_name: displayName,
    });

    if (dbError) {
      toast({ title: "Failed to save record", variant: "destructive" });
    } else {
      toast({ title: "Notes uploaded successfully!" });
      fetchUploads();
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (upload: UploadedNote) => {
    await supabase.storage.from("student-uploads").remove([upload.file_path]);
    await supabase.from("uploaded_notes").delete().eq("id", upload.id);
    toast({ title: "Deleted successfully" });
    fetchUploads();
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("student-uploads").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAddNote = (unitId: string) => {
    const note = newNote[unitId]?.trim();
    if (note) {
      addNote(unitId, note);
      setNewNote(prev => ({ ...prev, [unitId]: "" }));
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <StickyNote className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">My Notes</h1>
          <p className="text-sm text-muted-foreground">Semester {semester} · Quick revision notes by subject</p>
        </div>
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
                <h3 className="font-semibold">Share Your Notes</h3>
                <p className="text-xs text-muted-foreground">Upload study notes to help fellow students (PDF, DOC, images)</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
        <div className="space-y-3 animate-fade-in-up">
          <h2 className="text-lg font-semibold">Community Shared Notes</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {uploads.map((upload) => (
              <Card key={upload.id} className="shadow-sm hover:shadow-md transition-all">
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
                        <Badge variant="outline" className="text-[10px]">{upload.subject}</Badge>
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

      {/* Text Notes by Subject */}
      {subjects.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No subjects available for this semester.</p>
      )}

      {subjects.map((subject, si) => (
        <Card key={subject.id} className="shadow-sm animate-fade-in-up" style={{ animationDelay: `${si * 80}ms` }}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{subject.name}</CardTitle>
              <Badge variant="secondary" className="text-[10px] ml-auto">{subject.code}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subject.units.map(unit => {
              const defaultNotes = unit.notes || [];
              const custom = userNotes[unit.id] || [];
              const allNotes = [...defaultNotes, ...custom];

              return (
                <div key={unit.id} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{unit.name}</p>
                  {allNotes.length > 0 ? (
                    <ul className="space-y-1.5 pl-1">
                      {allNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-0.5">•</span>
                          <span className="flex-1">{note}</span>
                          {i >= defaultNotes.length && (
                            <Button
                              variant="ghost" size="icon" className="h-6 w-6 shrink-0"
                              onClick={() => removeNote(unit.id, i - defaultNotes.length)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No notes yet</p>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a note..."
                      value={newNote[unit.id] || ""}
                      onChange={e => setNewNote(prev => ({ ...prev, [unit.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleAddNote(unit.id)}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" className="h-8 px-3" onClick={() => handleAddNote(unit.id)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
