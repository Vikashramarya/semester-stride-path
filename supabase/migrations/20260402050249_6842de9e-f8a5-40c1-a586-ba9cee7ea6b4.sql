
-- Create storage bucket for student uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('student-uploads', 'student-uploads', true);

-- Create table to track uploaded PYQ papers
CREATE TABLE public.uploaded_pyqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  semester integer NOT NULL,
  uploaded_by_name text DEFAULT 'Anonymous',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.uploaded_pyqs ENABLE ROW LEVEL SECURITY;

-- Everyone can view uploaded PYQs
CREATE POLICY "Anyone can view uploaded PYQs" ON public.uploaded_pyqs FOR SELECT TO authenticated USING (true);
-- Users can upload their own PYQs
CREATE POLICY "Users can upload PYQs" ON public.uploaded_pyqs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Users can delete their own uploads
CREATE POLICY "Users can delete own PYQs" ON public.uploaded_pyqs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create table to track uploaded note files
CREATE TABLE public.uploaded_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  subject text NOT NULL,
  unit_name text DEFAULT '',
  uploaded_by_name text DEFAULT 'Anonymous',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.uploaded_notes ENABLE ROW LEVEL SECURITY;

-- Everyone can view uploaded notes
CREATE POLICY "Anyone can view uploaded notes" ON public.uploaded_notes FOR SELECT TO authenticated USING (true);
-- Users can upload their own notes
CREATE POLICY "Users can upload notes" ON public.uploaded_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Users can delete their own uploads
CREATE POLICY "Users can delete own notes" ON public.uploaded_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage policies
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'student-uploads');
CREATE POLICY "Anyone can view uploaded files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'student-uploads');
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'student-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
