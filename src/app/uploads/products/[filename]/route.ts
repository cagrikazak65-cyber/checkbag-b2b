import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Basit güvenlik kontrolü: klasör dışına çıkmayı engeller
  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return new NextResponse("Geçersiz dosya adı", { status: 400 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = contentTypes[ext];

  if (!contentType) {
    return new NextResponse("Desteklenmeyen dosya türü", { status: 400 });
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products",
      filename
    );

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Dosya bulunamadı", { status: 404 });
  }
}
