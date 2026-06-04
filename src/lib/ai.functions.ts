import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callAI(system: string, user: string) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to your Lovable workspace.");
    const text = await res.text();
    console.error("AI gateway error:", res.status, text);
    throw new Error("The AI service is currently unavailable.");
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? "";
  return { content: String(content) };
}

/* ============ Email Generator ============ */
export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      purpose: z.string().min(1).max(2000),
      audience: z.string().min(1).max(200),
      tone: z.enum(["Professional", "Friendly", "Persuasive", "Concise", "Apologetic", "Enthusiastic"]),
      keyPoints: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const system = `You are an expert business communication assistant. You write polished, audience-appropriate emails.
Always return ONLY the email in this exact markdown format, with no preamble:

**Subject:** <subject line>

<email body with proper greeting, paragraphs, and sign-off>

Rules:
- Match the requested tone precisely.
- Tailor vocabulary and formality to the audience.
- Keep it scannable: short paragraphs, no fluff.
- Do not invent specific facts not provided by the user.`;
    const user = `Purpose: ${data.purpose}
Audience: ${data.audience}
Tone: ${data.tone}
Key points to include: ${data.keyPoints || "(none provided — infer minimally)"}`;
    return callAI(system, user);
  });

/* ============ Meeting Notes Summarizer ============ */
export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notes: z.string().min(20).max(20000) }))
  .handler(async ({ data }) => {
    const system = `You are a meeting analyst. Given raw meeting notes or a transcript, produce a clear structured summary in markdown with these exact sections in this order:

## Summary
2-4 sentence executive overview.

## Key Points
- Bulleted main discussion points.

## Decisions
- Concrete decisions made (or "None recorded").

## Action Items
A markdown table with columns: Owner | Task | Deadline. Use "Unassigned" / "Not specified" when missing.

## Risks & Open Questions
- Anything unresolved.

Be faithful to the input — never invent owners, deadlines, or facts.`;
    return callAI(system, data.notes);
  });

/* ============ Task Planner ============ */
export const planTasks = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      tasks: z.string().min(5).max(5000),
      hoursAvailable: z.number().min(1).max(24),
      context: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const system = `You are an executive productivity coach. Given a brain-dump of tasks and a daily time budget, produce a prioritized, time-blocked plan in markdown:

## Prioritized Plan
A table with columns: # | Task | Priority (P1/P2/P3) | Est. Time | Suggested Block
Order by Eisenhower-style priority (urgent + important first).

## Suggested Schedule
A clear hour-by-hour or block-by-block schedule that fits within the user's available hours. Group deep work in the morning when possible and batch shallow work.

## Notes
2-4 bullet points: tradeoffs, what was deferred, energy recommendations.

Use the MoSCoW / Eisenhower mindset. Be realistic with time estimates.`;
    const user = `Tasks (one per line or freeform):
${data.tasks}

Available hours today: ${data.hoursAvailable}
Context: ${data.context || "(none)"}`;
    return callAI(system, user);
  });

/* ============ Research Assistant ============ */
export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      topic: z.string().min(3).max(500),
      depth: z.enum(["Quick brief", "Standard", "Deep dive"]),
    }),
  )
  .handler(async ({ data }) => {
    const system = `You are a senior research analyst. Produce a structured briefing in markdown with these sections:

## Overview
A clear definition / framing in 3-5 sentences.

## Key Insights
5-8 bullet points of the most important, non-obvious takeaways.

## Pros & Cons
Two short columns or two bulleted lists.

## Notable Examples / Players
- Concrete real-world examples (companies, frameworks, studies).

## Suggested Next Steps
- Actions the reader can take to go deeper.

Be precise, neutral, and avoid hype. If you are uncertain, say so. Do not fabricate statistics — only cite figures you are confident about.`;
    const user = `Topic: ${data.topic}
Depth requested: ${data.depth}`;
    return callAI(system, user);
  });

/* ============ Chatbot ============ */
const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const chat = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      messages: z.array(ChatMessageSchema).min(1).max(40),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const system = `You are Aura, an AI workplace productivity assistant. You help professionals with email drafting, summarizing, planning, research, and general work questions.
- Be concise, structured, and use markdown.
- Prefer bullet points, short paragraphs, and tables when comparing.
- When you don't know something, say so plainly.
- Never invent facts, names, or numbers.`;

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      const t = await res.text();
      console.error("Chat error:", res.status, t);
      throw new Error("The AI service is currently unavailable.");
    }
    const json = await res.json();
    return { content: String(json?.choices?.[0]?.message?.content ?? "") };
  });
