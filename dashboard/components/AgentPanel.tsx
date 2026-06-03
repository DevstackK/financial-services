"use client";
import { useState, useRef } from "react";

interface Props {
  agent: string;
  defaultPrompt: string;
  acceptFiles?: string;
  fileLabel?: string;
}

export default function AgentPanel({ agent, defaultPrompt, acceptFiles, fileLabel }: Props) {
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function run() {
    setRunning(true);
    setOutput("");
    try {
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, message: prompt, fileContent, fileName }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput(prev => prev + decoder.decode(value));
      }
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">Run Agent</span>
        {running && <span className="text-xs text-indigo-500 animate-pulse">● thinking…</span>}
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
        <button onClick={run} disabled={running}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {running ? "Running…" : "Run Now"}
        </button>
      </div>
      {output && (
        <div className="px-5 pb-5">
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-auto border border-gray-200">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
