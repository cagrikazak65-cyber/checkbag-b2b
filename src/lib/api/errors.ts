import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

function targetIncludes(target: unknown, field: string) {
  return Array.isArray(target) && target.includes(field);
}

export function prismaErrorResponse(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  if (error.code === "P2002") {
    const target = error.meta?.target;

    if (targetIncludes(target, "username")) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten kullanılıyor." },
        { status: 409 }
      );
    }

    if (targetIncludes(target, "company")) {
      return NextResponse.json(
        { error: "Bu firma adı zaten kayıtlı." },
        { status: 409 }
      );
    }

    if (targetIncludes(target, "taxNumber")) {
      return NextResponse.json(
        { error: "Bu vergi numarası zaten kayıtlı." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Bu kayıt sistemde zaten bulunuyor." },
      { status: 409 }
    );
  }

  if (error.code === "P2003") {
    return NextResponse.json(
      { error: "Bu kayıt başka işlemlerde kullanıldığı için silinemez." },
      { status: 409 }
    );
  }

  if (error.code === "P2025") {
    return NextResponse.json(
      { error: "İşlem yapılacak kayıt bulunamadı." },
      { status: 404 }
    );
  }

  return null;
}
