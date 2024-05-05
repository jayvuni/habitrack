import { setCookie } from "cookies-next";
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  console.log("checked for token");
  if (!request.cookies.has("TokenLog")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (request.url.includes("/logout")) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("TokenLog");

    return response;
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/app/:path*",
};
