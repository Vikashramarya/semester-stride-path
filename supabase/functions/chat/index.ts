import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { messages: msgs, message, mode } = body;
    const messages = Array.isArray(msgs) && msgs.length
      ? msgs
      : [{ role: "user", content: String(message ?? "") }];
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = `You are Sankalp AI — a smart, friendly study assistant for B.Tech CSE students preparing for semester exams. 
You help with:
- Explaining concepts clearly and simply
- Solving doubts on any CSE subject
- Suggesting study strategies
- Providing quick summaries of topics
- Helping with coding problems

Keep answers concise, use markdown formatting, and add examples when helpful. 
If asked about non-academic topics, politely redirect to studies.`;

    if (mode === "quiz") {
      systemPrompt = `You are an expert MCQ generator for B.Tech CSE university exams.

CRITICAL OUTPUT RULES:
- Return ONLY a raw JSON array (starting with [ and ending with ]).
- NO markdown fences, NO commentary, NO leading/trailing text.
- Every object MUST have these exact keys: question (string), options (array of EXACTLY 4 plain strings without "A)" prefixes), correct (integer 0-3 indicating the correct option index), explanation (1-2 sentence string), topic (string identifying the topic).
- Generate the EXACT number of questions requested by the user.
- Make questions exam-relevant, technically accurate, with plausible distractors.`;
    }

    if (mode === "mock_paper") {
      systemPrompt = `You are a senior B.Tech CSE university examiner generating a 3-hour, 70-mark end-semester question paper.

CRITICAL OUTPUT RULES:
- Return ONLY a raw JSON object (starting with { and ending with }). NO markdown fences, NO commentary.
- Schema:
{
  "sectionA": [ { "q": "question text", "marks": 2, "unit": 1 }, ... 7 items mixed across units 1-4 ],
  "sectionB": { "unit": 1, "choices": [ { "q": "long question", "marks": 14 }, { "q": "OR alternative long question", "marks": 14 } ] },
  "sectionC": { "unit": 2, "choices": [ {...}, {...} ] },
  "sectionD": { "unit": 3, "choices": [ {...}, {...} ] },
  "sectionE": { "unit": 4, "choices": [ {...}, {...} ] }
}
- Section A: exactly 7 short-answer questions, 2 marks each, drawn proportionally from all 4 units.
- Sections B-E: each is a long question worth 14 marks with internal "OR" choice (exactly 2 alternatives).
- Questions must be exam-grade: conceptually rigorous, varied (theory, derivation, application, problem-solving).`;
    }

    if (mode === "grade") {
      systemPrompt = `You are a strict but fair B.Tech CSE university examiner grading a student's answer.

OUTPUT RULES:
- Return ONLY a raw JSON object: { "marks_awarded": <number>, "max_marks": <number>, "feedback": "<1-3 sentence constructive feedback>", "model_answer": "<concise model answer outline>" }
- NO markdown, NO commentary outside JSON.
- Award partial marks based on correctness, completeness, and clarity.
- If the answer is empty or irrelevant, award 0.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: mode !== "quiz" && mode !== "mock_paper" && mode !== "grade",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "quiz") {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      // Provide both keys for backward compatibility (content + response)
      return new Response(JSON.stringify({ content, response: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
