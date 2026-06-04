import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { generateEmail } from "@/lib/ai.functions";
import { PageHeader } from "@/components/PageHeader";
import { AiResult } from "@/components/AiResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Aura AI" },
      { name: "description", content: "Generate professional emails tuned for any audience and tone." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Professional", "Friendly", "Persuasive", "Concise", "Apologetic", "Enthusiastic"] as const;

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [keyPoints, setKeyPoints] = useState("");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { purpose, audience, tone, keyPoints } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !audience.trim()) {
      toast.error("Purpose and audience are required.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={<Mail className="h-5 w-5" />}
        title="Smart Email Generator"
        description="Describe the email and Aura will draft it in the right tone for your audience."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <Label htmlFor="purpose">Purpose of email *</Label>
              <Textarea
                id="purpose"
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Follow up with a prospect after our product demo and propose next steps."
                maxLength={2000}
              />
            </div>
            <div>
              <Label htmlFor="audience">Audience *</Label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. VP of Marketing at a B2B SaaS company"
                maxLength={200}
              />
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as (typeof TONES)[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="kp">Key points (optional)</Label>
              <Textarea
                id="kp"
                rows={3}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Bullet points or notes to weave into the email."
                maxLength={2000}
              />
            </div>
            <Button type="submit" disabled={mutation.isPending} className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              {mutation.isPending ? "Generating…" : "Generate Email"}
            </Button>
          </div>
        </form>

        <AiResult
          content={mutation.data?.content}
          loading={mutation.isPending}
          error={mutation.error?.message}
          emptyHint="Fill in the brief and your draft email will appear here."
        />
      </div>
    </div>
  );
}
