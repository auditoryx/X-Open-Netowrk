import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { cert, getApps, initializeApp } from "firebase-admin/app";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: "auditory-x-open-network",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function middleware(req: NextRequest) {
  const session = req.cookies.get("__session")?.value;
  const url = new URL(req.url);

  if (!session) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  try {
    const decoded = await getAuth().verifySessionCookie(session, true);
    const role = decoded.role;

    const dashboardPath = url.pathname.split("/")[2]; // e.g. /dashboard/artist → "artist"

    if (url.pathname.startsWith("/dashboard")) {
      if (dashboardPath && role !== dashboardPath) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/auth", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
