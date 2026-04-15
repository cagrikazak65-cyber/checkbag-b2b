import { readSessionToken, SESSION_COOKIE } from "@/lib/security";
import { NextResponse, type NextRequest } from "next/server";

const CUSTOMER_ONLY_PATHS = ["/cart", "/checkout", "/orders"];

function isCustomerOnlyPath(pathname: string) {
  return CUSTOMER_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function redirectTo(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(loginUrl);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    if (!session || !session.role) {
      return NextResponse.next();
    }

    return redirectTo(request, session.role === "admin" ? "/admin" : "/products");
  }

  if (!session) {
    return redirectToLogin(request);
  }

  if (pathname.startsWith("/admin") && !session.role) {
    return redirectToLogin(request);
  }

  if (pathname.startsWith("/admin") && session.role === "customer") {
    return redirectTo(request, "/products");
  }

  if (isCustomerOnlyPath(pathname) && !session.role) {
    return redirectToLogin(request);
  }

  if (isCustomerOnlyPath(pathname) && session.role === "admin") {
    return redirectTo(request, "/admin");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/products/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/login",
  ],
};
