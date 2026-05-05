
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS branch text,
  ADD COLUMN IF NOT EXISTS specialization text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS college_name text,
  ADD COLUMN IF NOT EXISTS year integer,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.mock_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  sections jsonb NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  grading jsonb,
  total_marks integer NOT NULL DEFAULT 70,
  scored_marks numeric,
  time_taken_seconds integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their mock results"
  ON public.mock_test_results FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_mock_test_results_updated_at
  BEFORE UPDATE ON public.mock_test_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
