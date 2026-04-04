
-- Doubts table for community Q&A
CREATE TABLE public.doubts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text DEFAULT 'Anonymous',
  subject text NOT NULL,
  question text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view doubts" ON public.doubts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create doubts" ON public.doubts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own doubts" ON public.doubts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Doubt answers
CREATE TABLE public.doubt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id uuid NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text DEFAULT 'Anonymous',
  answer text NOT NULL,
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.doubt_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view answers" ON public.doubt_answers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create answers" ON public.doubt_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own answers" ON public.doubt_answers FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON public.doubt_answers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Upvotes tracking
CREATE TABLE public.doubt_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid NOT NULL REFERENCES public.doubt_answers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(answer_id, user_id)
);
ALTER TABLE public.doubt_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view upvotes" ON public.doubt_upvotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own upvotes" ON public.doubt_upvotes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own upvotes" ON public.doubt_upvotes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Test results for test series
CREATE TABLE public.test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  test_type text NOT NULL DEFAULT 'basic',
  subject text NOT NULL,
  unit_name text,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  time_taken_seconds integer NOT NULL,
  weak_topics text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own results" ON public.test_results FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime for doubts
ALTER PUBLICATION supabase_realtime ADD TABLE public.doubts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doubt_answers;
