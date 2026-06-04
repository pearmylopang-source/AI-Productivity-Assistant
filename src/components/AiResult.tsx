import ReactMarkdown from "react-markdown";
import { Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AiDisclaimer } from "./AiDisclaimer";

export function AiResult({
  content,
  loading,
  error,
  emptyHint,
}: {
  content?: string | null;
  loading?: boolean;
  error?: string | null;
  emptyHint?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Result
        </h2>
        {content && !loading ? (
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Generating with AI…
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : content ? (
        <article className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-table:text-sm prose-th:bg-muted/60">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {emptyHint ?? "Your AI-generated output will appear here."}
        </p>
      )}

      <div className="mt-4">
        <AiDisclaimer />
      </div>
    </div>
  );
}
