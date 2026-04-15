import { requireAdmin } from "@/lib/auth";
import { prismaErrorResponse } from "@/lib/api/errors";
import { formatCustomer } from "@/lib/api/format";
import { parseRecordStatus } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { hashPassword, isPasswordHash } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

function customerData(body: Record<string, unknown>) {
  return {
    company: String(body.company ?? "").trim(),
    contactName: String(body.contactName ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    address: String(body.address ?? "").trim(),
    taxOffice: String(body.taxOffice ?? "").trim(),
    taxNumber: String(body.taxNumber ?? "").trim(),
    username: String(body.username ?? "").trim(),
    password: String(body.password ?? "").trim(),
    status: parseRecordStatus(body.status),
  };
}

async function getId(context: Context) {
  const params = await context.params;
  return Number(params.id);
}

export async function GET(req: NextRequest, context: Context) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const id = await getId(context);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Geçersiz müşteri." }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!customer) {
    return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ customer: formatCustomer(customer) });
}

export async function PUT(req: NextRequest, context: Context) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const id = await getId(context);
  const data = customerData(await req.json().catch(() => ({})));

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Geçersiz müşteri." }, { status: 400 });
  }

  if (
    !data.company ||
    !data.contactName ||
    !data.phone ||
    !data.address ||
    !data.taxOffice ||
    !data.taxNumber ||
    !data.username
  ) {
    return NextResponse.json({ error: "Lütfen tüm alanları doldurun." }, { status: 400 });
  }

  const existing = await prisma.customer.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
  }

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        company: data.company,
        contactName: data.contactName,
        phone: data.phone,
        address: data.address,
        taxOffice: data.taxOffice,
        taxNumber: data.taxNumber,
        status: data.status,
        user: {
          update: {
            username: data.username,
            ...(data.password
              ? {
                  password: isPasswordHash(data.password)
                    ? data.password
                    : hashPassword(data.password),
                }
              : {}),
            status: data.status,
          },
        },
      },
      include: { user: true },
    });

    return NextResponse.json({ customer: formatCustomer(customer) });
  } catch (caught) {
    const response = prismaErrorResponse(caught);
    if (response) return response;
    throw caught;
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const id = await getId(context);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Geçersiz müşteri." }, { status: 400 });
  }

  try {
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (caught) {
    const response = prismaErrorResponse(caught);
    if (response) return response;
    throw caught;
  }
}
