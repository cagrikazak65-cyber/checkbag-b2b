import { requireAdmin } from "@/lib/auth";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

function getUploadDirectory() {
  const configuredDir = process.env.UPLOAD_DIR?.trim();

  if (configuredDir) {
    return configuredDir;
  }

  return path.join(process.cwd(), "public", "uploads", "products");
}

function getPublicUrl(fileName: string) {
  const basePath = process.env.UPLOAD_URL_BASE?.trim() || "/uploads/products";
  const normalizedBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;
  return `${normalizedBasePath.replace(/\/$/, "")}/${fileName}`;
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Görsel dosyası bulunamadı." }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);

  if (!extension) {
    return NextResponse.json({ error: "Sadece jpg, png, webp veya gif yüklenebilir." }, { status: 400 });
  }

  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "Görsel boyutu 3 MB sınırını aşamaz." }, { status: 400 });
  }

  const uploadDir = getUploadDirectory();
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  const url = getPublicUrl(fileName);

  return NextResponse.json(
    {
      url,
      imageUrl: url,
      imagePath: `uploads/products/${fileName}`,
    },
    { status: 201 }
  );
}
