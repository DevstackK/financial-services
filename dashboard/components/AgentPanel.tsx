"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  agent: string;
  defaultPrompt: string;
  promptKey?: string;       // when this changes, reset the editable prompt
  cacheKey?: string;        // localStorage key for caching output + timestamp
  scheduleHours?: number;   // auto-rerun when cached output is older than this
  acceptFiles?: string;
  fileLabel?: string;
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
  agent, defaultPrompt, promptKey, cacheKey, scheduleHours = 0, acceptFiles, fileLabel,
}: Props) {
  const [output, setOutput] = useState("");
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
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
    setRunning(true);
    const activePrompt = promptOverride ?? prompt;
    let fullOutput = "";
    try {
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, message: activePrompt, fileContent, fileName }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullOutput += chunk;
        setOutput(prev => prev + chunk);
      }
      // Cache the completed output
      if (cacheKey && fullOutput) {
        writeCache(cacheKey, fullOutput);
        setCachedAt(Date.now());
      }
    } catch (err) {
      const msg = `Error: ${err instanceof Error ? err.message : "Unknown error"}`;
      setOutput(msg);
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
        <button onClick={() => run()} disabled={running}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {running ? "Running…" : "Run Now"}
        </button>
      </div>

      {output && (
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
        </div>
      )}
    </div>
  );
}
