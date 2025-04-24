import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const shareParam = url.searchParams.get("share");

  if (shareParam === "true") {
    const binderId = url.pathname.split("/").pop();
    if (binderId) {
      const response = NextResponse.next();
      response.cookies.set("shared_binder", binderId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/recipe-binders/:id*",
};
