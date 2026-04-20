import { isUserRole } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashPassword,
  isPasswordHash,
  SESSION_COOKIE,
  sessionCookieOptions,
  sessionMaxAge,
  verifyPassword,
} from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "").trim();

    if (!username || !password) {
      return NextResponse.json({ error: "Kullanıcı adı ve şifre zorunludur." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { customer: true },
    });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Kullanıcı adı veya şifre yanlış." }, { status: 401 });
    }

    if (!isPasswordHash(user.password)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashPassword(password) },
      });
    }

    if (user.status !== "Aktif" || user.customer?.status === "Pasif") {
      return NextResponse.json(
        { error: "Bu hesap pasif durumda. Lütfen yönetici ile iletişime geçin." },
        { status: 403 }
      );
    }

    if (!isUserRole(user.role)) {
      return NextResponse.json(
        { error: "Bu hesap için geçersiz rol tanımı var." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      user: {
        username: user.username,
        company: user.customer?.company ?? "Check Bag",
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id, user.role), {
      ...sessionCookieOptions,
      maxAge: sessionMaxAge,
    });

    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json(
      { error: "Giriş sırasında sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
