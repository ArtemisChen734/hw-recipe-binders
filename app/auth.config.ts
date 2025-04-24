import type { NextAuthConfig } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from './db';
import { NextRequest } from "next/server";
import { auth } from "@/app/auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
	adapter: DrizzleAdapter(db),
  providers: [],
	session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/recipe-binders");
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnRegister = nextUrl.pathname.startsWith("/register");
      const isOnShare = nextUrl.searchParams.has("shareid");

      // 如果是分享链接，允许访问
      if (isOnShare) {
        return true;
      }

      // 如果是登录或注册页面，已登录用户重定向到首页
      if ((isOnLogin || isOnRegister) && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // 如果是其他页面，未登录用户重定向到登录页
      if (isOnDashboard && !isLoggedIn && !isOnShare) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
		session: ({ session, token }) => {
			if (token && session.user) {
				session.user.id = token.sub!;
			}
      return session;
    },
		jwt: ({ token, user }) => {
			if (user) {
				token.sub = user.id;
			}
			return token;
		},
  },
} satisfies NextAuthConfig;

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isShareLink = request.nextUrl.pathname.startsWith("/shared/");
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");

  // If it's a share link, allow access
  if (isShareLink) {
    return;
  }

  // If it's login or register page, redirect logged in users to home
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/", request.url));
  }

  // For other pages, redirect unauthenticated users to login
  if (!isAuthPage && !isLoggedIn) {
    return Response.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};