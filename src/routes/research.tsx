import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { researchTopic } from "@/lib/ai.functions";
import { PageHeader } from "@/components/PageHeader";
import { AiResult } from "@/components/AiResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Aura AI" },
      { name: "description", content: "Get structured briefings with insights, pros & cons, and next steps." },
    ],
  }),
  component: ResearchPage,
});

const DEPTHS = ["Quick brief", "Standard", "Deep dive"] as const;

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<(typeof DEPTHS)[number]>("Standard");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { topic, depth } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim().length < 3) {
      toast.error("Enter a topic to research.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={<Sparkles className="h-5 w-5" />}
        title="AI Research Assistant"
        description="Get a clean executive briefing on any topic, with key insights and next steps."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. RAG vs fine-tuning for enterprise search"
                maxLength={500}
              />
            </div>
            <div>
              <Label>Depth</Label>
              <Select value={depth} onValueChange={(v) => setDepth(v as (typeof DEPTHS)[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPTHS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={mutation.isPending} className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              {mutation.isPending ? "Researching…" : "Generate Briefing"}
            </Button>
          </div>
        </form>

        <AiResult
          content={mutation.data?.content}
          loading={mutation.isPending}
          error={mutation.error?.message}
          emptyHint="Your structured research briefing will appear here."
        />
      </div>
    </div>
  );
}
