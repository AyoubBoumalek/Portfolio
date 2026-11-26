import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

function detectExtension(bytes: Buffer): string | null {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return ".png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ".jpg";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return ".webp";
  if (bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))) return ".gif";
  if (bytes.length >= 5 && bytes.toString("ascii", 0, 5) === "%PDF-") return ".pdf";
  return null;
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data with a file field." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a file to upload using the file field." }, { status: 400 });
  }
  if (!acceptedTypes.has(file.type)) {
    return NextResponse.json({ error: "Allowed formats are JPEG, PNG, WebP, GIF, and PDF." }, { status: 415 });
  }

  const isPdf = file.type === "application/pdf";
  const maxBytes = isPdf ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.size === 0 || file.size > maxBytes) {
    return NextResponse.json(
      { error: isPdf ? "PDF files must be 10 MB or smaller." : "Images must be 5 MB or smaller." },
      { status: 413 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = detectExtension(bytes);
  const mimeExtensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
  };
  if (!extension || extension !== mimeExtensions[file.type]) {
    return NextResponse.json({ error: "The file contents do not match the selected file type." }, { status: 415 });
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  const filename = `${randomUUID()}${extension}`;
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), bytes, { flag: "wx" });

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
