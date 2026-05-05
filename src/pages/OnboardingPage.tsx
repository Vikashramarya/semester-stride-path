import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  initial?: any;
  onComplete: () => void;
  isCoverSheet?: boolean;
}

export default function OnboardingPage({ initial, onComplete, isCoverSheet }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    branch: "B.Tech",
    specialization: "Computer Science & Engineering",
    age: "" as string | number,
    gender: "",
    college_name: "",
    year: 2,
    semester: 3,
  });

  useEffect(() => {
    if (initial) {
      setForm({
        display_name: initial.display_name || "",
        branch: initial.branch || "B.Tech",
        specialization: initial.specialization || "Computer Science & Engineering",
        age: initial.age ?? "",
        gender: initial.gender || "",
        college_name: initial.college_name || "",
        year: initial.year || 2,
        semester: initial.semester || 3,
      });
    }
  }, [initial]);

  const update = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!user) return;
    if (!form.display_name.trim() || !form.college_name.trim() || !form.gender || !form.age) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name.trim(),
        branch: form.branch,
        specialization: form.specialization,
        age: Number(form.age),
        gender: form.gender,
        college_name: form.college_name.trim(),
        year: Number(form.year),
        semester: Number(form.semester),
        onboarding_completed: true,
      })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast({ title: "Could not save details", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome aboard! 🎉", description: "Your profile has been saved." });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-background to-cyan-50 dark:from-indigo-950/40 dark:via-background dark:to-cyan-950/40 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl border-0 shadow-2xl glass-strong animate-fade-in-up">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg mb-2">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            {isCoverSheet ? "Exam Cover Sheet" : "Welcome to Sankalp"}
          </CardTitle>
          <CardDescription>
            {isCoverSheet
              ? "Verify your details before starting the mock test"
              : "Tell us about yourself to personalize your study experience"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={form.display_name} onChange={e => update("display_name", e.target.value)} placeholder="e.g. Rohan Sharma" maxLength={80} />
            </div>
            <div>
              <Label htmlFor="branch">Branch *</Label>
              <Select value={form.branch} onValueChange={v => update("branch", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="B.Tech">B.Tech</SelectItem>
                  <SelectItem value="M.Tech">M.Tech</SelectItem>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="MCA">MCA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="spec">Specialization *</Label>
              <Select value={form.specialization} onValueChange={v => update("specialization", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science & Engineering">Computer Science & Engineering</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="AI & ML">AI & ML</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Electronics & Communication">Electronics & Communication</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input id="age" type="number" min={15} max={60} value={form.age} onChange={e => update("age", e.target.value)} placeholder="e.g. 19" />
            </div>
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={form.gender} onValueChange={v => update("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="college">College Name *</Label>
              <Input id="college" value={form.college_name} onChange={e => update("college_name", e.target.value)} placeholder="e.g. Gurugram University" maxLength={120} />
            </div>
            <div>
              <Label htmlFor="year">Year *</Label>
              <Select value={String(form.year)} onValueChange={v => update("year", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(y => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sem">Semester *</Label>
              <Select value={String(form.semester)} onValueChange={v => update("semester", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={submit} disabled={loading} className="w-full h-11 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {isCoverSheet ? "Confirm & Start Exam" : "Continue to Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
