import { NextRequest, NextResponse } from "next/server";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const agent = formData.get("agent") as string | null;

  if (!file || !agent) {
    return NextResponse.json({ error: "Missing file or agent" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // For text-based files (CSV, TXT, XLSX exported as CSV) return as text
  // For images or PDFs return base64
  const isText =
    file.type.startsWith("text/") ||
    file.name.endsWith(".csv") ||
    file.name.endsWith(".txt");

  const content = isText
    ? buffer.toString("utf-8")
    : buffer.toString("base64");

  return NextResponse.json({
    fileName: file.name,
    fileType: file.type,
    content,
    isBase64: !isText,
    agent,
  });
}
