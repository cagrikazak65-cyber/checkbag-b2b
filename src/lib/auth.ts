import { isRecordStatus, isUserRole, type RecordStatus, type UserRole } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { readSessionToken, SESSION_COOKIE } from "@/lib/security";
import type { NextRequest } from "next/server";

export type SessionUser = {
  id: number;
  username: string;
  role: UserRole;
  status: RecordStatus;
  company: string;
  customerId: number | null;
};

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const session = readSessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { customer: true },
  });

  if (!user || !isUserRole(user.role) || !isRecordStatus(user.status) || user.status !== "Aktif") {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    status: user.status,
    company: user.customer?.company ?? "Check Bag",
    customerId: user.customer?.id ?? null,
  };
}

export async function requireUser(req: NextRequest) {
  const user = await getSessionUser(req);

  if (!user) {
    return { user: null, error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, error: null };
}

export async function requireAdmin(req: NextRequest) {
  const { user, error } = await requireUser(req);

  if (error || !user) {
    return { user: null, error };
  }

  if (user.role !== "admin") {
    return { user: null, error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, error: null };
}

export async function requireCustomer(req: NextRequest) {
  const { user, error } = await requireUser(req);

  if (error || !user) {
    return { user: null, error };
  }

  if (user.role !== "customer" || !user.customerId) {
    return { user: null, error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, error: null };
}
