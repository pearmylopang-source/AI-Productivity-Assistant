import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { planTasks } from "@/lib/ai.functions";
import { PageHeader } from "@/components/PageHeader";
import { AiResult } from "@/components/AiResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Aura AI" },
      { name: "description", content: "Prioritize your day with a smart, time-blocked AI schedule." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const fn = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState(8);
  const [context, setContext] = useState("");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { tasks, hoursAvailable: hours, context } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tasks.trim().length < 5) {
      toast.error("Add at least one task.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={<ListChecks className="h-5 w-5" />}
        title="AI Task Planner"
        description="Dump your tasks. Aura prioritizes them and builds a realistic time-blocked plan."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <Label htmlFor="tasks">Your tasks *</Label>
              <Textarea
                id="tasks"
                rows={9}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder={"Prepare board deck\nReview PR for billing service\nDraft Q4 hiring plan\nCall designer about onboarding"}
                maxLength={5000}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours">Hours available</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                />
              </div>
              <div>
                <Label htmlFor="ctx">Context (optional)</Label>
                <Input
                  id="ctx"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. low energy day"
                  maxLength={500}
                />
              </div>
            </div>
            <Button type="submit" disabled={mutation.isPending} className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              {mutation.isPending ? "Planning…" : "Plan My Day"}
            </Button>
          </div>
        </form>

        <AiResult
          content={mutation.data?.content}
          loading={mutation.isPending}
          error={mutation.error?.message}
          emptyHint="Your prioritized plan and schedule will appear here."
        />
      </div>
    </div>
  );
}
