"use client";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

/** Strip anything before the first # heading (agent chain-of-thought preamble) */
function stripPreamble(text: string): string {
  const idx = text.search(/^#/m);
  return idx > 0 ? text.slice(idx) : text;
}

/** Split markdown into sections by H2 headings so we can card each one */
function splitSections(text: string): { heading: string; body: string }[] {
  const lines = text.split("\n");
  const sections: { heading: string; body: string }[] = [];
  let current: { heading: string; body: string } | null = null;

  for (const line of lines) {
    if (/^## /.test(line)) {
      if (current) sections.push(current);
      current = { heading: line.replace(/^## /, ""), body: "" };
    } else if (/^# /.test(line)) {
      if (current) sections.push(current);
      current = { heading: line.replace(/^# /, ""), body: "", };
      // treat H1 as a title card
    } else {
      if (current) current.body += line + "\n";
      else {
        // content before first heading — treat as intro
        if (!sections.length) sections.push({ heading: "", body: "" });
        sections[0].body += line + "\n";
      }
    }
  }
  if (current) sections.push(current);
  return sections.filter(s => s.heading || s.body.trim());
}

function cellClass(raw: string): string {
  if (raw.includes("❌") || /not found|N\/A/i.test(raw)) return "text-red-500";
  if (/\d+\.\d{3}\s*KWD/i.test(raw)) return "font-semibold text-emerald-700";
  if (raw.includes("✅")) return "text-green-600";
  if (raw.includes("⚡") || raw.includes("❓") || /tbc|unknown/i.test(raw)) return "text-amber-600";
  return "text-gray-700";
}

const mdComponents: Components = {
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm border-separate border-spacing-0">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 first:rounded-tl-xl last:rounded-tr-xl">
      {children}
    </th>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children, node }) => {
    // alternate row shading
    return <tr className="hover:bg-indigo-50/40 transition-colors even:bg-gray-50/50">{children}</tr>;
  },
  td: ({ children }) => {
    const text = String(children ?? "");
    return (
      <td className={`px-4 py-2.5 border-b border-gray-100 last-of-type:border-0 ${cellClass(text)}`}>
        {children}
      </td>
    );
  },
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-gray-800 mt-3 mb-1.5 flex items-center gap-1.5">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-gray-600 leading-relaxed my-1.5">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-1 my-2 text-sm text-gray-700 list-none pl-0">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-1.5 my-0.5">
      <span className="text-indigo-400 mt-0.5 flex-shrink-0">›</span>
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl py-2 px-4 my-3 text-amber-800 text-sm">
      {children}
    </div>
  ),
  hr: () => null,
  // suppress inline code to plain text
  code: ({ children }) => <span className="font-mono text-xs text-indigo-700 bg-indigo-50 rounded px-1">{children}</span>,
};

/** Colour the card header based on content */
function sectionAccent(heading: string): string {
  if (/executive|top 3|deals/i.test(heading)) return "border-t-indigo-500";
  if (/recommended|purchase/i.test(heading)) return "border-t-emerald-500";
  if (/gap|follow.up|methodology/i.test(heading)) return "border-t-amber-400";
  if (/expiry/i.test(heading)) return "border-t-purple-400";
  return "border-t-gray-200";
}

function isTitle(heading: string): boolean {
  // H1-style: the main report title
  return /quick scan report|market scan|procurement/i.test(heading);
}

export default function MarketResearchReport({ output }: { output: string }) {
  const cleaned = stripPreamble(output);
  const sections = splitSections(cleaned);

  if (!sections.length) return null;

  return (
    <div className="space-y-3">
      {sections.map((sec, i) => {
        const title = isTitle(sec.heading);

        if (title) {
          // Banner card for the report title
          return (
            <div key={i} className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl px-5 py-4 text-white">
              <div className="text-base font-bold">{sec.heading}</div>
              {sec.body.trim() && (
                <div className="mt-1 text-indigo-200 text-xs leading-relaxed">
                  <ReactMarkdown components={{
                    p: ({ children }) => <p className="text-indigo-100 text-xs">{children}</p>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  }}>
                    {sec.body}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={i}
            className={`bg-white rounded-xl border border-gray-100 border-t-2 shadow-sm overflow-hidden ${sectionAccent(sec.heading)}`}
          >
            {sec.heading && (
              <div className="px-5 pt-4 pb-2">
                <ReactMarkdown components={mdComponents}>{`## ${sec.heading}`}</ReactMarkdown>
              </div>
            )}
            <div className="px-5 pb-4">
              <ReactMarkdown components={mdComponents}>{sec.body}</ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
}
