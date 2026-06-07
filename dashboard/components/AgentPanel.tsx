"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  agent: string;
  defaultPrompt: string;
  promptKey?: string;       // when this changes, reset the editable prompt
  cacheKey?: string;        // localStorage key for caching output + timestamp
  scheduleHours?: number;   // auto-rerun when cached output is older than this
  disabled?: boolean;
  acceptFiles?: string;
  fileLabel?: string;
  renderOutput?: (output: string) => React.ReactNode; // custom output renderer
}

interface AgentError {
  title: string;
  detail: string;
  hint: string;
  retryable: boolean;
}

function classifyError(err: unknown, status?: number): AgentError {
  const msg = err instanceof Error ? err.message : String(err);

  // Network-level failures
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ERR_NETWORK")) {
    return {
      title: "No network connection",
      detail: "The request couldn't reach the server. Check your internet connection and try again.",
      hint: "If you're on a VPN or restricted network, try disconnecting and retrying.",
      retryable: true,
    };
  }
  if (msg.includes("AbortError") || msg.includes("signal is aborted") || msg.includes("timeout")) {
    return {
      title: "Request timed out",
      detail: "The agent took too long to respond. This can happen during heavy web searches or long full scans.",
      hint: "Try a Quick Scan instead, or reduce the number of stores and products selected.",
      retryable: true,
    };
  }

  // HTTP status codes
  if (status === 401 || msg.includes("401")) {
    return {
      title: "Authentication error",
      detail: "The API key is missing or invalid. The server cannot authenticate with the AI provider.",
      hint: "Check that ANTHROPIC_API_KEY is set correctly in Vercel environment variables.",
      retryable: false,
    };
  }
  if (status === 429 || msg.includes("429") || msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("overloaded")) {
    return {
      title: "AI provider rate limit",
      detail: "Too many requests have been sent in a short period. The provider is temporarily throttling requests.",
      hint: "Wait 30–60 seconds before trying again.",
      retryable: true,
    };
  }
  if (status === 413 || msg.includes("413")) {
    return {
      title: "File too large",
      detail: "The uploaded file exceeds the 10 MB limit.",
      hint: "Split the file or export a smaller date range.",
      retryable: false,
    };
  }
  if (status === 500 || msg.includes("500")) {
    return {
      title: "Server error",
      detail: "The agent API crashed unexpectedly. This is usually a temporary issue.",
      hint: "Try again in a moment. If it keeps failing, check Vercel function logs.",
      retryable: true,
    };
  }
  if (status === 503 || msg.toLowerCase().includes("service unavailable")) {
    return {
      title: "AI service unavailable",
      detail: "The AI provider is temporarily down or experiencing an outage.",
      hint: "Check status.anthropic.com for active incidents, then retry.",
      retryable: true,
    };
  }

  // Stream-level errors appended by the server route
  if (msg.toLowerCase().includes("no response body")) {
    return {
      title: "Empty response",
      detail: "The server returned a response with no body. The function may have crashed before streaming started.",
      hint: "Retry. If the problem persists, check Vercel runtime logs.",
      retryable: true,
    };
  }

  // Fallback
  return {
    title: "Unexpected error",
    detail: msg.slice(0, 200),
    hint: "Try again. If this keeps happening, copy the error detail above and check Vercel logs.",
    retryable: true,
  };
}

function ErrorCard({ error, onRetry }: { error: AgentError; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800">{error.title}</p>
          <p className="text-sm text-red-700 mt-0.5 leading-relaxed">{error.detail}</p>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-white border border-red-100 rounded-lg px-3 py-2">
        <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-xs text-red-600 leading-relaxed">{error.hint}</p>
      </div>
      {error.retryable && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Try again
        </button>
      )}
    </div>
  );
}

function readCache(key: string): { output: string; ts: number } | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, output: string) {
  try {
    localStorage.setItem(key, JSON.stringify({ output, ts: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

function formatAge(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function AgentPanel({
  agent, defaultPrompt, promptKey, cacheKey, scheduleHours = 0, disabled = false, acceptFiles, fileLabel, renderOutput,
}: Props) {
  const [output, setOutput] = useState("");
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [agentError, setAgentError] = useState<AgentError | null>(null);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const hasAutoRun = useRef(false);

  // Reset prompt when mode switches (e.g. quick ↔ full)
  useEffect(() => {
    setPrompt(defaultPrompt);
  }, [promptKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load cached output on mount + handle auto-schedule
  useEffect(() => {
    if (!cacheKey) return;
    const cached = readCache(cacheKey);
    if (cached) {
      setOutput(cached.output);
      setCachedAt(cached.ts);

      // Auto-rerun if schedule is set and cache is stale
      if (scheduleHours > 0 && !hasAutoRun.current) {
        const ageHours = (Date.now() - cached.ts) / 3600000;
        if (ageHours >= scheduleHours) {
          hasAutoRun.current = true;
          run(defaultPrompt, true);
        }
      }
    } else if (scheduleHours > 0 && !hasAutoRun.current) {
      // No cache at all — auto-run immediately if scheduled
      hasAutoRun.current = true;
      run(defaultPrompt, true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [output.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("agent", agent);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setFileName(data.fileName);
    setFileContent(data.content);
  }

  async function run(promptOverride?: string, silent = false) {
    if (!silent) setOutput("");
    setAgentError(null);
    setRunning(true);
    const activePrompt = promptOverride ?? prompt;
    let fullOutput = "";
    let httpStatus: number | undefined;
    try {
      let res: Response;
      try {
        res = await fetch("/api/run-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent, message: activePrompt, fileContent, fileName }),
        });
      } catch (fetchErr) {
        // Network-level error (offline, DNS failure, CORS, etc.)
        throw Object.assign(fetchErr instanceof Error ? fetchErr : new Error(String(fetchErr)), { _httpStatus: undefined });
      }

      httpStatus = res.status;

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        const clean = errText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
        throw Object.assign(new Error(clean || `HTTP ${res.status}`), { _httpStatus: res.status });
      }
      if (!res.body) throw Object.assign(new Error("No response body"), { _httpStatus: res.status });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullOutput += chunk;
        setOutput(prev => prev + chunk);
      }

      // Check if the stream itself ended with an inline error (appended by route.ts catch)
      if (fullOutput.trimEnd().match(/\n\nError: .+$/)) {
        const inlineErr = fullOutput.trimEnd().match(/\n\nError: (.+)$/)?.[1] ?? "Agent error";
        setAgentError(classifyError(new Error(inlineErr), httpStatus));
        return;
      }

      // Cache the completed output
      if (cacheKey && fullOutput) {
        writeCache(cacheKey, fullOutput);
        setCachedAt(Date.now());
      }
    } catch (err) {
      const status = (err as { _httpStatus?: number })._httpStatus ?? httpStatus;
      setAgentError(classifyError(err, status));
    } finally {
      setRunning(false);
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Run Agent</span>
          {running && <span className="text-xs text-indigo-500 animate-pulse">● thinking…</span>}
        </div>
        {cachedAt && !running && (
          <span className="text-xs text-gray-400">
            Last run: {formatAge(cachedAt)}
            {scheduleHours > 0 && ` · auto-refreshes every ${scheduleHours}h`}
          </span>
        )}
      </div>
      <div className="p-5 space-y-3">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Instructions for the agent…"
        />
        {acceptFiles && (
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500 font-medium">{fileLabel ?? "Upload file:"}</label>
            <input ref={fileRef} type="file" accept={acceptFiles} onChange={handleFile}
              className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {fileName && <span className="text-xs text-green-600">✓ {fileName}</span>}
          </div>
        )}
        <button onClick={() => run()} disabled={running || disabled}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {running ? "Running…" : "Run Now"}
        </button>
      </div>

      {agentError && !running && (
        <div className="px-5 pb-5">
          <ErrorCard error={agentError} onRetry={() => run()} />
        </div>
      )}

      {output && !agentError && (
        <div ref={outputRef} className="px-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Report Output</span>
            <button
              onClick={copyOutput}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-md px-2.5 py-1 transition-colors hover:border-indigo-300"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          {renderOutput ? (
            renderOutput(output)
          ) : (
            <div className="prose prose-sm max-w-none border border-gray-100 rounded-xl p-5 bg-gray-50
              prose-headings:text-gray-800 prose-headings:font-semibold
              prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-strong:text-gray-900
              prose-table:text-sm prose-table:w-full
              prose-th:text-left prose-th:font-semibold prose-th:text-gray-600 prose-th:pb-2 prose-th:border-b prose-th:border-gray-200
              prose-td:py-2 prose-td:border-b prose-td:border-gray-100 prose-td:text-gray-700
              prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:text-amber-800
              prose-code:text-indigo-700 prose-code:bg-indigo-50 prose-code:rounded prose-code:px-1
              prose-ul:text-gray-700 prose-li:my-0.5
              prose-hr:border-gray-200">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
