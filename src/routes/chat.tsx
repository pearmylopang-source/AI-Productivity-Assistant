import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send, Bot, User, Loader2, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { chat } from "@/lib/ai.functions";
import { PageHeader } from "@/components/PageHeader";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Aura AI" },
      { name: "description", content: "An always-on AI assistant for any workplace question." },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const fn = useServerFn(chat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (history: Msg[]) => fn({ data: { messages: history } }),
    onSuccess: (data) => {
      setMessages((m) => [...m, { role: "assistant", content: data.content }]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mutation.isPending]);

  const send = () => {
    const text = input.trim();
    if (!text || mutation.isPending) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    mutation.mutate(next);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col" style={{ height: "calc(100vh - 8rem)" }}>
      <PageHeader
        icon={<MessageSquare className="h-5 w-5" />}
        title="AI Chat"
        description="Ask Aura anything — drafting, planning, brainstorming, or quick research."
      />

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                <Bot className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-medium">Start a conversation with Aura</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Try: "Summarize the pros and cons of async standups" or "Help me prep for a salary
                negotiation."
              </p>
            </div>
          ) : (
            messages.map((m, i) => <ChatBubble key={i} msg={m} />)
          )}

          {mutation.isPending && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-background p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aura anything…"
              rows={2}
              maxLength={8000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              className="min-h-[44px] resize-none"
            />
            <Button onClick={send} disabled={mutation.isPending || !input.trim()} className="gap-1">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <AiDisclaimer />
      </div>
    </div>
  );
}

function ChatBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser ? "bg-accent text-accent-foreground" : "gradient-primary text-primary-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted text-foreground"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <article className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-2">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
