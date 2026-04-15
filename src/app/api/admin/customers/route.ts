import { requireAdmin } from "@/lib/auth";
import { prismaErrorResponse } from "@/lib/api/errors";
import { formatCustomer } from "@/lib/api/format";
import { parseRecordStatus } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const customers = await prisma.customer.findMany({
    include: { user: true },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({ customers: customers.map(formatCustomer) });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);

  if (error) {
    return error;
  }

  const data = customerData(await req.json().catch(() => ({})));

  if (
    !data.company ||
    !data.contactName ||
    !data.phone ||
    !data.address ||
    !data.taxOffice ||
    !data.taxNumber ||
    !data.username ||
    !data.password
  ) {
    return NextResponse.json({ error: "Lütfen tüm alanları doldurun." }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        company: data.company,
        contactName: data.contactName,
        phone: data.phone,
        address: data.address,
        taxOffice: data.taxOffice,
        taxNumber: data.taxNumber,
        status: data.status,
        user: {
          create: {
            username: data.username,
            password: hashPassword(data.password),
            role: "customer",
            status: data.status,
          },
        },
      },
      include: { user: true },
    });

    return NextResponse.json({ customer: formatCustomer(customer) }, { status: 201 });
  } catch (caught) {
    const response = prismaErrorResponse(caught);
    if (response) return response;
    throw caught;
  }
}
