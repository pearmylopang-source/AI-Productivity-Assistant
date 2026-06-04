import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, Sparkles, MessageSquare, ArrowUpRight } from "lucide-react";
import { AiDisclaimer } from "@/components/AiDisclaimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aura AI Workplace Assistant" },
      {
        name: "description",
        content: "Your AI-powered workspace for emails, meetings, planning, and research.",
      },
    ],
  }),
  component: Dashboard,
});

const features = [
  {
    title: "Smart Email Generator",
    desc: "Draft emails tuned for any audience and tone in seconds.",
    href: "/email",
    icon: Mail,
  },
  {
    title: "Meeting Notes Summarizer",
    desc: "Turn messy notes into key points, decisions, and action items.",
    href: "/notes",
    icon: FileText,
  },
  {
    title: "AI Task Planner",
    desc: "Prioritize your day with a smart, time-blocked schedule.",
    href: "/tasks",
    icon: ListChecks,
  },
  {
    title: "AI Research Assistant",
    desc: "Get structured briefings with insights, pros & cons, and next steps.",
    href: "/research",
    icon: Sparkles,
  },
  {
    title: "AI Chat",
    desc: "An always-on assistant for any workplace question.",
    href: "/chat",
    icon: MessageSquare,
  },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-10 overflow-hidden rounded-2xl border bg-card p-8 shadow-sm md:p-10">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Get more done with <span className="text-gradient">Aura AI</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
          A suite of AI tools to draft communications, plan your day, summarize meetings, and
          accelerate research — all in one clean workspace.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/email"
            className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            <Mail className="h-4 w-4" /> Draft an email
          </Link>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            <MessageSquare className="h-4 w-4" /> Open AI chat
          </Link>
        </div>
      </section>

      <h2 className="mb-4 text-lg font-semibold tracking-tight">Tools</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.href}
            to={f.href}
            className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <AiDisclaimer />
      </div>
    </div>
  );
}
