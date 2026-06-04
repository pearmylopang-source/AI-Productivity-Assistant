import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { summarizeMeeting } from "@/lib/ai.functions";
import { PageHeader } from "@/components/PageHeader";
import { AiResult } from "@/components/AiResult";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Aura AI" },
      { name: "description", content: "Turn raw meeting notes into key points, decisions, and action items." },
    ],
  }),
  component: NotesPage,
});

const SAMPLE = `Q3 product review — Aug 14
Attendees: Priya (PM), Marco (Eng), Lin (Design), Sam (Sales)

- Marco walked through the new onboarding flow. Drop-off down 18% in beta.
- Lin shared revised empty states — agreed to ship by next sprint.
- Sam pushed for a self-serve trial; Priya will scope it.
- Pricing experiment results delayed; expected Friday.
- Decision: cut "team workspaces" from v2 launch.
- Risk: hiring for senior backend still open.`;

function NotesPage() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { notes } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim().length < 20) {
      toast.error("Please paste at least a short meeting note.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        title="Meeting Notes Summarizer"
        description="Paste raw notes or a transcript. Aura extracts the summary, decisions, and action items."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <Label htmlFor="notes">Meeting notes</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setNotes(SAMPLE)}
            >
              Try sample
            </Button>
          </div>
          <Textarea
            id="notes"
            rows={16}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste meeting notes or a transcript here…"
            maxLength={20000}
            className="font-mono text-[13px]"
          />
          <Button type="submit" disabled={mutation.isPending} className="mt-4 w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {mutation.isPending ? "Summarizing…" : "Summarize Meeting"}
          </Button>
        </form>

        <AiResult
          content={mutation.data?.content}
          loading={mutation.isPending}
          error={mutation.error?.message}
          emptyHint="Your structured summary will appear here."
        />
      </div>
    </div>
  );
}
