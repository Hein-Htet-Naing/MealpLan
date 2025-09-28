import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(
  ["/", "/sign-up(.*)?", "/subscribe(.*)?"]
  // Public routes that don't require authentication
);

const isSignUpRoute = createRouteMatcher(["/sign-up(.*)?"]);

export default clerkMiddleware(async (auth, req) => {
  const userAuth = await auth();
  const { userId } = userAuth;
  const { pathname, origin } = req.nextUrl;

  if (!isPublicRoute(req) && !userId) {
    //if not authenticated and not in a public route, redirect to sign-in
    return NextResponse.redirect(new URL("/sign-up", origin));
  }
  if (isSignUpRoute(req) && userId) {
    return NextResponse.redirect(new URL("/subscribe", origin));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
